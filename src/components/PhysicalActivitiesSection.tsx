
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface PhysicalActivity {
  type: string;
  frequency: string;
}

interface PhysicalActivitiesSectionProps {
  activities: PhysicalActivity[];
  onChange: (activities: PhysicalActivity[]) => void;
  disabled?: boolean;
}

export const PhysicalActivitiesSection = ({ 
  activities, 
  onChange, 
  disabled = false 
}: PhysicalActivitiesSectionProps) => {
  const addActivity = () => {
    onChange([...activities, { type: '', frequency: '' }]);
  };

  const removeActivity = (index: number) => {
    const newActivities = activities.filter((_, i) => i !== index);
    onChange(newActivities);
  };

  const updateActivity = (index: number, field: keyof PhysicalActivity, value: string) => {
    const newActivities = activities.map((activity, i) => 
      i === index ? { ...activity, [field]: value } : activity
    );
    onChange(newActivities);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#019f80]/10 rounded-full flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#019f80]" />
          </div>
          <div>
            <Label className="text-base font-semibold text-gray-900">Atividades Físicas</Label>
            <p className="text-sm text-gray-600">Adicione suas atividades físicas regulares</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addActivity}
          disabled={disabled}
          className="flex items-center gap-2 hover:bg-[#019f80]/5 hover:border-[#019f80] hover:text-[#019f80]"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {activities.length === 0 && (
        <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade adicionada</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">
              Clique em "Adicionar" para incluir suas atividades físicas regulares
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={addActivity}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar primeira atividade
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <Card key={index} className="border border-gray-200 hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#019f80]/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Activity className="w-5 h-5 text-[#019f80]" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label 
                      htmlFor={`activity-type-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Tipo de Exercício
                    </Label>
                    <Input
                      id={`activity-type-${index}`}
                      value={activity.type}
                      onChange={(e) => updateActivity(index, 'type', e.target.value)}
                      placeholder="Ex: Musculação, corrida, natação..."
                      disabled={disabled}
                      className={cn(
                        "mt-1 transition-all duration-200",
                        activity.type && "border-[#019f80]/50 ring-1 ring-[#019f80]/20"
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label 
                      htmlFor={`activity-frequency-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Frequência
                    </Label>
                    <Input
                      id={`activity-frequency-${index}`}
                      value={activity.frequency}
                      onChange={(e) => updateActivity(index, 'frequency', e.target.value)}
                      placeholder="Ex: 3x por semana, diariamente..."
                      disabled={disabled}
                      className={cn(
                        "mt-1 transition-all duration-200",
                        activity.frequency && "border-[#019f80]/50 ring-1 ring-[#019f80]/20"
                      )}
                    />
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeActivity(index)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activities.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addActivity}
            disabled={disabled}
            className="flex items-center gap-2 hover:bg-[#019f80]/5 hover:border-[#019f80] hover:text-[#019f80]"
          >
            <Plus className="h-4 w-4" />
            Adicionar outra atividade
          </Button>
        </div>
      )}
    </div>
  );
};

export type { PhysicalActivity };
