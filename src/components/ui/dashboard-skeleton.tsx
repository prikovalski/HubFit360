
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-0 shadow-lg bg-gradient-to-r from-[#019f80] to-green-600">
          <CardContent className="p-6 text-center">
            <Skeleton className="h-8 w-16 mx-auto mb-2 bg-white/20" />
            <Skeleton className="h-4 w-24 mx-auto bg-white/20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const DashboardHeaderSkeleton = () => {
  return (
    <div className="mb-8 space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
};
