
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormSection = ({ title, description, children, icon }: FormSectionProps) => {
  return (
    <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        {icon && (
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-[#019f80]/10 rounded-full flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
        <CardDescription className="text-gray-600 mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};
