
import { Layout } from "@/components/Layout/Layout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import { ClientList } from "@/components/Dashboard/ClientList";
import { ChurnChart } from "@/components/Dashboard/ChurnChart";
import { NPSChart } from "@/components/Dashboard/NPSChart";
import { KanbanBoard } from "@/components/Dashboard/KanbanBoard";
import { PaymentAlerts } from "@/components/Dashboard/PaymentAlerts";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-2 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold tracking-tight pl-0">Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <MetricsCards />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-1">
            <ChurnChart />
          </div>
          <div className="col-span-1">
            <NPSChart />
          </div>
          <div className="col-span-1">
            <PaymentAlerts />
          </div>
        </div>
        
        {!isMobile && <ClientList />}
        
        {!isMobile && <KanbanBoard />}

        {isMobile && (
          <>
            <div className="pt-4">
              <ClientList />
            </div>
            <div className="pt-4">
              <KanbanBoard />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
