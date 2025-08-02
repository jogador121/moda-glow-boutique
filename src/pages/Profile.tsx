import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, Phone, User, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  role: string;
}

const Profile = () => {
  useAuthGuard();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, date_of_birth, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const createOrUpdateProfile = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const dataToSave = {
        user_id: user.id,
        email: user.email,
        ...profileData,
      };

      if (profile) {
        const { data, error } = await supabase
          .from('profiles')
          .update(dataToSave)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
      console.error('Erro ao salvar perfil:', error);
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
      });
    } else if (user) {
      setFormData({
        full_name: user.user_metadata?.full_name || "",
        phone: "",
        date_of_birth: "",
      });
    }
  }, [profile, user]);

  const handleSave = () => {
    createOrUpdateProfile.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-foreground mb-8">
            Meu Perfil
          </h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Avatar e Informações Básicas */}
            <Card className="md:col-span-1">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="text-lg">
                        {profile?.full_name ? getInitials(profile.full_name) : 
                         user?.email ? getInitials(user.email) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      onClick={() => {
                        toast({
                          title: "Em breve",
                          description: "Upload de foto em desenvolvimento",
                        });
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h2 className="text-xl font-semibold mt-4">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Usuário'}
                  </h2>
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">{user?.email}</span>
                  </div>
                  
                  <Badge variant="secondary" className="mt-3">
                    {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Informações Detalhadas */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informações Pessoais</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={createOrUpdateProfile.isPending}
                    >
                      {createOrUpdateProfile.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        placeholder="Seu nome completo"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{formData.full_name || 'Não informado'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{formData.phone || 'Não informado'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                    {isEditing ? (
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formData.date_of_birth 
                            ? new Date(formData.date_of_birth).toLocaleDateString('pt-BR')
                            : 'Não informado'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;