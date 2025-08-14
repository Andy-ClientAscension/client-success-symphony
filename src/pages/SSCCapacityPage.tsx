import { DashboardLayout } from '@/components/templates';
import { SSCCapacityDashboard } from '@/components/Dashboard/SSCCapacity';

export function SSCCapacityPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <SSCCapacityDashboard />
      </div>
    </DashboardLayout>
  );
}