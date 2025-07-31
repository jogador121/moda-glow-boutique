import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Search, Eye, Crown, User } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
  orders_count?: number;
  total_spent?: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Buscar perfis de usuário com estatísticas de pedidos
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Para cada usuário, buscar estatísticas de pedidos
      const usersWithStats = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('user_id', profile.user_id);

          const ordersCount = ordersData?.length || 0;
          const totalSpent = ordersData?.reduce(
            (sum, order) => sum + parseFloat(order.total_amount), 0
          ) || 0;

          return {
            ...profile,
            orders_count: ordersCount,
            total_spent: totalSpent
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      toast.success('Perfil do usuário atualizado com sucesso');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar perfil do usuário');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const openUserDetails = async (user: UserProfile) => {
    try {
      // Buscar pedidos detalhados do usuário
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      setSelectedUser({
        ...user,
        recent_orders: ordersData || []
      } as any);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Erro ao carregar detalhes do usuário');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
      <h1 className="text-3xl font-bold">Usuários</h1>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground self-center">
              {filteredUsers.length} usuário(s) encontrado(s)
            </div>
          </div>

          {/* Tabela de Usuários */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.full_name || 'Usuário'}
                          {user.role === 'admin' && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-muted-foreground">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 'Cliente'}
                        </Badge>
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.user_id, value)}
                        >
                          <SelectTrigger className="h-7 w-auto border-none shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Cliente
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-3 w-3" />
                                Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.orders_count || 0} pedidos
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(user.total_spent || 0)}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openUserDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum usuário encontrado com os filtros selecionados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes do Usuário */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas sobre o usuário
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Informações Pessoais */}
              <div>
                <h3 className="font-semibold mb-2">Informações Pessoais</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Nome:</strong> {selectedUser.full_name || 'Não informado'}</p>
                  <p><strong>Email:</strong> {selectedUser.email || 'Não informado'}</p>
                  <p><strong>Telefone:</strong> {selectedUser.phone || 'Não informado'}</p>
                  <p><strong>Perfil:</strong> {selectedUser.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                  <p><strong>Cadastro:</strong> {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Estatísticas */}
              <div>
                <h3 className="font-semibold mb-2">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">{selectedUser.orders_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Pedidos</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(selectedUser.total_spent || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Gasto</div>
                  </div>
                </div>
              </div>

              {/* Pedidos Recentes */}
              {(selectedUser as any).recent_orders && (selectedUser as any).recent_orders.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Pedidos Recentes</h3>
                  <div className="space-y-2">
                    {(selectedUser as any).recent_orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(order.total_amount)}
                          </p>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}