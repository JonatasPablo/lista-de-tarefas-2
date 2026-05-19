-- Banco local consolidado para Lista de Tarefas 2.
-- MySQL 8+. Execute em uma instalacao local limpa quando nao for restaurar dump completo.
-- Para restaurar dados reais do Railway, prefira importar o dump e use este arquivo apenas como referencia de schema.

CREATE DATABASE IF NOT EXISTS lista_tarefas_v2
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE lista_tarefas_v2;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NULL,
    provider ENUM('local', 'google', 'apple') NOT NULL DEFAULT 'local',
    role ENUM('user', 'master') NOT NULL DEFAULT 'user',
    google_id VARCHAR(191) NULL,
    apple_id VARCHAR(191) NULL,
    avatar_path VARCHAR(500) NULL,
    avatar_original_name VARCHAR(255) NULL,
    avatar_mime_type VARCHAR(100) NULL,
    avatar_size_bytes INT NULL,
    avatar_data LONGBLOB NULL,
    profile_updated_at DATETIME NULL,
    email_verified_at DATETIME NULL,
    email_verification_token VARCHAR(64) NULL,
    email_verification_expires_at DATETIME NULL,
    password_reset_token VARCHAR(64) NULL,
    password_reset_expires_at DATETIME NULL,
    terms_accepted_at DATETIME NULL,
    terms_version VARCHAR(30) NULL,
    terms_accepted_ip VARCHAR(45) NULL,
    terms_accepted_user_agent VARCHAR(500) NULL,
    privacy_policy_version VARCHAR(30) NULL,
    privacy_policy_accepted_at DATETIME NULL,
    privacy_policy_accepted_ip VARCHAR(45) NULL,
    privacy_policy_accepted_user_agent VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY users_email_unique (email),
    UNIQUE KEY users_google_id_unique (google_id),
    UNIQUE KEY users_apple_id_unique (apple_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    last_used_at DATETIME NULL,
    revoked_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY user_sessions_token_hash_unique (token_hash),
    KEY user_sessions_user_id_index (user_id),
    CONSTRAINT user_sessions_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_terms_acceptances (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    terms_version VARCHAR(30) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY user_terms_acceptances_user_id_index (user_id),
    CONSTRAINT user_terms_acceptances_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    priority ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media',
    status ENUM('pendente', 'concluida', 'cancelada', 'arquivada') NOT NULL DEFAULT 'pendente',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY tasks_user_id_status_index (user_id, status, deleted_at),
    CONSTRAINT tasks_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(40) NOT NULL,
    old_value LONGTEXT NULL,
    new_value LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY task_history_task_id_index (task_id),
    KEY task_history_user_id_created_at_index (user_id, created_at),
    CONSTRAINT task_history_task_id_foreign
        FOREIGN KEY (task_id) REFERENCES tasks (id)
        ON DELETE CASCADE,
    CONSTRAINT task_history_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_files (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(150) NULL,
    size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
    file_data LONGBLOB NULL,
    thumbnail_data LONGBLOB NULL,
    thumbnail_mime_type VARCHAR(150) NULL,
    thumbnail_size_bytes INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY task_files_stored_name_unique (stored_name),
    KEY task_files_task_id_index (task_id, deleted_at),
    KEY task_files_user_id_index (user_id, deleted_at),
    CONSTRAINT task_files_task_id_foreign
        FOREIGN KEY (task_id) REFERENCES tasks (id)
        ON DELETE CASCADE,
    CONSTRAINT task_files_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_checklist_groups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_chk_group_task_id (task_id),
    KEY idx_chk_group_user_id (user_id),
    KEY idx_chk_group_deleted_at (deleted_at),
    CONSTRAINT fk_chk_group_task
        FOREIGN KEY (task_id) REFERENCES tasks (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_chk_group_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_checklist_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    task_id BIGINT UNSIGNED NOT NULL,
    group_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    completed_at DATETIME NULL,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_checklist_task_id (task_id),
    KEY idx_checklist_user_id (user_id),
    KEY idx_checklist_group_id (group_id),
    KEY idx_checklist_deleted_at (deleted_at),
    CONSTRAINT fk_checklist_task
        FOREIGN KEY (task_id) REFERENCES tasks (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_checklist_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_chk_item_group
        FOREIGN KEY (group_id) REFERENCES task_checklist_groups (id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY schema_migrations_filename_unique (filename)
);
