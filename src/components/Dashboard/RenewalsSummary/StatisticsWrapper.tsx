
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, BarChart, Calendar, TrendingUp } from "lucide-react";
import { format, subMonths, subDays } from 'date-fns';
import { useDashboardSettings } from '@/hooks/use-dashboard-settings';

import { StatisticsCards } from './StatisticsCards';

// Simulate fetching data
const fetchRenewalStatsByPeriod = (period: 'week' | 'month' | 'quarter' | 'year') => {
  // This would normally come from an API
  const getRandomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  let renewedClients: number;
  let churnedClients: number;
  
  switch (period) {
    case 'week':
      renewedClients = getRandomInRange(3, 8);
      churnedClients = getRandomInRange(0, 2);
      break;
    case 'month':
      renewedClients = getRandomInRange(15, 25);
      churnedClients = getRandomInRange(2, 5);
      break;
    case 'quarter':
      renewedClients = getRandomInRange(40, 60);
      churnedClients = getRandomInRange(5, 10);
      break;
    case 'year':
      renewedClients = getRandomInRange(150, 200);
      churnedClients = getRandomInRange(20, 30);
      break;
  }
  
  const totalClients = renewedClients + churnedClients;
  const renewalRate = totalClients > 0 ? (renewedClients / totalClients) * 100 : 0;
  
  return {
    renewedClients,
    churnedClients,
    renewalRate
  };
};

export function StatisticsWrapper() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [stats, setStats] = useState({
    renewedClients: 0,
    churnedClients: 0,
    renewalRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useDashboardSettings();
  
  // Initial data loading
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const data = fetchRenewalStatsByPeriod(period);
      setStats(data);
      setIsLoading(false);
    }, 500);
  }, [period]);
  
  // Set up auto-refresh if enabled in settings
  useEffect(() => {
    if (!settings.autoRefresh) return;
    
    const intervalId = setInterval(() => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const data = fetchRenewalStatsByPeriod(period);
        setStats(data);
        setIsLoading(false);
      }, 500);
    }, settings.refreshInterval * 60 * 1000); // Convert minutes to milliseconds
    
    return () => clearInterval(intervalId);
  }, [period, settings.autoRefresh, settings.refreshInterval]);
  
  const getPeriodLabel = () => {
    const now = new Date();
    switch (period) {
      case 'week':
        return `${format(subDays(now, 7), 'MMM d')} - ${format(now, 'MMM d, yyyy')}`;
      case 'month':
        return `${format(subMonths(now, 1), 'MMM d')} - ${format(now, 'MMM d, yyyy')}`;
      case 'quarter':
        return `${format(subMonths(now, 3), 'MMM d')} - ${format(now, 'MMM d, yyyy')}`;
      case 'year':
        return `${format(subMonths(now, 12), 'MMM d, yyyy')} - ${format(now, 'MMM d, yyyy')}`;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Renewal Statistics
          </CardTitle>
          
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-full sm:w-auto mt-2 sm:mt-0">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-sm text-muted-foreground mt-1 flex items-center">
          <Calendar className="mr-1 h-3.5 w-3.5" />
          {getPeriodLabel()}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-primary"></div>
          </div>
        ) : (
          <StatisticsCards 
            renewedClients={stats.renewedClients} 
            churnedClients={stats.churnedClients} 
            renewalRate={stats.renewalRate} 
          />
        )}
      </CardContent>
    </Card>
  );
}
