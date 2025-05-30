
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const AuthCard = ({ title, description, children }: AuthCardProps) => {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800">
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};
