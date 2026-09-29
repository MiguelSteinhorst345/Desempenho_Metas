# Metas - integração com MySQL

A funcionalidade de metas usa a tabela `metas` no banco `estude_aqui` e o cookie JWT criado pelo login.

## Banco
Execute `sql/metas.sql` no MySQL caso a tabela `metas` ainda não exista.

## API
- GET /metas
- GET /metas/resumo
- GET /metas/:id
- POST /metas
- PATCH /metas/:id
- DELETE /metas/:id

Todas as rotas exigem login e usam o `usuario_id` do usuário autenticado.
