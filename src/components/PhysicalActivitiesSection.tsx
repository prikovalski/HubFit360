
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Atividades Físicas</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addActivity}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Atividade
        </Button>
      </div>

      {activities.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
          Clique em "Adicionar Atividade" para começar
        </div>
      )}

      {activities.map((activity, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <Label htmlFor={`activity-type-${index}`}>Tipo de Exercício</Label>
            <Input
              id={`activity-type-${index}`}
              value={activity.type}
              onChange={(e) => updateActivity(index, 'type', e.target.value)}
              placeholder="Ex: Musculação, corrida..."
              disabled={disabled}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor={`activity-frequency-${index}`}>Frequência</Label>
              <Input
                id={`activity-frequency-${index}`}
                value={activity.frequency}
                onChange={(e) => updateActivity(index, 'frequency', e.target.value)}
                placeholder="Ex: 3-4 dias/semana"
                disabled={disabled}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeActivity(index)}
                disabled={disabled}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export type { PhysicalActivity };
