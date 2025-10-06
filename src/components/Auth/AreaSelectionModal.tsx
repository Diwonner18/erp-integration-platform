
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Calculator, FileText } from 'lucide-react';
import { UserType, User } from '@/contexts/AuthContext';

interface AreaSelectionModalProps {
  isOpen: boolean;
  user: User | null;
  onAreaSelect: (area: UserType) => void;
  isLoading: boolean;
}

const AreaSelectionModal: React.FC<AreaSelectionModalProps> = ({
  isOpen,
  user,
  onAreaSelect,
  isLoading
}) => {
  const [selectedArea, setSelectedArea] = useState<UserType | null>(null);

  const areas = [
    {
      type: 'obras' as UserType,
      label: 'Obras',
      description: 'Gestão de execução, programação e medições',
      icon: Building,
      color: 'border-orange-200 hover:border-orange-400'
    },
    {
      type: 'financeira' as UserType,
      label: 'Financeiro',
      description: 'Controle financeiro, boletins e relatórios',
      icon: Calculator,
      color: 'border-green-200 hover:border-green-400'
    },
    {
      type: 'comercial' as UserType,
      label: 'Comercial',
      description: 'Propostas, contratos e aceites digitais',
      icon: FileText,
      color: 'border-blue-200 hover:border-blue-400'
    }
  ];

  const handleConfirm = () => {
    if (selectedArea) {
      onAreaSelect(selectedArea);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-blue-600">
            Bem-vindo à CT Guedes!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Olá <strong>{user?.name}</strong>, para configurar seu acesso no sistema, 
            selecione a área à qual você pertence:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {areas.map((area) => (
            <Card 
              key={area.type}
              className={`cursor-pointer transition-all ${area.color} ${
                selectedArea === area.type 
                  ? 'ring-2 ring-blue-500 border-blue-400' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedArea(area.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <area.icon className="w-6 h-6 text-slate-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{area.label}</h3>
                    <p className="text-sm text-slate-600">{area.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedArea === area.type 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-slate-300'
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Button 
            onClick={handleConfirm}
            className="w-full"
            disabled={!selectedArea || isLoading}
          >
            {isLoading ? 'Configurando acesso...' : 'Confirmar Área'}
          </Button>
          
          <p className="text-xs text-slate-500 text-center">
            Esta seleção será permanente e poderá ser alterada apenas por um administrador.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreaSelectionModal;
