
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
      <div className="flex-1 space-y-0.5 p-0.5 pt-0.5 overflow-auto">
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-sm font-bold tracking-tight pl-0.5">Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-0.5 md:grid-cols-12">
          <div className="md:col-span-11">
            <MetricsCards />
          </div>
          <div className="md:col-span-1">
            <ImportData />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-0.5 md:grid-cols-6">
          <div className="md:col-span-2">
            <ChurnChart />
          </div>
          <div className="md:col-span-2">
            <NPSChart />
          </div>
          <div className="md:col-span-2">
            <PaymentAlerts />
          </div>
        </div>
        
        {!isMobile && <ClientList />}
        
        {!isMobile && <KanbanBoard />}

        {isMobile && (
          <>
            <div className="pt-0.5">
              <ClientList />
            </div>
            <div className="pt-0.5">
              <KanbanBoard />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
