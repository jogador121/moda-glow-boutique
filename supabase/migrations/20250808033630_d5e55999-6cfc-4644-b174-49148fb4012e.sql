-- Função para reduzir estoque de produtos
CREATE OR REPLACE FUNCTION public.reduce_stock(product_id UUID, quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar estoque do produto
  UPDATE public.products 
  SET stock_quantity = GREATEST(0, stock_quantity - quantity),
      updated_at = now()
  WHERE id = product_id;
  
  -- Log da operação
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', product_id;
  END IF;
END;
$$;