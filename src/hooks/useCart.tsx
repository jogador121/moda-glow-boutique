import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock_quantity: number;
    slug: string;
  };
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar itens do carrinho
  const cartQuery = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          selected_size,
          selected_color,
          product:products (
            id,
            name,
            price,
            images,
            stock_quantity,
            slug
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user,
  });

  // Query para contagem de itens no carrinho
  const cartCountQuery = useQuery({
    queryKey: ['cart-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.reduce((total, item) => total + item.quantity, 0);
    },
    enabled: !!user,
  });

  // Invalidar cache do carrinho
  const invalidateCart = () => {
    queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['cart-count', user?.id] });
  };

  // Adicionar produto ao carrinho
  const addToCart = useMutation({
    mutationFn: async ({ 
      productId, 
      quantity = 1, 
      selectedSize, 
      selectedColor 
    }: { 
      productId: string; 
      quantity?: number; 
      selectedSize?: string; 
      selectedColor?: string; 
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já existe no carrinho com as mesmas especificações
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('selected_size', selectedSize || null)
        .eq('selected_color', selectedColor || null)
        .maybeSingle();

      if (existingItem) {
        // Atualizar quantidade
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
        return { action: 'updated', quantity: existingItem.quantity + quantity };
      } else {
        // Criar novo item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
            selected_size: selectedSize,
            selected_color: selectedColor,
          });

        if (error) throw error;
        return { action: 'added', quantity };
      }
    },
    onSuccess: (data) => {
      invalidateCart();
      toast({
        title: data.action === 'added' ? "Produto adicionado" : "Quantidade atualizada",
        description: `Item ${data.action === 'added' ? 'adicionado ao' : 'atualizado no'} carrinho`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho",
        variant: "destructive",
      });
    },
  });

  // Atualizar quantidade de um item
  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity < 1) throw new Error('Quantidade deve ser maior que 0');

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateCart();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a quantidade",
        variant: "destructive",
      });
    },
  });

  // Remover item do carrinho
  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateCart();
      toast({
        title: "Item removido",
        description: "Produto removido do carrinho",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o item",
        variant: "destructive",
      });
    },
  });

  // Limpar carrinho
  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateCart();
      toast({
        title: "Carrinho limpo",
        description: "Todos os itens foram removidos do carrinho",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível limpar o carrinho",
        variant: "destructive",
      });
    },
  });

  // Calcular totais
  const totals = {
    subtotal: cartQuery.data?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0,
    itemCount: cartQuery.data?.length || 0,
    totalQuantity: cartCountQuery.data || 0,
  };

  return {
    // Dados
    items: cartQuery.data || [],
    count: cartCountQuery.data || 0,
    totals,
    
    // Estados
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    
    // Mutações
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    
    // Estados das mutações
    isAdding: addToCart.isPending,
    isUpdating: updateQuantity.isPending,
    isRemoving: removeItem.isPending,
    isClearing: clearCart.isPending,
    
    // Utilitários
    invalidateCart,
  };
};