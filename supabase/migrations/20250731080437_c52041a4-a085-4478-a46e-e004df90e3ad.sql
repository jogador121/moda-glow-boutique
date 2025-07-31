-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for products (public read access for all users)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Create cart_items table for shopping cart functionality
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for cart_items (users can only see their own cart items)
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart items" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
ON public.cart_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products data
INSERT INTO public.products (name, description, price, image_url, category, stock_quantity, is_featured) VALUES
('Vestido Elegante Rosa', 'Vestido elegante em tecido de alta qualidade, perfeito para ocasiões especiais.', 299.90, '/placeholder.svg', 'vestidos', 15, true),
('Blusa Casual Branca', 'Blusa casual confortável e versátil para o dia a dia.', 89.90, '/placeholder.svg', 'blusas', 25, false),
('Saia Midi Floral', 'Saia midi com estampa floral delicada, ideal para looks femininos.', 149.90, '/placeholder.svg', 'saias', 20, true),
('Calça Jeans Premium', 'Calça jeans de corte moderno em denim premium.', 199.90, '/placeholder.svg', 'calcas', 18, false),
('Blazer Executivo', 'Blazer estruturado para looks profissionais e sofisticados.', 349.90, '/placeholder.svg', 'blazers', 12, true),
('Vestido Longo Festa', 'Vestido longo para festas e eventos especiais.', 499.90, '/placeholder.svg', 'vestidos', 8, true),
('Top Cropped Sport', 'Top cropped esportivo para looks casuais e academia.', 69.90, '/placeholder.svg', 'tops', 30, false),
('Shorts Alfaiataria', 'Shorts em alfaiataria para looks elegantes e modernos.', 119.90, '/placeholder.svg', 'shorts', 22, false);