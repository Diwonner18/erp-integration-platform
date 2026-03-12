import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TourTooltipProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  position: { top: number; left: number };
  arrowSide: 'top' | 'bottom' | 'left' | 'right';
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const TourTooltip: React.FC<TourTooltipProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  position,
  arrowSide,
  onNext,
  onPrev,
  onSkip,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const arrowClasses: Record<string, string> = {
    top: 'bottom-full left-6 border-l-transparent border-r-transparent border-t-transparent border-b-[hsl(var(--card))]',
    bottom: 'top-full left-6 border-l-transparent border-r-transparent border-b-transparent border-t-[hsl(var(--card))]',
    left: 'right-full top-4 border-t-transparent border-b-transparent border-l-transparent border-r-[hsl(var(--card))]',
    right: 'left-full top-4 border-t-transparent border-b-transparent border-r-transparent border-l-[hsl(var(--card))]',
  };

  return (
    <div
      className="fixed z-[10001] w-80 bg-card border border-border rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
      style={{ top: position.top, left: position.left }}
    >
      {/* Arrow */}
      <div className={`absolute w-0 h-0 border-[8px] ${arrowClasses[arrowSide]}`} />

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Passo {currentStep + 1} de {totalSteps}
        </span>
        <button
          onClick={onSkip}
          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4">
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        <h4 className="font-title font-semibold text-foreground text-base mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground font-body leading-relaxed">{description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={isFirst}
          className="text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>
        <Button size="sm" onClick={onNext}>
          {isLast ? 'Concluir' : 'Próximo'}
          {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
};

export default TourTooltip;
