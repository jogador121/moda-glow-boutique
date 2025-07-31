-- Corrigir search_path para funções de segurança - ordem correta
DROP TRIGGER IF EXISTS update_stripe_sync_trigger ON public.products;
DROP FUNCTION IF EXISTS public.update_stripe_sync_timestamp();
DROP FUNCTION IF EXISTS public.calculate_available_stock(UUID);

-- Recriar função para calcular estoque disponível com search_path seguro
CREATE OR REPLACE FUNCTION public.calculate_available_stock(product_id UUID)
RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stock_qty INTEGER;
  reserved_qty INTEGER;
BEGIN
  SELECT stock_quantity, COALESCE(reserved_quantity, 0)
  INTO stock_qty, reserved_qty
  FROM public.products
  WHERE id = product_id;
  
  RETURN GREATEST(0, COALESCE(stock_qty, 0) - COALESCE(reserved_qty, 0));
END;
$$;

-- Recriar trigger function com search_path seguro
CREATE OR REPLACE FUNCTION public.update_stripe_sync_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.stripe_product_id IS DISTINCT FROM NEW.stripe_product_id OR 
      OLD.stripe_price_id IS DISTINCT FROM NEW.stripe_price_id) THEN
    NEW.last_stripe_sync = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER update_stripe_sync_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stripe_sync_timestamp();