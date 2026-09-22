# ALDIJOS — Plataforma Assíncrona de Atividades Pedagógicas

<img src="public/img/logo-marca.png" alt="Logótipo ALDIJOS" width="120" />

Plataforma de apoio ao ensino profissional e ao ensino secundário: o professor publica atividades, o aluno responde e submete
quando lhe convém, a correção é automática (perguntas objetivas) ou feita pelo professor (respostas abertas), e o resultado e o
feedback ficam registados. Projeto académico da equipa **Aldir, José e Dinis** (o nome nasce da junção dos três).

## Estado

**Protótipo funcional.** O fluxo completo funciona ponta a ponta:
login → professor cria e publica a atividade → aluno responde e submete → correção → aluno consulta resultado e feedback.

- 3 perfis com contas próprias (Aluno, Professor, Administração); cada perfil só vê e faz o que lhe compete.
- Perguntas de escolha múltipla, verdadeiro/falso, resposta curta, resposta aberta e anexo de ficheiros.
- Página inicial pública: quem somos, como funciona, cursos, eventos por ramo e números em tempo real.
- Gestão de utilizadores, cursos, turmas, módulos, associações e eventos pela administração.
- Rodapé profissional: faixa de financiadores e certificações (logótipos brancos sem fundo), empresas parceiras e políticas (privacidade, cookies, termos, acessibilidade,
  qualidade EQAVET, regulamento interno, avaliação, FCT e PAP, oferta formativa, Livro de Reclamações).

**Limitação assumida:** não há servidor. Os dados ficam guardados no browser (`localStorage`), por isso **não são partilhados
entre computadores** e a segurança é apenas de demonstração. Ver [docs/13_auditoria_funcionalidades.md](docs/13_auditoria_funcionalidades.md)
e o ADR-007 em [docs/10_decisoes_tecnicas.md](docs/10_decisoes_tecnicas.md).

## Como executar

Requer Node.js 20 ou superior.

```bash
npm start        # http://localhost:5173
npm test         # 30 testes automatizados da camada de dados
npm run build    # gera dist/aldijos.html (ficheiro único, com as imagens incorporadas) e dist/artifact.html
```

Também funciona com qualquer servidor estático a servir a pasta `public/`.

## Publicar no Vercel

O projeto é um sítio estático (sem servidor nem dependências), por isso o deploy no Vercel não
precisa de nenhuma configuração especial:

1. Em [vercel.com/new](https://vercel.com/new), importe este repositório.
2. O ficheiro `vercel.json` na raiz já indica que a pasta a publicar é `public/` e que não há
   passo de build a correr — pode deixar tudo como o Vercel sugerir e clicar em **Deploy**.
3. Não é preciso definir nenhuma variável de ambiente.

**Aviso:** como os dados ficam em `localStorage` (ver "Limitação assumida" acima), cada
visitante do site publicado tem os seus próprios dados de demonstração, isolados dos restantes.

### Contas de demonstração

Palavra-passe de todas: `Aldijos#2026` (só para demonstração).

| Perfil | Email |
|---|---|
| Aluno | `beatriz.antunes@aldijos.pt` (turma INF11) |
| Professor | `ricardo.lima@aldijos.pt` (Bases de Dados, Desenvolvimento Web) |
| Administração | `admin@aldijos.pt` |

Há mais 35 alunos e 6 professores (mesmo formato de email). Na página de entrada, "Repor dados de demonstração" recria tudo.

## Estrutura

```
public/            aplicação (HTML, CSS, JavaScript e imagens)
  js/store.js        camada de dados: persistência, autenticação, permissões, correção
  js/seed.js         dados iniciais de demonstração
  js/ui.js, home.js, auth.js, student.js, teacher.js, admin.js, main.js   interface
tests/             testes automatizados (node:test)
scripts/           servidor local e empacotamento
docs/              análise, requisitos, casos de uso, arquitetura, modelo de dados, testes, ADRs, auditoria
```

## Segurança (o que existe e o que não existe)

- Palavras-passe com PBKDF2-SHA-256 e sal; nunca em texto simples. Bloqueio temporário após 5 tentativas falhadas.
- Todas as leituras e escritas passam por `store.as(utilizador).<método>()`, que verifica o perfil e a posse do recurso
  (um aluno não abre a submissão de outro; um professor só classifica as suas atividades). Coberto por testes.
- Textos introduzidos pelos utilizadores são escapados na interface (sem HTML injetado).
- **Não existe** proteção contra quem abrir as ferramentas de programador do browser: sem servidor, os dados locais são legíveis.

## Documentação

Tudo em [`docs/`](docs/): enunciado e análise (00–01), requisitos (02), casos de uso (03), arquitetura (04), modelo de dados (05),
mockups (06), backlog (07), testes (08), retrospetiva (09), decisões técnicas (10–11), worklog (12) e a auditoria (13).

## Rodapé: financiadores, parceiros e políticas

Editar em `public/js/legal.js`:

- `FUNDERS` — faixa de financiadores e selos (PNG branco sem fundo em `public/img/parceiros/`). **Atenção:** os logótipos institucionais
  (Portugal 2030, União Europeia, PRR, EQAVET, etc.) estão como **exemplo de layout** e a faixa diz isso mesmo. Numa escola real, manter apenas
  as entidades que a apoiam de facto e usar os ficheiros oficiais.
- `PARTNERS` — empresas parceiras (**fictícias**). Para logótipos reais: `{ name: 'Empresa', logo: 'img/parceiros/empresa.svg' }`.
- `POLICIES` — textos das políticas. São versões de demonstração e devem ser revistos pela escola (referem, por exemplo, a Portaria n.º 235-A/2018
  dos cursos profissionais; confirmar sempre a versão em vigor no Diário da República).

## Créditos das imagens

Fotografias de cursos e eventos: [Unsplash](https://unsplash.com) (licença Unsplash, uso livre). Fotografias do destaque: equipa Aldijos.
Cursos e eventos apresentados são fictícios e não representam uma escola específica.
