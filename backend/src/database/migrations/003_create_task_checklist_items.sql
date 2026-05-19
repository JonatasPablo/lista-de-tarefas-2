CREATE TABLE IF NOT EXISTS task_checklist_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    completed_at DATETIME NULL,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_checklist_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_checklist_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_checklist_task_id (task_id),
    INDEX idx_checklist_user_id (user_id),
    INDEX idx_checklist_deleted_at (deleted_at)
);
