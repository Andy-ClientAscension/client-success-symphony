
import { Layout } from "@/components/Layout/Layout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { ClientList } from "@/components/Dashboard/ClientList";
import { ChurnChart } from "@/components/Dashboard/ChurnChart";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { KanbanBoard } from "@/components/Dashboard/KanbanBoard";
import { PaymentAlerts } from "@/components/Dashboard/PaymentAlerts";
import { ImportData } from "@/components/Dashboard/ImportData";

export default function Index() {
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MetricsCards />
          </div>
          <div>
            <ImportData />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChurnChart />
          <NPSChart />
          <PaymentAlerts />
        </div>
        
        <ClientList />
        
        <KanbanBoard />
      </div>
    </Layout>
  );
}
