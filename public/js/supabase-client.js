/*
 * Aldijos — ponte para o Supabase.
 *
 * Fase 1 da migração: só os EVENTOS vêm de uma base de dados partilhada
 * (Postgres/Supabase), para resolverem o problema relatado — eventos
 * publicados só apareciam na máquina/navegador que os criou. O resto da
 * plataforma (utilizadores, atividades, submissões, notas) continua, por
 * agora, em localStorage — ver ADR-007 em docs/10_decisoes_tecnicas.md.
 *
 * db.events (dentro de store.js) passa a ser uma CACHE local alimentada por
 * esta ponte: publicHome()/publishedEvents()/svc.eventsAll() continuam a
 * ler dessa cache sem precisar de saber de onde os dados vêm.
 */
(function () {
  if (!window.supabase || !window.SUPABASE_URL) { console.error('Supabase não está configurado.'); return; }
  const supa = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);

  function mapEvent(r) {
    return {
      id: String(r.id), title: r.title, category: r.category || 'Evento', description: r.description || '',
      date: r.date, dateEnd: r.date_end || '', time: r.time || '', timeNote: '', place: r.place || '',
      audience: r.audience || 'Toda a comunidade escolar', courseId: r.course_id || null,
      image: r.image_url || '', published: r.published,
    };
  }

  async function fetchEvents(all) {
    let q = supa.from('events').select('*').order('date');
    if (!all) q = q.eq('published', true);
    const { data, error } = await q;
    if (error) throw error;
    return data.map(mapEvent);
  }

  async function refreshCache() {
    const staff = App.user && (App.user.role === 'ADMIN' || App.user.role === 'PROFESSOR');
    const list = await fetchEvents(!!staff);
    App.store.setEvents(list);
  }

  async function saveEvent(data) {
    const payload = {
      title: data.title, category: data.category || 'Evento', description: data.description || '',
      date: data.date, date_end: data.dateEnd || null, time: data.time || null, place: data.place || '',
      audience: data.audience || 'Toda a comunidade escolar', course_id: data.courseId || null,
      image_url: data.image || '', published: data.published !== false,
    };
    const q = data.id ? supa.from('events').update(payload).eq('id', data.id) : supa.from('events').insert(payload);
    const { error } = await q;
    if (error) throw error;
    await refreshCache();
  }

  async function toggleEvent(id) {
    const { data, error } = await supa.from('events').select('published').eq('id', id).single();
    if (error) throw error;
    const { error: err2 } = await supa.from('events').update({ published: !data.published }).eq('id', id);
    if (err2) throw err2;
    await refreshCache();
  }

  async function deleteEvent(id) {
    const { error } = await supa.from('events').delete().eq('id', id);
    if (error) throw error;
    await refreshCache();
  }

  let channel = null;
  function subscribeRealtime() {
    if (channel) return;
    channel = supa.channel('events-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => { refreshCache().catch(err => console.error(err)); })
      .subscribe();
  }

  /*
   * Catálogo público + as 5 estatísticas da homepage ("Aldijos em números") —
   * vêm agora do Supabase (cursos, módulos, atividades publicadas, contas
   * registadas, submissões corrigidas), em vez do localStorage de cada
   * browser, e atualizam-se sozinhas via Realtime.
   */
  async function fetchPublicCourses() {
    const [{ data: courses, error: cErr }, { data: modules, error: mErr }] = await Promise.all([
      supa.from('courses').select('*').order('id'),
      supa.from('modules').select('id, course_id, name').order('id'),
    ]);
    if (cErr) throw cErr; if (mErr) throw mErr;
    return courses.map(c => ({
      id: String(c.id), name: c.name, area: c.area, short: c.short, description: c.description, years: c.years, photo: c.photo,
      modules: modules.filter(m => m.course_id === c.id).map(m => m.name),
    }));
  }

  async function fetchPublicStats() {
    const { data, error } = await supa.rpc('get_public_stats').single();
    if (error) throw error;
    return { cursos: data.cursos, atividades: data.atividades, alunos: data.alunos, professores: data.professores, concluidas: data.concluidas };
  }

  async function refreshPublicHome() {
    const [courses, stats] = await Promise.all([fetchPublicCourses(), fetchPublicStats()]);
    App.store.setPublicHomeLive(courses, stats);
  }

  let homeChannel = null;
  function subscribeHomeRealtime() {
    if (homeChannel) return;
    homeChannel = supa.channel('public-home-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => refreshPublicHome().catch(e => console.error(e)))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'modules' }, () => refreshPublicHome().catch(e => console.error(e)))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => refreshPublicHome().catch(e => console.error(e)))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => refreshPublicHome().catch(e => console.error(e)))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => refreshPublicHome().catch(e => console.error(e)))
      .subscribe();
  }

  /*
   * Autenticação — mantém-se o login local (store.js, PBKDF2, continua a
   * mandar em toda a lógica de negócio ainda local: atividades, turmas,
   * notas, etc.), mas agora também se abre, com o MESMO email/password, uma
   * sessão real no Supabase Auth — é essa sessão que dá a auth.uid() usada
   * pelas políticas de segurança (is_admin(), por exemplo). Se a conta ainda
   * não existir no Supabase (primeiro login), cria-se aqui mesmo, com o
   * papel por omissão ALUNO — só muda para ADMIN/PROFESSOR com uma instrução
   * SQL pontual (ver docs/10_decisoes_tecnicas.md).
   */
  async function ensureSession(email, password) {
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (!error) return;
    const { error: signUpError } = await supa.auth.signUp({ email, password });
    if (signUpError) throw signUpError;
  }
  async function endSession() { await supa.auth.signOut(); }

  window.Supa = { client: supa, refreshCache, saveEvent, toggleEvent, deleteEvent, subscribeRealtime, ensureSession, endSession, refreshPublicHome, subscribeHomeRealtime };
})();
