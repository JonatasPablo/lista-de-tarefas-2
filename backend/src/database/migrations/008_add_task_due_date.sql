-- Migration: 008_add_task_due_date.sql
-- Purpose: adiciona campo de data de vencimento nas tarefas

SET @task_due_date_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tasks'
      AND COLUMN_NAME = 'due_date'
);

SET @sql := IF(
    @task_due_date_exists = 0,
    'ALTER TABLE tasks ADD COLUMN due_date DATE NULL DEFAULT NULL AFTER priority',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @tasks_user_due_date_index_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tasks'
      AND INDEX_NAME = 'tasks_user_due_date_index'
);

SET @sql := IF(
    @tasks_user_due_date_index_exists = 0,
    'ALTER TABLE tasks ADD INDEX tasks_user_due_date_index (user_id, due_date, deleted_at)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
