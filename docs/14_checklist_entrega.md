# 14 — Checklist de Entrega

Data: 2026-09-22 · Comparação com a lista oficial de entregáveis do enunciado
("Enunciado do Projeto Integrador") e com o repositório criado pelo professor
(`Gcango/equipa1_plataforma_pedagogica`).

Legenda: ✅ feito · 🟡 parcial / em curso · 🔴 por fazer

## Entregáveis

| # | Entregável | Estado | Nota |
|---|---|---|---|
| 1 | Documento de análise do problema | ✅ | `docs/01_analise_problema.md` |
| 2 | Requisitos funcionais e não funcionais | ✅ | `docs/02_requisitos.md` |
| 3 | Casos de utilização | ✅ | `docs/03_casos_de_uso.md` |
| 4 | Diagrama/modelo da base de dados | ✅ | `docs/05_modelo_dados.md` |
| 5 | Mockups ou protótipos das interfaces | ✅ | `docs/06_mockups.md` + aplicação real e navegável |
| 6 | Repositório GitHub | 🟡 | Criado; por agora só tem a pasta `docs/` numa branch (`docs/analise-e-documentacao`) |
| 7 | Código-fonte | 🔴 | Ainda não está no repositório do professor — só existe localmente e num repositório pessoal para deploy |
| 8 | README completo | 🟡 | README completo existe no projeto; falta chegar ao repositório do professor |
| 9 | Evidências de Issues, branches e Pull Requests | 🟡 | 1 Issue (#1), 1 branch, 1 Pull Request em curso |
| 10 | Aplicação/protótipo funcional | 🟡 | Funciona e foi testada localmente; falta publicá-la (Vercel) e levar o código ao repositório do professor |
| 11 | Relatório breve de testes | ✅ | `docs/08_testes.md` + 30 testes automatizados (`npm test`) |
| 12 | Apresentação final | 🔴 | Ainda não existe |
| 13 | Retrospetiva da equipa | 🟡 | Só o modelo em `docs/09_retrospectiva.md`; falta preencher com uma retrospetiva real |

## Ferramentas mínimas exigidas

| Ferramenta | Estado |
|---|---|
| Git / GitHub | ✅ |
| Issues | 🟡 Só 1 criada até agora |
| Branches | 🟡 Só 1 (`docs/analise-e-documentacao`) |
| Pull Requests | 🟡 O primeiro, em curso |
| Code Review | 🔴 Ainda ninguém reviu nada |
| README | 🟡 Falta chegar ao repositório do professor |
| Quadro Kanban | 🔴 Não criado (pode usar-se o "Projects" do GitHub) |

## Importante: dois repositórios, dois objetivos diferentes

- **`Gcango/equipa1_plataforma_pedagogica`** — o repositório oficial da entrega académica.
  É aqui que contam as Issues, branches, Pull Requests e Code Review avaliados pelo
  professor. Publicar o código noutro sítio (ver abaixo) **não substitui** enviá-lo
  também para aqui.
- **Repositório pessoal na conta `aldirpedro`** — criado só para publicar a plataforma
  online (Vercel), com uma hiperligação para mostrar aos colegas e, se quiserem, ao
  próprio professor. Não é o repositório avaliado.

## Próximos passos sugeridos

1. Terminar e submeter o Pull Request da documentação.
2. Abrir uma segunda branch/PR no repositório do professor com o código
   (`public/` → `frontend/`, `tests/` → `tests/`), para o entregável 7 e 10 ficarem completos.
3. Preencher a tabela "Equipa" do `README.md` do professor com os três nomes e os GitHub
   de cada um.
4. Criar mais Issues para dividir trabalho pelos três elementos da equipa (não deixar tudo
   numa só Issue/PR).
5. Configurar um quadro Kanban (GitHub Projects) com as User Stories de
   `docs/07_backlog.md`.
6. Preencher `docs/09_retrospectiva.md` no final do primeiro sprint real.
7. Preparar a apresentação final.
