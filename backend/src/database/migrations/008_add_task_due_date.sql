-- Migration: 008_add_task_due_date.sql
-- Purpose: adiciona campo de data de vencimento nas tarefas
-- Date: executar após v2.1.0

ALTER TABLE tasks
    ADD COLUMN due_date DATE NULL DEFAULT NULL
    AFTER priority;

ALTER TABLE tasks
    ADD INDEX tasks_user_due_date_index (user_id, due_date, deleted_at);


