import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import TourTooltip from './TourTooltip';
import { TourStep } from './tourSteps';

interface ProductTourProps {
  steps: TourStep[];
  currentStep: number;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const TOOLTIP_GAP = 12;

const ProductTour: React.FC<ProductTourProps> = ({
  steps,
  currentStep,
  isActive,
  onNext,
  onPrev,
  onSkip,
}) => {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [arrowSide, setArrowSide] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  const step = steps[currentStep];

  const updatePosition = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (!el) {
      // Element not found, try next step
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    });

    // Scroll element into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Calculate tooltip position
    const tooltipWidth = 320;
    const tooltipHeight = 220;
    const preferred = step.position || 'bottom';

    let tTop = 0;
    let tLeft = 0;
    let arrow: 'top' | 'bottom' | 'left' | 'right' = 'top';

    if (preferred === 'bottom' && rect.bottom + TOOLTIP_GAP + tooltipHeight < window.innerHeight) {
      tTop = rect.bottom + TOOLTIP_GAP;
      tLeft = Math.max(8, Math.min(rect.left, window.innerWidth - tooltipWidth - 8));
      arrow = 'top';
    } else if (preferred === 'top' && rect.top - TOOLTIP_GAP - tooltipHeight > 0) {
      tTop = rect.top - TOOLTIP_GAP - tooltipHeight;
      tLeft = Math.max(8, Math.min(rect.left, window.innerWidth - tooltipWidth - 8));
      arrow = 'bottom';
    } else if (preferred === 'right' && rect.right + TOOLTIP_GAP + tooltipWidth < window.innerWidth) {
      tTop = Math.max(8, rect.top);
      tLeft = rect.right + TOOLTIP_GAP;
      arrow = 'left';
    } else if (preferred === 'left' && rect.left - TOOLTIP_GAP - tooltipWidth > 0) {
      tTop = Math.max(8, rect.top);
      tLeft = rect.left - TOOLTIP_GAP - tooltipWidth;
      arrow = 'right';
    } else {
      // Fallback: bottom
      tTop = rect.bottom + TOOLTIP_GAP;
      tLeft = Math.max(8, Math.min(rect.left, window.innerWidth - tooltipWidth - 8));
      arrow = 'top';
    }

    setTooltipPos({ top: tTop, left: tLeft });
    setArrowSide(arrow);
  }, [step]);

  useEffect(() => {
    if (!isActive) return;
    // Small delay to let DOM settle
    const timer = setTimeout(updatePosition, 150);
    return () => clearTimeout(timer);
  }, [isActive, currentStep, updatePosition]);

  useEffect(() => {
    if (!isActive) return;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isActive, updatePosition]);

  if (!isActive || !step) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[10000] transition-all duration-300"
        onClick={onSkip}
        style={{
          background: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Spotlight cutout */}
      {targetRect && (
        <div
          className="fixed z-[10000] rounded-lg border-2 border-primary/50 transition-all duration-300 pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            background: 'transparent',
          }}
        />
      )}

      {/* Tooltip */}
      <TourTooltip
        title={step.title}
        description={step.description}
        currentStep={currentStep}
        totalSteps={steps.length}
        position={tooltipPos}
        arrowSide={arrowSide}
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
      />
    </>,
    document.body
  );
};

export default ProductTour;
