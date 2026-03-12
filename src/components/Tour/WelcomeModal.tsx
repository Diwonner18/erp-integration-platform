import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GraduationCap, MapPin } from 'lucide-react';
import { getUserTypeWelcome } from './tourSteps';

interface WelcomeModalProps {
  open: boolean;
  userName: string;
  userType: string;
  onStartTour: () => void;
  onSkip: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  open,
  userName,
  userType,
  onStartTour,
  onSkip,
}) => {
  const welcome = getUserTypeWelcome(userType);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onSkip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-title">
            Bem-vindo, {userName}! 🎉
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <span className="block">
              Você está logado como <strong className="text-foreground">{welcome.role}</strong>
            </span>
            <span className="block text-muted-foreground">
              {welcome.description}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border my-2">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground font-body">
            Quer fazer um <strong className="text-foreground">tour rápido</strong> pelo sistema? Vamos mostrar onde encontrar tudo!
          </p>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Agora não
          </Button>
          <Button onClick={onStartTour} className="flex-1">
            <GraduationCap className="w-4 h-4 mr-2" />
            Iniciar Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
