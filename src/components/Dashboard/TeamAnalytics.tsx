
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Share2, Plus, RotateCw, PanelLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useToast } from "@/hooks/use-toast";
import { TeamMetricsOverview } from './TeamAnalytics/TeamMetricsOverview';
import { DashboardSection } from './TeamAnalytics/components/DashboardSection';
import { useTeamMetrics } from './TeamAnalytics/hooks/useTeamMetrics';
import { useDashboardConfig } from './TeamAnalytics/hooks/useDashboardConfig';
import { Skeleton } from "@/components/ui/skeleton";

export function TeamAnalytics() {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { copy } = useCopyToClipboard();
  const { toast } = useToast();

  // Use our custom hooks
  const dashboardConfig = useDashboardConfig();
  const { config, toggleSectionExpansion, removeSection, addSection, changeTeam, 
          resetToDefaults, getShareableConfigUrl, availableSections, availableTeams } = dashboardConfig;

  const { metrics, loading, error, rawData, refetch } = useTeamMetrics(config.selectedTeam);

  const handleShare = () => {
    const shareableUrl = getShareableConfigUrl();
    copy(shareableUrl);
    toast({
      title: "Link copied",
      description: "Dashboard configuration link copied to clipboard"
    });
    setShareDialogOpen(false);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="font-semibold text-lg text-red-700 dark:text-red-400">Failed to load team analytics</h3>
            <p className="text-red-600 dark:text-red-300 mt-2">{error.message}</p>
            <Button variant="outline" className="mt-4" onClick={refetch}>
              <RotateCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate indicator trends with appropriate display components
  const renderTrendIndicator = (value: number) => {
    if (value > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (value < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  // Format percentages
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Render content based on visible sections
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'metrics':
        return (
          <TeamMetricsOverview
            metrics={rawData.metrics}
            statusCounts={rawData.statusCounts}
            rates={{
              retentionRate: metrics.retentionRate,
              atRiskRate: metrics.atRiskRate,
              churnRate: metrics.churnRate,
              retentionTrend: rawData.trends.retentionTrend,
              atRiskTrend: rawData.trends.atRiskTrend,
              churnTrend: rawData.trends.churnTrend,
            }}
          />
        );
      case 'client-status':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Retention Rate</span>
                  <span className="flex items-center">
                    {formatPercent(metrics.retentionRate)}
                    {renderTrendIndicator(rawData.trends.retentionTrend)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {rawData.trends.retentionTrend > 0 
                    ? `Up ${rawData.trends.retentionTrend}% from previous period`
                    : rawData.trends.retentionTrend < 0
                      ? `Down ${Math.abs(rawData.trends.retentionTrend)}% from previous period` 
                      : 'No change from previous period'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>At Risk Rate</span>
                  <span className="flex items-center">
                    {formatPercent(metrics.atRiskRate)}
                    {renderTrendIndicator(-rawData.trends.atRiskTrend)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {rawData.trends.atRiskTrend > 0 
                    ? `Up ${rawData.trends.atRiskTrend}% from previous period`
                    : rawData.trends.atRiskTrend < 0
                      ? `Down ${Math.abs(rawData.trends.atRiskTrend)}% from previous period` 
                      : 'No change from previous period'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Churn Rate</span>
                  <span className="flex items-center">
                    {formatPercent(metrics.churnRate)}
                    {renderTrendIndicator(-rawData.trends.churnTrend)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {rawData.trends.churnTrend > 0 
                    ? `Up ${rawData.trends.churnTrend}% from previous period`
                    : rawData.trends.churnTrend < 0
                      ? `Down ${Math.abs(rawData.trends.churnTrend)}% from previous period` 
                      : 'No change from previous period'}
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'performance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${rawData.metrics.totalMRR.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-2">Monthly Recurring Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-lg font-medium">{rawData.metrics.totalCallsBooked}</div>
                  <p className="text-sm text-muted-foreground">Calls Booked</p>
                </div>
                <div>
                  <div className="text-lg font-medium">{rawData.metrics.totalDealsClosed}</div>
                  <p className="text-sm text-muted-foreground">Deals Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'health-scores':
      case 'health-trends':
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                This section is under development and will be available soon.
              </p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header with Team selector and Action buttons */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex items-center gap-2 flex-grow">
          <Select 
            value={config.selectedTeam} 
            onValueChange={changeTeam}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              {availableTeams.map(team => (
                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RotateCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setConfigDialogOpen(true)}>
                  <PanelLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Customize</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Customize dashboard sections</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share dashboard configuration</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="space-y-6">
        {config.visibleSections.map((sectionKey) => {
          const sectionConfig = defaultSections.find(s => s.key === sectionKey);
          if (!sectionConfig) return null;
          
          return (
            <DashboardSection
              key={sectionKey}
              id={sectionKey}
              title={sectionConfig.label}
              defaultOpen={config.expandedSections.includes(sectionKey)}
              onToggle={(id, isOpen) => toggleSectionExpansion(id as DashboardSectionKey, isOpen)}
              onRemove={(id) => removeSection(id as DashboardSectionKey)}
              removable={config.visibleSections.length > 1}
            >
              {renderSection(sectionKey)}
            </DashboardSection>
          );
        })}
      </div>

      {/* Customize Dashboard Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Dashboard</DialogTitle>
            <DialogDescription>
              Select which sections to display in your dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              {availableSections.map(section => (
                <div key={section.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`section-${section.key}`}
                    checked={config.visibleSections.includes(section.key)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        addSection(section.key);
                      } else if (config.visibleSections.length > 1) {
                        // Prevent removing all sections
                        removeSection(section.key);
                      } else {
                        toast({
                          title: "Cannot remove section",
                          description: "At least one section must remain visible",
                          variant: "destructive"
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor={`section-${section.key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {section.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => resetToDefaults()}>
              Reset to Defaults
            </Button>
            <Button onClick={() => setConfigDialogOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dashboard Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Dashboard Configuration</DialogTitle>
            <DialogDescription>
              Share your customized dashboard layout with others.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to copy a shareable link that includes your current dashboard configuration.
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Copy Share Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
