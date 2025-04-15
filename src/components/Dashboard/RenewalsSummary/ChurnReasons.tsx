
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChurnReasonsProps {
  topChurnReasons: [string, number][];
}

export function ChurnReasons({ topChurnReasons }: ChurnReasonsProps) {
  if (topChurnReasons.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Churn Reasons</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {topChurnReasons.map(([reason, count], index) => (
            <li key={`top-reason-${index}`} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
              <span className="font-medium">{reason}</span>
              <Badge variant="outline">{count} {count === 1 ? 'client' : 'clients'}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
