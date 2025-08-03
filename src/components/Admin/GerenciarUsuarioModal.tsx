
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

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  type: z.enum(['admin', 'obras', 'financeira', 'comercial', 'cliente']),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
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
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: mode === 'create' ? 'Usuário criado' : 'Usuário atualizado',
        description: mode === 'create' 
          ? `Usuário ${data.name} foi criado com sucesso`
          : `Usuário ${data.name} foi atualizado com sucesso`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o usuário',
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
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Usuário</Label>
            <Select onValueChange={(value) => setValue('type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="obras">Obras</SelectItem>
                <SelectItem value="financeira">Financeiro</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Senha temporária"
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
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
