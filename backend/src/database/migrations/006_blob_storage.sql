-- Migration 006: armazenamento de avatar e anexos como BLOB no banco.
-- Necessário para ambientes com filesystem efêmero (Railway, containers sem volume persistente).
-- Os arquivos físicos em uploads/avatars e uploads/tasks não persistem entre deploys.

-- Coluna para conteúdo binário do avatar (LONGBLOB suporta até 4 GB; avatars são limitados a 20 MB no código)
ALTER TABLE users
    ADD COLUMN avatar_data LONGBLOB NULL AFTER avatar_size_bytes;

-- Coluna para conteúdo binário de cada anexo de tarefa (LONGBLOB; limite de 100 MB no código)
ALTER TABLE task_files
    ADD COLUMN file_data LONGBLOB NULL AFTER size_bytes;

-- Nota: após aplicar esta migration, configurar max_allowed_packet no MySQL para pelo menos 110 MB.
-- Exemplo no my.cnf / Railway: max_allowed_packet = 128M
-- Os registros existentes em users.avatar_path permanecem para referência histórica,
-- mas a rota /users/me/avatar passará a servir de avatar_data.
-- Usuários que já tinham avatar precisarão enviar novamente uma vez.
