"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ResultSkeleton = () => {
  return (
    <Card className="border-0 bg-secondary shadow-lg">
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-[90%]" />
      </CardContent>
    </Card>
  );
};

export default ResultSkeleton;
