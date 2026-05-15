-- Migration 005: campos de aceite da Política de Privacidade.
-- Preserva os campos existentes de Termos de Uso.

ALTER TABLE users
    ADD COLUMN privacy_policy_version VARCHAR(30) NULL AFTER terms_accepted_user_agent,
    ADD COLUMN privacy_policy_accepted_at DATETIME NULL AFTER privacy_policy_version,
    ADD COLUMN privacy_policy_accepted_ip VARCHAR(45) NULL AFTER privacy_policy_accepted_at,
    ADD COLUMN privacy_policy_accepted_user_agent VARCHAR(500) NULL AFTER privacy_policy_accepted_ip;
