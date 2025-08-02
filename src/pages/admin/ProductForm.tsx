import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Plus, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior que zero'),
  compare_price: z.number().optional(),
  sku: z.string().optional(),
  stock_quantity: z.number().min(0, 'Estoque não pode ser negativo'),
  category_id: z.string().optional(),
  weight: z.number().optional(),
  care_instructions: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  
  // Estados para Stripe
  const [stripeProductId, setStripeProductId] = useState('');
  const [stripePriceId, setStripePriceId] = useState('');
  const [stripeStatus, setStripeStatus] = useState<'not_synced' | 'synced' | 'pending' | 'error'>('not_synced');
  const [lastStripeSync, setLastStripeSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  
  // Estados para inputs de arrays
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      is_featured: false,
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, description, short_description, price, compare_price, images, sizes, colors, materials, care_instructions, stock_quantity, category_id, tags, is_active, is_featured, sku, weight, dimensions, min_stock_alert, meta_title, meta_description, stripe_product_id, stripe_price_id, last_stripe_sync')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        reset({
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          short_description: data.short_description || '',
          price: data.price,
          compare_price: data.compare_price || undefined,
          sku: data.sku || '',
          stock_quantity: data.stock_quantity || 0,
          category_id: data.category_id || '',
          weight: data.weight || undefined,
          care_instructions: data.care_instructions || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          is_active: data.is_active,
          is_featured: data.is_featured,
        });

        setImages(data.images || []);
        setSizes(data.sizes || []);
        setColors(data.colors || []);
        setMaterials(data.materials || []);
        setTags(data.tags || []);
        
        // Carregar dados do Stripe
        setStripeProductId(data.stripe_product_id || '');
        setStripePriceId(data.stripe_price_id || '');
        setLastStripeSync(data.last_stripe_sync || null);
        
        // Definir status do Stripe
        if (data.stripe_product_id && data.stripe_price_id) {
          setStripeStatus('synced');
        } else if (data.stripe_product_id || data.stripe_price_id) {
          setStripeStatus('error');
        } else {
          setStripeStatus('not_synced');
        }
        
        if (data.dimensions && typeof data.dimensions === 'object') {
          setDimensions(data.dimensions as { length: string; width: string; height: string; });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setImages(prev => [...prev, publicUrl]);
      toast.success('Imagem carregada com sucesso');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addArrayItem = (type: 'sizes' | 'colors' | 'materials' | 'tags', value: string) => {
    if (!value.trim()) return;
    
    const setters = {
      sizes: setSizes,
      colors: setColors,
      materials: setMaterials,
      tags: setTags,
    };
    
    const resetters = {
      sizes: setNewSize,
      colors: setNewColor,
      materials: setNewMaterial,
      tags: setNewTag,
    };

    setters[type](prev => [...prev, value.trim()]);
    resetters[type]('');
  };

  const removeArrayItem = (type: 'sizes' | 'colors' | 'materials' | 'tags', index: number) => {
    const setters = {
      sizes: setSizes,
      colors: setColors,
      materials: setMaterials,
      tags: setTags,
    };

    setters[type](prev => prev.filter((_, i) => i !== index));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const syncWithStripe = async (productId?: string) => {
    try {
      setSyncing(true);
      setStripeStatus('pending');
      toast.info('Sincronizando com Stripe...');

      const { data, error } = await supabase.functions.invoke('sync-stripe-products');
      
      if (error) throw error;

      // Recarregar dados do produto se estamos editando
      if (isEditing && id) {
        await fetchProduct();
      }
      
      const successCount = data.synced_count || 0;
      if (successCount > 0) {
        toast.success('Produto sincronizado com Stripe!');
        setStripeStatus('synced');
      } else {
        toast.info('Nenhum produto novo para sincronizar');
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar com Stripe');
      setStripeStatus('error');
    } finally {
      setSyncing(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      const productData: any = {
        ...data,
        images,
        sizes,
        colors,
        materials,
        tags,
        dimensions: dimensions.length || dimensions.width || dimensions.height ? dimensions : null,
        slug: data.slug || generateSlug(data.name),
      };

      let productId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso');
      } else {
        const { data: insertedData, error } = await supabase
          .from('products')
          .insert([productData])
          .select('id')
          .single();

        if (error) throw error;
        productId = insertedData.id;
        toast.success('Produto criado com sucesso');
      }

      // Sincronizar com Stripe automaticamente após salvar
      if (productId) {
        await syncWithStripe(productId);
      }

      navigate('/admin/produtos');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded" />
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/produtos')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    onBlur={(e) => {
                      const slug = generateSlug(e.target.value);
                      setValue('slug', slug);
                    }}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input id="slug" {...register('slug')} />
                  {errors.slug && (
                    <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="short_description">Descrição Curta</Label>
                  <Textarea id="short_description" {...register('short_description')} />
                </div>

                <div>
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Textarea id="description" {...register('description')} rows={4} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preço *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="compare_price">Preço Comparação</Label>
                    <Input
                      id="compare_price"
                      type="number"
                      step="0.01"
                      {...register('compare_price', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" {...register('sku')} />
                  </div>
                  <div>
                    <Label htmlFor="stock_quantity">Estoque</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      {...register('stock_quantity', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category_id">Categoria</Label>
                  <Select onValueChange={(value) => setValue('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={watch('is_active')}
                      onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
                    />
                    <Label htmlFor="is_active">Produto Ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_featured"
                      checked={watch('is_featured')}
                      onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
                    />
                    <Label htmlFor="is_featured">Produto em Destaque</Label>
                  </div>
                 </div>
               </CardContent>
             </Card>

             {/* Integração Stripe */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <RefreshCw className="h-5 w-5" />
                   Integração Stripe
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-sm font-medium">Status da Sincronização</p>
                     <div className="flex items-center gap-2">
                       <Badge 
                         variant={
                           stripeStatus === 'synced' ? 'default' : 
                           stripeStatus === 'pending' ? 'secondary' : 
                           stripeStatus === 'error' ? 'destructive' : 'outline'
                         }
                       >
                         {stripeStatus === 'synced' ? 'Sincronizado' :
                          stripeStatus === 'pending' ? 'Pendente' :
                          stripeStatus === 'error' ? 'Erro' : 'Não Sincronizado'}
                       </Badge>
                       {lastStripeSync && (
                         <span className="text-xs text-muted-foreground">
                           {new Date(lastStripeSync).toLocaleString('pt-BR')}
                         </span>
                       )}
                     </div>
                   </div>
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => syncWithStripe(id)}
                     disabled={syncing || !isEditing}
                   >
                     <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                     {syncing ? 'Sincronizando...' : 'Sincronizar'}
                   </Button>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                   <div>
                     <Label htmlFor="stripe_product_id">Stripe Product ID</Label>
                     <Input
                       id="stripe_product_id"
                       value={stripeProductId}
                       onChange={(e) => setStripeProductId(e.target.value)}
                       placeholder="prod_..."
                       disabled={!isEditing}
                     />
                     <p className="text-xs text-muted-foreground mt-1">
                       ID do produto no Stripe (preenchido automaticamente)
                     </p>
                   </div>
                   
                   <div>
                     <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                     <Input
                       id="stripe_price_id"
                       value={stripePriceId}
                       onChange={(e) => setStripePriceId(e.target.value)}
                       placeholder="price_..."
                       disabled={!isEditing}
                     />
                     <p className="text-xs text-muted-foreground mt-1">
                       ID do preço no Stripe (preenchido automaticamente)
                     </p>
                   </div>
                 </div>

                 {stripeProductId && (
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => window.open(
                       `https://dashboard.stripe.com/products/${stripeProductId}`,
                       '_blank'
                     )}
                   >
                     <ExternalLink className="h-4 w-4 mr-2" />
                     Ver no Stripe
                   </Button>
                 )}

                 <div className="text-xs text-muted-foreground space-y-1">
                   <p>• A sincronização é automática ao salvar o produto</p>
                   <p>• Produtos ativos são enviados para o Stripe</p>
                   <p>• Preços são convertidos para centavos (BRL)</p>
                 </div>
               </CardContent>
             </Card>

             {/* Atributos do Produto */}
            <Card>
              <CardHeader>
                <CardTitle>Atributos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tamanhos */}
                <div>
                  <Label>Tamanhos Disponíveis</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ex: P, M, G"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => addArrayItem('sizes', newSize)}
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {size}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => removeArrayItem('sizes', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Cores */}
                <div>
                  <Label>Cores Disponíveis</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ex: Azul, Vermelho"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => addArrayItem('colors', newColor)}
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {color}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => removeArrayItem('colors', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Materiais */}
                <div>
                  <Label>Materiais</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ex: Algodão, Poliéster"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => addArrayItem('materials', newMaterial)}
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {materials.map((material, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {material}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => removeArrayItem('materials', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="care_instructions">Instruções de Cuidado</Label>
                  <Textarea id="care_instructions" {...register('care_instructions')} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Imagens e SEO */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Imagens do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Upload de Imagens</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="image-upload"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(uploadImage);
                      }}
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        {uploading ? 'Carregando...' : 'Clique para fazer upload de imagens'}
                      </p>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags e SEO */}
            <Card>
              <CardHeader>
                <CardTitle>Tags e SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Ex: verão, casual"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => addArrayItem('tags', newTag)}
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => removeArrayItem('tags', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="meta_title">Meta Título (SEO)</Label>
                  <Input id="meta_title" {...register('meta_title')} />
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Descrição (SEO)</Label>
                  <Textarea id="meta_description" {...register('meta_description')} />
                </div>

                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.001"
                    {...register('weight', { valueAsNumber: true })}
                  />
                </div>

                {/* Dimensões */}
                <div>
                  <Label>Dimensões (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Comprimento"
                      value={dimensions.length}
                      onChange={(e) => setDimensions(prev => ({ ...prev, length: e.target.value }))}
                    />
                    <Input
                      placeholder="Largura"
                      value={dimensions.width}
                      onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                    />
                    <Input
                      placeholder="Altura"
                      value={dimensions.height}
                      onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Criar Produto')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/produtos')}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;