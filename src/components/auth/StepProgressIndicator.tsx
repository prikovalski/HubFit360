
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
}

export const StepProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepTitles,
  onStepClick 
}: StepProgressIndicatorProps) => {
  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Etapa {currentStep} de {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% completo
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#019f80] h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="hidden md:flex justify-between items-center">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = stepNumber <= currentStep && onStepClick;

          return (
            <div 
              key={stepNumber}
              className={cn(
                "flex flex-col items-center cursor-pointer transition-all duration-200",
                isClickable && "hover:scale-105"
              )}
              onClick={() => isClickable && onStepClick(stepNumber)}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                isCompleted && "bg-[#019f80] text-white",
                isCurrent && "bg-[#019f80] text-white ring-4 ring-[#019f80]/20",
                !isCompleted && !isCurrent && "bg-gray-200 text-gray-600"
              )}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={cn(
                "text-xs mt-2 text-center max-w-20 leading-tight",
                (isCompleted || isCurrent) ? "text-[#019f80] font-medium" : "text-gray-500"
              )}>
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
