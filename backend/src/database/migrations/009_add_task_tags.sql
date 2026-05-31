-- Migration: 009_add_task_tags.sql
-- Purpose: sistema de tags por usuário

CREATE TABLE IF NOT EXISTS tags (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    nome VARCHAR(40) NOT NULL,
    cor VARCHAR(7) NOT NULL DEFAULT '#808080',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY tags_user_id_index (user_id, deleted_at),
    CONSTRAINT tags_user_id_foreign FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS task_tags (
    task_id INT(11) NOT NULL,
    tag_id INT(11) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, tag_id),
    CONSTRAINT task_tags_task_id_foreign FOREIGN KEY (task_id)
        REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT task_tags_tag_id_foreign FOREIGN KEY (tag_id)
        REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
