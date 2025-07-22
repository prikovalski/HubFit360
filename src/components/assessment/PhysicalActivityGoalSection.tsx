import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Activity } from "lucide-react";
import { PhysicalActivitiesSection, PhysicalActivity } from '@/components/PhysicalActivitiesSection';

interface PhysicalActivityGoalSectionProps {
  goal: string;
  physicalActivities: PhysicalActivity[];
  onGoalChange: (value: string) => void;
  onPhysicalActivitiesChange: (activities: PhysicalActivity[]) => void;
}

const PhysicalActivityGoalSection = ({
  goal,
  physicalActivities,
  onGoalChange,
  onPhysicalActivitiesChange,
}: PhysicalActivityGoalSectionProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Atividades Físicas e Objetivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="goal" className="text-sm font-medium">
            Objetivo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="goal"
            type="text"
            placeholder="Ex: Perder peso, ganhar massa muscular, melhorar condicionamento..."
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div className="border-t pt-6">
          <PhysicalActivitiesSection
            activities={physicalActivities}
            onChange={onPhysicalActivitiesChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PhysicalActivityGoalSection;