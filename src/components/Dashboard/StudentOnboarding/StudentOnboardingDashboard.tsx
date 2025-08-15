import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ImportStudentData } from "./ImportStudentData";
import { StudentList } from "./StudentList";
import { GoogleFormIntegration } from "./GoogleFormIntegration";
import { StudentStats } from "./StudentStats";
import { StudentFilters } from "./StudentFilters";
import { UserPlus, FileText, Users, Download, Settings } from "lucide-react";
import { getAllClients } from "@/lib/data";

export function StudentOnboardingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedSSC, setSelectedSSC] = useState("all");
  
  const clients = getAllClients();
  
  // Main SSCs
  const mainSSCs = ["Andy", "Chris", "Cillin", "Nick", "Stephen"];
  
  // Extract unique teams and filter clients
  const { teams, filteredClients } = useMemo(() => {
    const uniqueTeams = [...new Set(clients.map(c => c.team).filter(Boolean))].sort();
    
    let filtered = clients;
    
    // Apply team filter
    if (selectedTeam !== "all") {
      filtered = filtered.filter(c => c.team === selectedTeam);
    }
    
    // Apply SSC filter
    if (selectedSSC !== "all") {
      if (selectedSSC === "none") {
        filtered = filtered.filter(c => !c.csm && !c.assigned_ssc);
      } else {
        filtered = filtered.filter(c => c.csm === selectedSSC || c.assigned_ssc === selectedSSC);
      }
    }
    
    return {
      teams: uniqueTeams,
      filteredClients: filtered
    };
  }, [clients, selectedTeam, selectedSSC]);
  
  // Filter students by status using filtered data
  const activeStudents = filteredClients.filter(c => c.status === 'active');
  const newStudents = filteredClients.filter(c => c.status === 'new');
  const graduatedStudents = filteredClients.filter(c => c.status === 'graduated');
  const atRiskStudents = filteredClients.filter(c => c.status === 'at-risk');
  const noSSCStudents = filteredClients.filter(c => !c.csm && !c.assigned_ssc);

  const handleClearFilters = () => {
    setSelectedTeam("all");
    setSelectedSSC("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            Onboard new students and track their journey from enrollment to graduation
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Import Students
              </Button>
            </DialogTrigger>
            <ImportStudentData />
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Setup Google Forms
              </Button>
            </DialogTrigger>
            <GoogleFormIntegration />
          </Dialog>
        </div>
      </div>

      <StudentFilters
        teams={teams}
        sscs={mainSSCs}
        selectedTeam={selectedTeam}
        selectedSSC={selectedSSC}
        onTeamChange={setSelectedTeam}
        onSSCChange={setSelectedSSC}
        onClearFilters={handleClearFilters}
      />

      <StudentStats 
        totalStudents={filteredClients.length}
        activeStudents={activeStudents.length}
        newStudents={newStudents.length}
        graduatedStudents={graduatedStudents.length}
        atRiskStudents={atRiskStudents.length}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active ({activeStudents.length})</TabsTrigger>
          <TabsTrigger value="new">New ({newStudents.length})</TabsTrigger>
          <TabsTrigger value="no-ssc">No SSC ({noSSCStudents.length})</TabsTrigger>
          <TabsTrigger value="alumni">Alumni ({graduatedStudents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Google Form Integration
                </CardTitle>
                <CardDescription>
                  Automatically add students who complete your onboarding form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Google Form to automatically create student records when new students complete onboarding.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Setup Integration
                    </Button>
                  </DialogTrigger>
                  <GoogleFormIntegration />
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Bulk Import
                </CardTitle>
                <CardDescription>
                  Import multiple students from CSV or JSON files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a file with student data to quickly add multiple students to your system.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Import Students
                    </Button>
                  </DialogTrigger>
                  <ImportStudentData />
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest student onboarding and status updates</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentList 
                students={filteredClients.slice(0, 10)} 
                showActions={false}
                compact={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Students</CardTitle>
              <CardDescription>Students currently enrolled in programs</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentList students={activeStudents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Students</CardTitle>
              <CardDescription>Recently onboarded students requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentList students={newStudents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="no-ssc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>No SSC Assigned</CardTitle>
              <CardDescription>Students without a Student Success Consultant</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentList students={noSSCStudents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alumni" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alumni</CardTitle>
              <CardDescription>Students who have completed their programs</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentList students={graduatedStudents} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}