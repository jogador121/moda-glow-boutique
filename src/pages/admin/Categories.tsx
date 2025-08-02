import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  parent_id?: string;
  created_at: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url, is_active, display_order, parent_id, created_at')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
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

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('category-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const categoryData = {
        name: formData.name,
        description: formData.description || null,
        slug: generateSlug(formData.name),
        image_url: imageUrl || null,
        display_order: formData.display_order,
        is_active: true
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Categoria atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
        toast.success('Categoria criada com sucesso');
      }

      await fetchCategories();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Erro ao salvar categoria');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      display_order: 0
    });
    setImageFile(null);
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: category.display_order
    });
    setDialogOpen(true);
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;
      
      setCategories(prev => prev.map(category => 
        category.id === categoryId 
          ? { ...category, is_active: !currentStatus }
          : category
      ));
      
      toast.success(`Categoria ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`);
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Erro ao alterar status da categoria');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      toast.success('Categoria excluída com sucesso');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categorias</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Edite as informações da categoria.' : 'Crie uma nova categoria para organizar seus produtos.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagem</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Ordem de Exibição</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Salvando...' : editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Categorias</CardTitle>
          <CardDescription>
            Organize seus produtos em categorias para facilitar a navegação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-muted-foreground">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{category.display_order}</TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(category.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                        >
                          {category.is_active ? '🔴' : '🟢'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir "{category.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCategory(category.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {categories.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma categoria encontrada. Crie sua primeira categoria para começar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}