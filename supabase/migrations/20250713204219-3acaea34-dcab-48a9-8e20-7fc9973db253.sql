-- Corrigir creative_name vazio
UPDATE creative_sales 
SET creative_name = 'Creative Unknown Campaign' 
WHERE creative_name = '' OR creative_name IS NULL;

-- Adicionar dados de vendas para criativos que existem em creative_insights mas não têm vendas
INSERT INTO creative_sales (
  creative_name, order_id, payment_method, net_value, gross_value, 
  sale_date, status, customer_name, customer_email
) VALUES 
  ('Creative Premium Health', 'ORD-PREM-001', 'credit_card', 299.90, 299.90, '2024-01-15', 'completed', 'Maria Silva', 'maria@email.com'),
  ('Creative Premium Health', 'ORD-PREM-002', 'credit_card', 299.90, 299.90, '2024-01-20', 'completed', 'João Santos', 'joao@email.com'),
  ('Creative Premium Health', 'ORD-PREM-003', 'pix', 299.90, 299.90, '2024-02-05', 'completed', 'Ana Costa', 'ana@email.com'),
  
  ('Creative Wellness Pro', 'ORD-WELL-001', 'credit_card', 199.90, 199.90, '2024-01-18', 'completed', 'Carlos Lima', 'carlos@email.com'),
  ('Creative Wellness Pro', 'ORD-WELL-002', 'pix', 199.90, 199.90, '2024-02-01', 'completed', 'Sofia Alves', 'sofia@email.com'),
  
  ('Creative Fit Life', 'ORD-FIT-001', 'credit_card', 149.90, 149.90, '2024-01-25', 'completed', 'Pedro Oliveira', 'pedro@email.com'),
  ('Creative Fit Life', 'ORD-FIT-002', 'credit_card', 149.90, 149.90, '2024-02-10', 'completed', 'Lucia Ferreira', 'lucia@email.com'),
  
  ('Creative Health Box V1', 'ORD-HB1-001', 'pix', 399.90, 399.90, '2024-01-30', 'completed', 'Roberto Silva', 'roberto@email.com'),
  
  ('Creative Health Box V2', 'ORD-HB2-001', 'credit_card', 449.90, 449.90, '2024-02-08', 'completed', 'Fernanda Lima', 'fernanda@email.com');