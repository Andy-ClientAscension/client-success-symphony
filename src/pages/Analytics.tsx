
import { Layout } from "@/components/Layout/Layout";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <NPSChart />
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This dashboard provides detailed analytics about your client relationships and satisfaction metrics.
                More detailed analytics components will be added here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
