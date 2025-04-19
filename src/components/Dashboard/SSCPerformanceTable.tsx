
import React, { useState } from "react";
import { TableCell, TableBody, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { SSCPerformanceRow } from "./SSCPerformanceRow";
import { Client } from "@/lib/data";
import { HelpCircle, PlusCircle, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VirtualizedTable, Column } from "@/components/Dashboard/Shared/VirtualizedTable";

interface SSCPerformanceTableProps {
  csmList: string[];
  clients: Client[];
  selectedTeam: string;
}

const excludedSSCs = [
  "John Smith",
  "Sarah Johnson",
  "Michael Brown",
  "Emily Davis",
  "David Wilson",
  "Jennifer Taylor",
  "Robert Anderson",
  "Jessica Thomas",
  "William Martinez",
  "Sophia Martinez"
];

export function SSCPerformanceTable({ csmList, clients, selectedTeam }: SSCPerformanceTableProps) {
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [filteredCsmList, setFilteredCsmList] = useState<string[]>(
    csmList.filter(csm => !excludedSSCs.includes(csm))
  );
  const [csmToDelete, setCsmToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSSCName, setNewSSCName] = useState("");

  const handleDeleteCSM = (csm: string) => {
    setCsmToDelete(csm);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (csmToDelete) {
      setFilteredCsmList(prev => prev.filter(csm => csm !== csmToDelete));
      toast({
        title: "Account deleted",
        description: `${csmToDelete} has been removed from the list.`,
      });
      setCsmToDelete(null);
    }
    setShowDeleteDialog(false);
  };

  const cancelDelete = () => {
    setCsmToDelete(null);
    setShowDeleteDialog(false);
  };

  const handleAddSSC = () => {
    setShowAddDialog(true);
  };

  const confirmAddSSC = () => {
    if (newSSCName.trim()) {
      if (filteredCsmList.includes(newSSCName.trim())) {
        toast({
          title: "Duplicate Name",
          description: "This SSC name already exists in the list.",
          variant: "destructive",
        });
        return;
      }
      setFilteredCsmList(prev => [...prev, newSSCName.trim()]);
      toast({
        title: "SSC Added",
        description: `${newSSCName.trim()} has been added to the list.`,
      });
      setNewSSCName("");
      setShowAddDialog(false);
    } else {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name for the SSC.",
        variant: "destructive",
      });
    }
  };

  const cancelAddSSC = () => {
    setNewSSCName("");
    setShowAddDialog(false);
  };

  const columns: Column<string>[] = [
    {
      key: 'name',
      header: 'SSC',
      cell: (csm) => <span className="font-medium">{csm}</span>,
      className: isMobile ? 'w-[120px]' : 'w-[180px]'
    },
    {
      key: 'clients',
      header: 'Clients',
      cell: (csm) => {
        const csmClients = clients.filter(client => client.csm === csm);
        return <div className="text-center">{csmClients.length}</div>;
      },
      className: isMobile ? 'w-[70px]' : 'w-[100px]'
    },
    {
      key: 'backendStudents',
      header: 'Backend Students',
      cell: (csm) => {
        const backendCount = clients.filter(
          client => client.csm === csm && client.team?.toLowerCase().includes('backend')
        ).length;
        return <div className="text-center">{backendCount}</div>;
      },
      className: isMobile ? 'hidden' : 'w-[180px]',
      hideOnMobile: true
    },
    {
      key: 'metrics',
      header: (
        <div className="flex justify-between">
          <div className="min-w-[80px]">Team Health</div>
          <div className="flex-1 text-right">Metrics</div>
        </div>
      ),
      cell: (csm) => {
        const csmClients = clients.filter(client => client.csm === csm);
        const healthScore = Math.round(
          (csmClients.filter(c => c.status === 'active').length / csmClients.length) * 100
        );
        return (
          <div className="flex items-center justify-between">
            <div className="min-w-[80px]">
              {healthScore >= 80 ? 'A' : 
               healthScore >= 60 ? 'B' :
               healthScore >= 40 ? 'C' :
               healthScore >= 20 ? 'D' : 'F'}
            </div>
            <Progress value={healthScore} className="w-24" />
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Action',
      cell: (csm) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteCSM(csm)}
          className="w-full justify-center"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
      className: 'w-[60px] text-center'
    }
  ];

  const filteredCSMs = filteredCsmList.filter(csm => {
    if (selectedTeam === "all") return true;
    return clients.some(client => client.csm === csm && client.team === selectedTeam);
  });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="text-base font-medium">Student Success Coach Performance</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-3">
                <p className="text-xs">Team Health Grade is calculated based on multiple factors:</p>
                <ul className="text-xs mt-1 list-disc pl-4">
                  <li>NPS Score (30%)</li>
                  <li>Client Retention (30%)</li>
                  <li>Growth Metrics (20%)</li>
                  <li>MRR Trends (20%)</li>
                </ul>
                <p className="text-xs mt-1">Grades range from F (poor) to A+ (excellent)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button 
          size="sm" 
          onClick={handleAddSSC}
          className="bg-red-600 hover:bg-red-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add SSC
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden bg-card text-card-foreground dark:border-gray-700">
        <Card>
          <VirtualizedTable
            data={filteredCSMs}
            columns={columns}
            keyExtractor={(csm) => csm}
            emptyMessage="No SSCs found for the selected team."
            className="border rounded-lg"
            stripedRows={true}
            hoverable={true}
            itemHeight={56}
          />
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {csmToDelete}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New SSC</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the name of the new Student Success Coach you want to add.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Enter SSC name"
              value={newSSCName}
              onChange={(e) => setNewSSCName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAddSSC}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAddSSC}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Add SSC
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
