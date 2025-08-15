import React, { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { EnhancedErrorBoundary } from "@/components/ui/error-boundary-enhanced";
import { UserManagement } from "@/components/Admin/UserManagement";
import { StudentManagement } from "@/components/Admin/StudentManagement";
import { SSCManagement } from "@/components/Admin/SSCManagement";
import { AccessManagement } from "@/components/Admin/AccessManagement";
import { Shield, Users, GraduationCap, UserCog, Key } from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <Layout>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Admin Panel"
          subtitle="Manage users, students, SSCs, and access permissions"
          showBackButton
          showHomeButton
        />
        
        <Card className="card-elevated">
          <div className="p-6">
            <EnhancedErrorBoundary
              title="Error Loading Admin Panel"
              showDetails={process.env.NODE_ENV === 'development'}
            >
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger 
                    value="users"
                    className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Users className="h-4 w-4" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger 
                    value="students"
                    className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Students
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sscs"
                    className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <UserCog className="h-4 w-4" />
                    SSCs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="access"
                    className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Key className="h-4 w-4" />
                    Access
                  </TabsTrigger>
                </TabsList>
                
                <div className="space-y-6">
                  <TabsContent value="users" className="mt-0 space-y-6">
                    <EnhancedErrorBoundary title="Error Loading User Management">
                      <UserManagement />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="students" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Student Management">
                      <StudentManagement />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="sscs" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading SSC Management">
                      <SSCManagement />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="access" className="mt-0 space-y-4">
                    <EnhancedErrorBoundary title="Error Loading Access Management">
                      <AccessManagement />
                    </EnhancedErrorBoundary>
                  </TabsContent>
                </div>
              </Tabs>
            </EnhancedErrorBoundary>
          </div>
        </Card>
      </div>
    </Layout>
  );
}