-- Script de inicialização do banco de dados
-- Execute este script no PostgreSQL antes de iniciar a aplicação

-- Criar banco de dados
CREATE DATABASE fisioterapia;

-- Conectar ao banco
\c fisioterapia;

-- As tabelas serão criadas automaticamente pelo Hibernate
-- Este script é apenas para referência

-- Tabela de pacientes
-- CREATE TABLE pacientes (
--     id BIGSERIAL PRIMARY KEY,
--     nome_completo VARCHAR(255) NOT NULL,
--     data_nascimento DATE,
--     genero VARCHAR(50),
--     telefone VARCHAR(20),
--     telefone_secundario VARCHAR(20),
--     endereco VARCHAR(255),
--     sobre_paciente TEXT,
--     observacoes_gerais TEXT,
--     possui_diabetes BOOLEAN DEFAULT FALSE,
--     hipertenso BOOLEAN DEFAULT FALSE
-- );

-- Tabela de consultas
-- CREATE TABLE consultas (
--     id BIGSERIAL PRIMARY KEY,
--     paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
--     data_inicio TIMESTAMP NOT NULL,
--     data_fim TIMESTAMP NOT NULL,
--     tipo_consulta VARCHAR(100),
--     status VARCHAR(50) DEFAULT 'sem_aula',
--     observacoes TEXT
-- );

-- Tabela de registros de medição
-- CREATE TABLE registros_medicao (
--     id BIGSERIAL PRIMARY KEY,
--     paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
--     data_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     pressao_arterial VARCHAR(20),
--     glicemia VARCHAR(20),
--     escala_dor VARCHAR(20),
--     saturacao_o2 VARCHAR(20),
--     bpm VARCHAR(20),
--     observacao TEXT
-- );

-- Índices para melhor performance
-- CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
-- CREATE INDEX idx_consultas_data ON consultas(data_inicio, data_fim);
-- CREATE INDEX idx_registros_paciente ON registros_medicao(paciente_id);
-- CREATE INDEX idx_registros_data ON registros_medicao(data_registro);

-- Dados de exemplo (opcional)
-- INSERT INTO pacientes (nome_completo, data_nascimento, genero, telefone, endereco, possui_diabetes) 
-- VALUES 
--     ('João Silva', '1980-05-15', 'Masculino', '(34) 99999-0001', 'Rua A, 123', true),
--     ('Maria Santos', '1992-08-22', 'Feminino', '(34) 99999-0002', 'Rua B, 456', false),
--     ('Pedro Oliveira', '1975-12-10', 'Masculino', '(34) 99999-0003', 'Rua C, 789', false);

COMMIT;
