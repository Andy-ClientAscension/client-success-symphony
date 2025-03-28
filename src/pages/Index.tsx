
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
      <div className="flex-1 space-y-1 p-2 pt-1 overflow-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold tracking-tight">Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-1 md:grid-cols-6 lg:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-11">
            <MetricsCards />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <ImportData />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
          <div className="md:col-span-1">
            <ChurnChart />
          </div>
          <div className="md:col-span-1">
            <NPSChart />
          </div>
          <div className="md:col-span-1">
            <PaymentAlerts />
          </div>
        </div>
        
        {!isMobile && <ClientList />}
        
        {!isMobile && <KanbanBoard />}

        {isMobile && (
          <>
            <div className="pt-1">
              <ClientList />
            </div>
            <div className="pt-1">
              <KanbanBoard />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
