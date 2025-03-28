
import { Layout } from "@/components/Layout/Layout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { ClientList } from "@/components/Dashboard/ClientList";
import { ChurnChart } from "@/components/Dashboard/ChurnChart";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { KanbanBoard } from "@/components/Dashboard/KanbanBoard";
import { PaymentAlerts } from "@/components/Dashboard/PaymentAlerts";
import { ImportData } from "@/components/Dashboard/ImportData";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="flex-1 space-y-3 p-4 pt-3 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <MetricsCards />
          </div>
          <div>
            <ImportData />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <ChurnChart />
          <NPSChart />
          <PaymentAlerts />
        </div>
        
        {!isMobile && <ClientList />}
        
        {!isMobile && <KanbanBoard />}

        {isMobile && (
          <>
            <div className="pt-2">
              <ClientList />
            </div>
            <div className="pt-2">
              <KanbanBoard />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
