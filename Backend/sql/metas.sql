USE estude_aqui;

CREATE TABLE IF NOT EXISTS metas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    tipo ENUM('Meta diária', 'Meta semanal', 'Meta mensal') NOT NULL DEFAULT 'Meta semanal',
    prazo DATE NULL,
    status ENUM('nao_iniciada', 'andamento', 'concluida') NOT NULL DEFAULT 'nao_iniciada',
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_meta_usuario
        FOREIGN KEY (usuario_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_meta_usuario (usuario_id),
    INDEX idx_meta_usuario_status (usuario_id, status)
) ENGINE=InnoDB;
