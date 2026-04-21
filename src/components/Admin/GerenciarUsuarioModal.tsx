
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  type: z.enum(['admin', 'gerenciador_tecnico', 'obras', 'financeira', 'comercial', 'cliente']),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número')
    .optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface GerenciarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  mode: 'create' | 'edit';
}

const GerenciarUsuarioModal = ({ isOpen, onClose, user, mode }: GerenciarUsuarioModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      type: user.type,
    } : {}
  });

  React.useEffect(() => {
    if (user && mode === 'edit') {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('type', user.type);
    } else if (mode === 'create') {
      reset();
    }
  }, [user, mode, setValue, reset]);

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    
    try {
      if (mode === 'create') {
        if (!data.password) {
          toast({ title: 'Erro', description: 'Senha é obrigatória para novos usuários', variant: 'destructive' });
          setIsLoading(false);
          return;
        }

        const { data: result, error } = await supabase.functions.invoke('manage-user', {
          body: {
            action: 'create',
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.type,
          },
        });

        if (error || result?.error) {
          throw new Error(result?.error || error?.message || 'Erro ao criar usuário');
        }

        if (result?.pending_approval) {
          toast({
            title: 'Aguardando aprovação',
            description: result.message || `Usuário ${data.name} criado. Atribuição de role aguarda aprovação de um administrador.`,
          });
        } else {
          toast({
            title: 'Usuário criado',
            description: `Usuário ${data.name} foi criado com sucesso`,
          });
        }
      } else if (mode === 'edit' && user?.id) {
        const { data: result, error } = await supabase.functions.invoke('manage-user', {
          body: {
            action: 'update_role',
            userId: user.id,
            role: data.type,
          },
        });

        if (error || result?.error) {
          throw new Error(result?.error || error?.message || 'Erro ao atualizar usuário');
        }

        if (result?.pending_approval) {
          toast({
            title: 'Aguardando aprovação',
            description: result.message || `Solicitação de alteração de role enviada. Aguardando aprovação de um administrador.`,
          });
        } else {
          toast({
            title: 'Usuário atualizado',
            description: `Role de ${data.name} atualizado para ${data.type}`,
          });
        }
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar o usuário',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nome completo"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@exemplo.com"
              disabled={mode === 'edit'}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Usuário</Label>
            <Select
              defaultValue={user?.type}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="gerenciador_tecnico">Gerenciador Técnico</SelectItem>
                <SelectItem value="obras">Obras</SelectItem>
                <SelectItem value="financeira">Financeiro</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Mín. 8 caracteres (maiúscula + número)"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (mode === 'create' ? 'Criar' : 'Salvar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GerenciarUsuarioModal;
