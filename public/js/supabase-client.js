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

  window.Supa = { client: supa, refreshCache, saveEvent, toggleEvent, deleteEvent, subscribeRealtime };
})();
