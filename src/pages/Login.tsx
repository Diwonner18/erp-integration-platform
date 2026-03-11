import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, User, UserType } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import AreaSelectionModal from '@/components/Auth/AreaSelectionModal';
import logotipo from '@/assets/logotipo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAreaSelection, setShowAreaSelection] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [isAssigningArea, setIsAssigningArea] = useState(false);
  
  const { login, assignUserArea } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    
    if (result.success) {
      if (result.needsAreaSelection && result.user) {
        setPendingUser(result.user);
        setShowAreaSelection(true);
        toast.info('Selecione sua área de trabalho para continuar');
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } else {
      toast.error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
    
    setIsLoading(false);
  };

  const handleAreaSelection = async (area: UserType) => {
    if (!pendingUser) return;
    
    setIsAssigningArea(true);
    const success = await assignUserArea(pendingUser.id, area);
    
    if (success) {
      toast.success('Área configurada com sucesso!');
      setShowAreaSelection(false);
      setPendingUser(null);
      navigate('/');
    } else {
      toast.error('Erro ao configurar área. Tente novamente.');
    }
    
    setIsAssigningArea(false);
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src={logotipo} alt="CT Guedes" className="h-16 mx-auto" />
              <p className="text-sm font-body text-muted-foreground mt-2">Sistema de Gestão de Obras</p>
            </div>
            <CardTitle className="font-title text-primary">Fazer Login</CardTitle>
            <CardDescription className="font-body">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-primary">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-body"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-body text-primary">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-body"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full font-body" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm font-body text-muted-foreground">
                Não tem uma conta?{' '}
                <Link to="/cadastro" className="text-primary hover:underline font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AreaSelectionModal
        isOpen={showAreaSelection}
        user={pendingUser}
        onAreaSelect={handleAreaSelection}
        isLoading={isAssigningArea}
      />
    </>
  );
};

export default Login;
