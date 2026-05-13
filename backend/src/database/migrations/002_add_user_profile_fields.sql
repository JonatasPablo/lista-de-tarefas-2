-- Profile fields for Lista de Tarefas 2.
-- Run manually on a MySQL 8+ database before using real avatar upload.

ALTER TABLE users
    ADD COLUMN avatar_path VARCHAR(500) NULL AFTER apple_id,
    ADD COLUMN avatar_original_name VARCHAR(255) NULL AFTER avatar_path,
    ADD COLUMN avatar_mime_type VARCHAR(100) NULL AFTER avatar_original_name,
    ADD COLUMN avatar_size_bytes INT NULL AFTER avatar_mime_type,
    ADD COLUMN profile_updated_at DATETIME NULL AFTER avatar_size_bytes;
