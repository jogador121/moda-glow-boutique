import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import StarRating from "@/components/ui/star-rating";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  user_id: string;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: '',
  });

  // Buscar reviews do produto
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          is_verified_purchase,
          created_at,
          user_id
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  // Verificar se o usuário já fez uma review
  const { data: userReview } = useQuery({
    queryKey: ['user-review', productId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, title, comment, created_at, updated_at')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Criar nova review
  const createReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');
      if (reviewForm.rating === 0) throw new Error('Selecione uma avaliação');

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating: reviewForm.rating,
          title: reviewForm.title || null,
          comment: reviewForm.comment || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productId, user?.id] });
      setShowReviewForm(false);
      setReviewForm({ rating: 0, title: '', comment: '' });
      toast({
        title: "Avaliação enviada",
        description: "Sua avaliação foi enviada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a avaliação.",
        variant: "destructive",
      });
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmitReview = () => {
    createReview.mutate();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="h-20 bg-muted rounded"></div>
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo das Avaliações */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Avaliações dos Clientes</h3>
        
        {reviews.length > 0 ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating rating={averageRating} size="lg" />
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <div className="text-muted-foreground">
              baseado em {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Ainda não há avaliações para este produto.</p>
        )}
      </div>

      {/* Formulário de Nova Avaliação */}
      {user && !userReview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Deixe sua avaliação
              {!showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Avaliar Produto
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          
          {showReviewForm && (
            <CardContent className="space-y-4">
              <div>
                <Label>Sua avaliação</Label>
                <StarRating
                  rating={reviewForm.rating}
                  interactive
                  onRatingChange={(rating) => setReviewForm({...reviewForm, rating})}
                  size="lg"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="review-title">Título (opcional)</Label>
                <Input
                  id="review-title"
                  placeholder="Ex: Produto excelente!"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="review-comment">Comentário (opcional)</Label>
                <Textarea
                  id="review-comment"
                  placeholder="Conte sobre sua experiência com o produto..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={reviewForm.rating === 0 || createReview.isPending}
                >
                  {createReview.isPending ? 'Enviando...' : 'Enviar Avaliação'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Avaliação do usuário logado */}
      {userReview && (
        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>
                  {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : 'EU'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Sua avaliação</span>
                  <StarRating rating={userReview.rating} size="sm" />
                  <Badge variant="secondary">Sua avaliação</Badge>
                </div>
                {userReview.title && (
                  <h4 className="font-medium mb-1">{userReview.title}</h4>
                )}
                {userReview.comment && (
                  <p className="text-muted-foreground text-sm mb-2">{userReview.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(userReview.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Avaliações */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h4 className="font-semibold">Todas as avaliações</h4>
          
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        CL
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          Cliente
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                        {review.is_verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            Compra verificada
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-1">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-muted-foreground text-sm mb-2">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;