-- Corrigir função de geração de números de pedido para evitar duplicatas
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  order_number TEXT;
  attempt_count INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Gerar número com timestamp mais preciso + sequência aleatória
    order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Verificar se já existe
    IF NOT EXISTS (SELECT 1 FROM orders WHERE orders.order_number = order_number) THEN
      RETURN order_number;
    END IF;
    
    -- Incrementar tentativas
    attempt_count := attempt_count + 1;
    
    -- Se chegou ao máximo de tentativas, usar timestamp de nanosegundos
    IF attempt_count >= max_attempts THEN
      order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS') || '-' || EXTRACT(MICROSECONDS FROM NOW())::TEXT;
      RETURN order_number;
    END IF;
    
    -- Pequena pausa para evitar conflitos em alta concorrência
    PERFORM pg_sleep(0.001);
  END LOOP;
END;
$function$;

-- Verificar se o trigger exists e recriá-lo se necessário
DROP TRIGGER IF EXISTS set_order_number_trigger ON orders;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION set_order_number();