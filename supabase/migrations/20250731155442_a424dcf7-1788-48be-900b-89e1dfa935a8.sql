-- Adicionar campos para integração com Stripe Products API
ALTER TABLE public.products 
ADD COLUMN stripe_product_id TEXT,
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN stripe_metadata JSONB DEFAULT '{}',
ADD COLUMN last_stripe_sync TIMESTAMPTZ;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON public.products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_stripe_price_id ON public.products(stripe_price_id);

-- Adicionar campos de rastreamento de estoque
ALTER TABLE public.products 
ADD COLUMN min_stock_alert INTEGER DEFAULT 5,
ADD COLUMN reserved_quantity INTEGER DEFAULT 0;

-- Criar tabela para histórico de sincronização com Stripe
CREATE TABLE IF NOT EXISTS public.stripe_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'sync'
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
  error_message TEXT,
  sync_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar RLS para logs de sincronização
ALTER TABLE public.stripe_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stripe sync logs" 
ON public.stripe_sync_logs 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "System can manage stripe sync logs" 
ON public.stripe_sync_logs 
FOR ALL 
USING (true);

-- Criar função para calcular estoque disponível
CREATE OR REPLACE FUNCTION public.calculate_available_stock(product_id UUID)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at quando stripe fields são modificados
CREATE OR REPLACE FUNCTION public.update_stripe_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.stripe_product_id IS DISTINCT FROM NEW.stripe_product_id OR 
      OLD.stripe_price_id IS DISTINCT FROM NEW.stripe_price_id) THEN
    NEW.last_stripe_sync = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stripe_sync_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stripe_sync_timestamp();