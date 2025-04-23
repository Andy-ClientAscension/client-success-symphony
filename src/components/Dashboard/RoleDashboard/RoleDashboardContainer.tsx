
import React, { useState } from "react";
import { RoleBasedTabs, TabItem, UserRole } from "@/components/Dashboard/Tabs/RoleBasedTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart2, 
  Activity, 
  DollarSign, 
  Users, 
  LineChart, 
  PieChart 
} from "lucide-react";

// Example content components for each role
const ExecutiveContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Executive Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">$1.2M</p>
          <p className="text-sm text-muted-foreground">+12% from last month</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Client Retention</h3>
          <p className="text-3xl font-bold">94%</p>
          <p className="text-sm text-muted-foreground">+2% from last month</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Overall Health</h3>
          <p className="text-3xl font-bold">Good</p>
          <p className="text-sm text-muted-foreground">3 items need attention</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const OperationalContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Operational Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Response Time</h3>
          <p className="text-2xl font-bold">1.4 hours</p>
          <p className="text-sm text-muted-foreground">Service level: 98%</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Open Tasks</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold">24</p>
              <p className="text-xs">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">42</p>
              <p className="text-xs">Medium Priority</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">18</p>
              <p className="text-xs">Low Priority</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AnalyticalContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Analytical Deep Dive</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Client Segmentation</h3>
          <p className="text-sm mb-2">Distribution by industry:</p>
          <div className="h-40 bg-accent/20 rounded flex items-center justify-center">
            [Detailed Chart Placeholder]
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Trend Analysis</h3>
          <div className="h-40 bg-accent/20 rounded flex items-center justify-center">
            [Interactive Graph Placeholder]
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function RoleDashboardContainer() {
  // This would typically come from an auth context
  const [currentRole, setCurrentRole] = useState<UserRole>("executive");
  
  const tabs: TabItem[] = [
    {
      id: "revenue",
      label: "Revenue",
      icon: <DollarSign className="h-4 w-4" />,
      content: <div className="p-4">Revenue details for {currentRole}</div>,
      roles: ["executive", "analytical"]
    },
    {
      id: "clients",
      label: "Clients",
      icon: <Users className="h-4 w-4" />,
      content: <div className="p-4">Client details for {currentRole}</div>,
      roles: ["executive", "operational", "analytical"]
    },
    {
      id: "performance",
      label: "Performance",
      icon: <Activity className="h-4 w-4" />,
      content: <div className="p-4">Performance details for {currentRole}</div>,
      roles: ["operational", "analytical"]
    },
    {
      id: "trends",
      label: "Trends",
      icon: <LineChart className="h-4 w-4" />,
      content: <div className="p-4">Trend analysis for {currentRole}</div>,
      roles: ["analytical"]
    },
    {
      id: "overview",
      label: "Overview",
      icon: <PieChart className="h-4 w-4" />,
      content: currentRole === "executive" ? <ExecutiveContent /> : 
               currentRole === "operational" ? <OperationalContent /> : 
               <AnalyticalContent />,
      roles: ["executive", "operational", "analytical"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold">Role-Based Dashboard</h2>
        <div className="flex space-x-2">
          <Button 
            variant={currentRole === "executive" ? "default" : "outline"}
            onClick={() => setCurrentRole("executive")}
            size="sm"
          >
            Executive View
          </Button>
          <Button 
            variant={currentRole === "operational" ? "default" : "outline"}
            onClick={() => setCurrentRole("operational")}
            size="sm"
          >
            Operational View
          </Button>
          <Button 
            variant={currentRole === "analytical" ? "default" : "outline"}
            onClick={() => setCurrentRole("analytical")}
            size="sm"
          >
            Analytical View
          </Button>
        </div>
      </div>
      
      <RoleBasedTabs 
        tabs={tabs} 
        userRole={currentRole}
        defaultTab="overview"
      />
    </div>
  );
}
