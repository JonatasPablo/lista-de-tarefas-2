-- Migration 007: thumbnails reais para anexos de tarefas.
-- Mantem o BLOB principal otimizado em file_data e adiciona uma miniatura leve
-- para listagens/cards sem carregar a imagem grande.

ALTER TABLE task_files
    ADD COLUMN thumbnail_data LONGBLOB NULL AFTER file_data,
    ADD COLUMN thumbnail_mime_type VARCHAR(150) NULL AFTER thumbnail_data,
    ADD COLUMN thumbnail_size_bytes INT UNSIGNED NULL AFTER thumbnail_mime_type;
