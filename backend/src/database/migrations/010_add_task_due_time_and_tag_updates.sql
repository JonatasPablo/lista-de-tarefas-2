-- Migration: 010_add_task_due_time_and_tag_updates.sql
-- Purpose: complementa Sprint 2 com horario de vencimento e metadata de tags

SET @task_due_time_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tasks'
      AND COLUMN_NAME = 'due_time'
);

SET @sql := IF(
    @task_due_time_exists = 0,
    'ALTER TABLE tasks ADD COLUMN due_time TIME NULL DEFAULT NULL AFTER due_date',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @tag_updated_at_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tags'
      AND COLUMN_NAME = 'updated_at'
);

SET @sql := IF(
    @tag_updated_at_exists = 0,
    'ALTER TABLE tags ADD COLUMN updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE tags
    MODIFY cor VARCHAR(7) NOT NULL DEFAULT '#6366f1';
