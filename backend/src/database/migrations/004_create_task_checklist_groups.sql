-- =============================================================
-- Migration 004: Grupos de checklist (estilo Trello)
-- Preserva todos os itens existentes migrando-os para grupo padrão
-- =============================================================

-- 1. Criar tabela de grupos
CREATE TABLE IF NOT EXISTS task_checklist_groups (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    task_id      INT          NOT NULL,
    user_id      INT          NOT NULL,
    title        VARCHAR(255) NOT NULL,
    position     INT          NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NULL,
    deleted_at   DATETIME     NULL,
    CONSTRAINT fk_chk_group_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_chk_group_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_chk_group_task_id   (task_id),
    INDEX idx_chk_group_user_id   (user_id),
    INDEX idx_chk_group_deleted_at (deleted_at)
);

-- 2. Adicionar coluna group_id em task_checklist_items (nullable para não quebrar itens antigos)
ALTER TABLE task_checklist_items
    ADD COLUMN group_id INT NULL AFTER task_id,
    ADD CONSTRAINT fk_chk_item_group FOREIGN KEY (group_id) REFERENCES task_checklist_groups(id),
    ADD INDEX idx_chk_item_group_id (group_id);

-- 3. Criar grupo padrão "Checklist" para cada tarefa que possui itens não deletados
INSERT INTO task_checklist_groups (task_id, user_id, title, position)
SELECT DISTINCT i.task_id, i.user_id, 'Checklist', 0
FROM task_checklist_items i
WHERE i.deleted_at IS NULL;

-- 4. Associar itens existentes (não deletados) ao grupo padrão criado
UPDATE task_checklist_items i
JOIN task_checklist_groups g
    ON g.task_id = i.task_id
    AND g.user_id = i.user_id
    AND g.deleted_at IS NULL
SET i.group_id = g.id
WHERE i.deleted_at IS NULL
  AND i.group_id IS NULL;
