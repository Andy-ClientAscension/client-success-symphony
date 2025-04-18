
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, TrendingUp, Calendar, Phone, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllClients, Client } from "@/lib/data";
import { VirtualizedTable, Column } from "./Shared/VirtualizedTable";

export function ClientAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const clients = useMemo(() => getAllClients(), []);
  
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase().trim();
    return clients.filter(client => 
      client.name.toLowerCase().includes(query) || 
      (client.csm && client.csm.toLowerCase().includes(query))
    );
  }, [clients, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages));
  }, [totalPages]);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'at-risk': return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case 'churned': return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case 'new': return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  }, []);

  // Define columns for virtualized table
  const columns: Column<Client>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Client',
      cell: (client) => <span className="font-medium">{client.name}</span>
    },
    {
      key: 'status',
      header: 'Status',
      cell: (client) => (
        <Badge variant="outline" className={`${getStatusColor(client.status)}`}>
          {client.status}
        </Badge>
      )
    },
    {
      key: 'progress',
      header: 'Progress',
      cell: (client) => (
        <div className="flex items-center">
          <Progress value={client.progress} className="h-2 w-16 mr-2" />
          <span className="text-xs">{client.progress}%</span>
        </div>
      )
    },
    {
      key: 'csm',
      header: 'CSM',
      cell: (client) => client.csm || "Unassigned"
    },
    {
      key: 'mrr',
      header: 'MRR',
      cell: (client) => (
        <div className="flex items-center">
          <DollarSign className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
          {client.mrr}
        </div>
      )
    },
    {
      key: 'calls',
      header: 'Calls',
      cell: (client) => (
        <div className="flex items-center">
          <Phone className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />
          {client.callsBooked}
        </div>
      )
    },
    {
      key: 'reviews',
      header: 'Reviews',
      cell: (client) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center" title="TrustPilot Review">
            {client.trustPilotReview?.rating ? 
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> :
              <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            }
          </div>
          <div className="flex items-center" title="Case Study">
            {client.caseStudyInterview?.completed ? 
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> :
              <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            }
          </div>
        </div>
      )
    },
    {
      key: 'details',
      header: 'Details',
      cell: (client) => (
        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
          <Link to={`/clients/${client.id}`}>
            View Details
          </Link>
        </Button>
      )
    }
  ], [getStatusColor]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Client Analytics</CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-[240px]">
              <Input
                placeholder="Search clients or CSMs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[80px] h-8 text-xs">
                <SelectValue placeholder="Show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="250">250</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <VirtualizedTable
          data={currentItems}
          columns={columns}
          keyExtractor={(client) => client.id}
          emptyMessage="No clients found matching your filters."
          className="border rounded-lg"
          stripedRows={true}
          hoverable={true}
          itemHeight={48}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: paginate,
            totalItems: filteredClients.length,
            itemsPerPage,
            startIndex: indexOfFirstItem,
            endIndex: Math.min(indexOfLastItem, filteredClients.length)
          }}
        />
      </CardContent>
    </Card>
  );
}
