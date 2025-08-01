import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verificar se um produto está na wishlist
  const isInWishlist = (productId: string) => {
    const { data: wishlistItems = [] } = useQuery({
      queryKey: ['wishlist', user?.id],
      queryFn: async () => {
        if (!user) return [];

        const { data, error } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);

        if (error) throw error;
        return data;
      },
      enabled: !!user,
    });

    return wishlistItems.some(item => item.product_id === productId);
  };

  // Toggle product na wishlist
  const toggleWishlist = useMutation({
    mutationFn: async ({ productId, productName }: { productId: string; productName: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já existe
      const { data: existingItem } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        // Remover
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('id', existingItem.id);

        if (error) throw error;
        
        return { action: 'removed', productName };
      } else {
        // Adicionar
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) throw error;
        
        return { action: 'added', productName };
      }
    },
    onSuccess: ({ action, productName }) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      
      toast({
        title: action === 'added' ? "Adicionado aos favoritos" : "Removido dos favoritos",
        description: `${productName} foi ${action === 'added' ? 'adicionado aos' : 'removido dos'} favoritos`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos",
        variant: "destructive",
      });
    },
  });

  return {
    isInWishlist,
    toggleWishlist,
    isLoading: toggleWishlist.isPending,
  };
};