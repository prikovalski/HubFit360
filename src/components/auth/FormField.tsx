
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PasswordValidation } from './PasswordValidation';

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  tooltip?: string;
  className?: string;
  options?: { value: string; label: string }[];
  loading?: boolean;
  maxLength?: number;
  showPasswordValidation?: boolean;
}

export const FormField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  required,
  tooltip,
  className,
  options,
  loading,
  maxLength,
  showPasswordValidation = false
}: FormFieldProps) => {
  const fieldId = label.toLowerCase().replace(/\s+/g, '-');
  const hasValue = value && value.length > 0;
  const isPasswordField = type === 'password';

  const LabelComponent = (
    <div className="flex items-center gap-2">
      <Label 
        htmlFor={fieldId}
        className={cn(
          "font-medium",
          hasValue && "text-[#019f80]"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  if (options) {
    return (
      <div className={className}>
        {LabelComponent}
        <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
          <SelectTrigger className={cn(
            "w-full transition-all duration-200",
            hasValue && "border-[#019f80] ring-1 ring-[#019f80]/20"
          )}>
            <SelectValue placeholder={loading ? "Carregando..." : placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={className}>
      {LabelComponent}
      <Input
        type={type}
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          "transition-all duration-200",
          hasValue && "border-[#019f80] ring-1 ring-[#019f80]/20"
        )}
      />
      
      {isPasswordField && showPasswordValidation && (
        <PasswordValidation password={value} />
      )}
    </div>
  );
};
