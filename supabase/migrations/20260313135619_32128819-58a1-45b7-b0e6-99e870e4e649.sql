
-- ============================================
-- DADOS DE DEMONSTRAÇÃO - CT Guedes
-- ============================================

-- 1. CLIENTES
INSERT INTO clientes (id, razao_social, cnpj, endereco, contato_email, contato_telefone, created_by) VALUES
('a0000001-de10-4000-8000-000000000001', 'Petrobras S.A.', '33.000.167/0001-01', 'Av. República do Chile, 65 - Centro, Rio de Janeiro/RJ', 'contratos@petrobras.com.br', '(21) 3224-4477', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('a0000001-de10-4000-8000-000000000002', 'Vale Mineração S.A.', '33.592.510/0001-54', 'Praia de Botafogo, 186 - Botafogo, Rio de Janeiro/RJ', 'engenharia@vale.com', '(21) 3485-3000', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('a0000001-de10-4000-8000-000000000003', 'CSN - Companhia Siderúrgica Nacional', '33.042.730/0001-04', 'Rod. BR-393, Km 5001 - Volta Redonda/RJ', 'manutencao@csn.com.br', '(24) 3344-5000', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('a0000001-de10-4000-8000-000000000004', 'Braskem Petroquímica S.A.', '42.150.391/0001-70', 'Rua Eteno, 1561 - Camaçari/BA', 'projetos@braskem.com.br', '(71) 3413-4000', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('a0000001-de10-4000-8000-000000000005', 'Usiminas S.A.', '60.894.730/0001-05', 'Rua Prof. José Vieira de Mendonça, 3011 - Belo Horizonte/MG', 'obras@usiminas.com', '(31) 3499-8000', '1d25e381-565a-4c4a-9542-68e17fcc3cfb');

-- 2. OBRAS
INSERT INTO obras (id, nome, cliente_id, endereco, escopo, data_inicio, data_previsao, valor_contrato, metragem, status, progresso, created_by) VALUES
('b0000001-de10-4000-8000-000000000001', 'Pintura Industrial - Refinaria REDUC', 'a0000001-de10-4000-8000-000000000001', 'Rod. Washington Luís, Duque de Caxias/RJ', 'Pintura epóxi em estruturas metálicas, tanques e tubulações da unidade de destilação', '2026-01-15', '2026-06-30', 485000, 12000, 'em_andamento', 65, '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('b0000001-de10-4000-8000-000000000002', 'Tratamento Anticorrosivo - Mina Carajás', 'a0000001-de10-4000-8000-000000000002', 'Serra dos Carajás, Parauapebas/PA', 'Jateamento e pintura de correias transportadoras e silos de minério', '2026-02-01', '2026-08-15', 320000, 8500, 'em_andamento', 30, '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('b0000001-de10-4000-8000-000000000003', 'Revestimento Térmico - Alto Forno CSN', 'a0000001-de10-4000-8000-000000000003', 'Usina Presidente Vargas, Volta Redonda/RJ', 'Aplicação de revestimento térmico refratário em estruturas do alto forno 3', '2026-03-20', '2026-05-20', 180000, 3200, 'programacao_pendente', 0, '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('b0000001-de10-4000-8000-000000000004', 'Pintura de Tanques - Polo Camaçari', 'a0000001-de10-4000-8000-000000000004', 'Via Atlântica, 3801 - Camaçari/BA', 'Pintura interna e externa de 4 tanques de armazenamento petroquímico', '2025-09-01', '2026-02-28', 275000, 6800, 'concluida', 100, '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('b0000001-de10-4000-8000-000000000005', 'Manutenção Predial - Sede Usiminas', 'a0000001-de10-4000-8000-000000000005', 'Rua Prof. José Vieira de Mendonça, 3011 - BH/MG', 'Pintura e impermeabilização da fachada do edifício administrativo', '2026-03-01', '2026-04-15', 95000, 4500, 'programada', 0, '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('b0000001-de10-4000-8000-000000000006', 'Proteção Passiva - Plataforma P-78', 'a0000001-de10-4000-8000-000000000001', 'Estaleiro Brasfels, Angra dos Reis/RJ', 'Aplicação de proteção passiva contra incêndio em módulos da plataforma', '2026-02-10', '2026-07-10', 520000, 15000, 'pausada', 18, '1d25e381-565a-4c4a-9542-68e17fcc3cfb');

-- 3. PROPOSTAS
INSERT INTO propostas (id, titulo, cliente_id, descricao, valor, prazo_execucao, condicoes_pagamento, data_validade, status, created_by) VALUES
('c0000001-de10-4000-8000-000000000001', 'Proposta - Pintura Dutos REPLAN', 'a0000001-de10-4000-8000-000000000001', 'Pintura industrial em 3.500m de tubulações na Refinaria de Paulínia', 210000, '90 dias', '30/60/90 dias após medição', '2026-04-05', 'pendente', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('c0000001-de10-4000-8000-000000000002', 'Proposta - Jateamento Pátio de Estocagem', 'a0000001-de10-4000-8000-000000000002', 'Jateamento abrasivo e pintura de estruturas do pátio de estocagem - Mina S11D', 380000, '120 dias', '30 dias após medição mensal', '2026-03-25', 'em_analise', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('c0000001-de10-4000-8000-000000000003', 'Proposta - Repintura Galpão Industrial', 'a0000001-de10-4000-8000-000000000003', 'Repintura completa do galpão de laminação a frio - 8.000m²', 145000, '45 dias', 'À vista com 5% de desconto', '2026-05-30', 'rascunho', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('c0000001-de10-4000-8000-000000000004', 'Proposta - Proteção Anticorrosiva Torres', 'a0000001-de10-4000-8000-000000000004', 'Tratamento anticorrosivo em 6 torres de resfriamento da unidade petroquímica', 290000, '75 dias', '30/60 dias após medição', '2026-02-28', 'aprovada', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('c0000001-de10-4000-8000-000000000005', 'Proposta - Pintura Estrutural Estacionamento', 'a0000001-de10-4000-8000-000000000005', 'Pintura de estruturas metálicas do edifício garagem corporativo', 68000, '20 dias', 'À vista', '2026-03-20', 'pendente', '1d25e381-565a-4c4a-9542-68e17fcc3cfb');

-- 4. PROGRAMAÇÕES
INSERT INTO programacoes (id, obra_id, data_programada, tipo, status, descricao, responsavel, hora_inicio, hora_fim, created_by) VALUES
('d0000001-de10-4000-8000-000000000001', 'b0000001-de10-4000-8000-000000000001', '2026-03-13', 'execucao', 'em_execucao', 'Jateamento do tanque TQ-4501 - face externa', 'Carlos Silva', '07:00', '16:00', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('d0000001-de10-4000-8000-000000000002', 'b0000001-de10-4000-8000-000000000001', '2026-03-14', 'execucao', 'programada', 'Aplicação de primer epóxi - Setor A', 'Carlos Silva', '07:00', '16:00', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('d0000001-de10-4000-8000-000000000003', 'b0000001-de10-4000-8000-000000000002', '2026-03-13', 'execucao', 'em_execucao', 'Pintura de correia TC-12 - trecho 3', 'Roberto Mendes', '06:00', '15:00', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('d0000001-de10-4000-8000-000000000004', 'b0000001-de10-4000-8000-000000000002', '2026-03-16', 'medicao', 'programada', 'Medição mensal - Março/2026', 'Diego Wander', '09:00', '12:00', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('d0000001-de10-4000-8000-000000000005', 'b0000001-de10-4000-8000-000000000003', '2026-03-18', 'visita', 'programada', 'Visita técnica para levantamento de campo', 'Diego Wander', '08:00', '17:00', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('d0000001-de10-4000-8000-000000000006', 'b0000001-de10-4000-8000-000000000005', '2026-03-17', 'execucao', 'confirmada', 'Montagem de andaimes - fachada norte', 'Marcos Oliveira', '07:00', '16:00', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('d0000001-de10-4000-8000-000000000007', 'b0000001-de10-4000-8000-000000000001', '2026-03-19', 'entrega', 'programada', 'Entrega de materiais - tinta poliuretano', 'Carlos Silva', '08:00', '10:00', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('d0000001-de10-4000-8000-000000000008', 'b0000001-de10-4000-8000-000000000002', '2026-03-20', 'execucao', 'programada', 'Jateamento silo SI-03 - preparação', 'Roberto Mendes', '06:00', '15:00', '1d25e381-565a-4c4a-9542-68e17fcc3cfb');

-- 5. MEDIÇÕES
INSERT INTO medicoes (id, obra_id, numero, descricao, valor, valor_bruto, percentual, periodo_inicio, periodo_fim, data_medicao, status, created_by) VALUES
('e0000001-de10-4000-8000-000000000001', 'b0000001-de10-4000-8000-000000000001', 'MED-001', 'Medição 1 - Preparação de superfície e primer', 145500, 145500, 30, '2026-01-15', '2026-02-15', '2026-02-18', 'aprovada', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('e0000001-de10-4000-8000-000000000002', 'b0000001-de10-4000-8000-000000000001', 'MED-002', 'Medição 2 - Pintura intermediária e acabamento parcial', 169750, 169750, 35, '2026-02-16', '2026-03-10', '2026-03-11', 'pendente', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('e0000001-de10-4000-8000-000000000003', 'b0000001-de10-4000-8000-000000000002', 'MED-001', 'Medição 1 - Jateamento correias TC-10 e TC-11', 96000, 96000, 30, '2026-02-01', '2026-03-01', '2026-03-03', 'aprovada', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('e0000001-de10-4000-8000-000000000004', 'b0000001-de10-4000-8000-000000000004', 'MED-FINAL', 'Medição final - Conclusão pintura tanques', 275000, 275000, 100, '2025-09-01', '2026-02-28', '2026-02-28', 'aprovada', '1d25e381-565a-4c4a-9542-68e17fcc3cfb');

-- 6. DESPESAS
INSERT INTO despesas (id, descricao, valor, data, categoria, obra_id, created_by) VALUES
('f0000001-de10-4000-8000-000000000001', 'Tinta Epóxi Internacional - 200L', 28500, '2026-01-20', 'material', 'b0000001-de10-4000-8000-000000000001', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('f0000001-de10-4000-8000-000000000002', 'Equipe de jateamento - Janeiro', 45000, '2026-01-31', 'mao_de_obra', 'b0000001-de10-4000-8000-000000000001', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('f0000001-de10-4000-8000-000000000003', 'Aluguel compressor Atlas Copco', 12000, '2026-02-05', 'equipamento', 'b0000001-de10-4000-8000-000000000002', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('f0000001-de10-4000-8000-000000000004', 'Granalha de aço G-25 - 5 toneladas', 18500, '2026-02-15', 'material', 'b0000001-de10-4000-8000-000000000002', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('f0000001-de10-4000-8000-000000000005', 'Equipe de pintura - Fevereiro', 52000, '2026-02-28', 'mao_de_obra', 'b0000001-de10-4000-8000-000000000001', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('f0000001-de10-4000-8000-000000000006', 'Transporte de equipamentos - Carajás', 8900, '2026-03-05', 'transporte', 'b0000001-de10-4000-8000-000000000002', '1d25e381-565a-4c4a-9542-68e17fcc3cfb');

-- 7. BOLETINS DE MEDIÇÃO
INSERT INTO boletins_medicao (id, obra_id, medicao_id, numero, valor, data_emissao, status, created_by) VALUES
('10000001-de10-4000-8000-000000000001', 'b0000001-de10-4000-8000-000000000001', 'e0000001-de10-4000-8000-000000000001', 'BM-2026-001', 145500, '2026-02-20', 'pago', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('10000001-de10-4000-8000-000000000002', 'b0000001-de10-4000-8000-000000000002', 'e0000001-de10-4000-8000-000000000003', 'BM-2026-002', 96000, '2026-03-05', 'aprovado', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('10000001-de10-4000-8000-000000000003', 'b0000001-de10-4000-8000-000000000004', 'e0000001-de10-4000-8000-000000000004', 'BM-2026-003', 275000, '2026-03-01', 'pago', '1d25e381-565a-4c4a-9542-68e17fcc3cfb');

-- 8. MATERIAIS
INSERT INTO materiais (id, nome, obra_id, quantidade, valor_unitario, valor_total, unidade, fornecedor, status, created_by) VALUES
('20000001-de10-4000-8000-000000000001', 'Tinta Epóxi Intergard 269', 'b0000001-de10-4000-8000-000000000001', 400, 85, 34000, 'L', 'International Paint', 'entregue', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('20000001-de10-4000-8000-000000000002', 'Tinta Poliuretano Interthane 990', 'b0000001-de10-4000-8000-000000000001', 200, 120, 24000, 'L', 'International Paint', 'pendente', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('20000001-de10-4000-8000-000000000003', 'Granalha de Aço G-25', 'b0000001-de10-4000-8000-000000000002', 5000, 3.7, 18500, 'kg', 'CMV Metalurgia', 'entregue', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('20000001-de10-4000-8000-000000000004', 'Fita Adesiva de Alta Temperatura', 'b0000001-de10-4000-8000-000000000001', 50, 45, 2250, 'un', 'Tesa Brasil', 'entregue', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('20000001-de10-4000-8000-000000000005', 'Primer Zinco Interzinc 52', 'b0000001-de10-4000-8000-000000000002', 300, 95, 28500, 'L', 'International Paint', 'em_transito', '1d25e381-565a-4c4a-9542-68e17fcc3cfb');

-- 9. EQUIPAMENTOS
INSERT INTO equipamentos (id, nome, obra_id, quantidade, valor_unitario, fornecedor, status, data_inicio, data_fim, created_by) VALUES
('30000001-de10-4000-8000-000000000001', 'Compressor Atlas Copco XAS 186', 'b0000001-de10-4000-8000-000000000001', 2, 6000, 'Atlas Copco Rental', 'em_uso', '2026-01-15', '2026-06-30', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('30000001-de10-4000-8000-000000000002', 'Máquina de Jateamento CMV 200', 'b0000001-de10-4000-8000-000000000002', 1, 4500, 'CMV Metalurgia', 'em_uso', '2026-02-01', '2026-08-15', '1d25e381-565a-4c4a-9542-68e17fcc3cfb'),
('30000001-de10-4000-8000-000000000003', 'Plataforma Elevatória JLG 660SJ', 'b0000001-de10-4000-8000-000000000005', 1, 8500, 'Mills Rental', 'disponivel', '2026-03-17', '2026-04-15', '1d25e381-565a-4c4a-9542-68e17fcc3cfb');
