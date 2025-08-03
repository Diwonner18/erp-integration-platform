
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'success' | 'info' | 'warning';
  loading?: boolean;
}

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  loading = false
}: ConfirmationModalProps) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <X className="w-6 h-6 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            className={getConfirmButtonStyle()}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
