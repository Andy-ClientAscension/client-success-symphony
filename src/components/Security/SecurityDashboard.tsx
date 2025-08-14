import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download } from "lucide-react";
import { securityScanner, SecurityScanResult, SecurityFinding } from "@/utils/security/security-scanner";
import { useToast } from "@/hooks/use-toast";

export function SecurityDashboard() {
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Run initial scan
    handleSecurityScan();
  }, []);

  const handleSecurityScan = async () => {
    setIsScanning(true);
    try {
      const result = await securityScanner.performSecurityScan();
      setScanResult(result);
      
      toast({
        title: "Security Scan Complete",
        description: `Found ${result.totalFindings} security findings`,
        variant: result.totalFindings > 0 ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to complete security scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'outline';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getRiskLevelText = (score: number) => {
    if (score >= 50) return { text: 'High Risk', color: 'text-destructive' };
    if (score >= 25) return { text: 'Medium Risk', color: 'text-orange-500' };
    if (score >= 10) return { text: 'Low Risk', color: 'text-yellow-500' };
    return { text: 'Minimal Risk', color: 'text-green-500' };
  };

  const downloadReport = () => {
    if (!scanResult) return;
    
    const reportData = {
      scanDate: scanResult.scanDate,
      summary: {
        totalFindings: scanResult.totalFindings,
        riskScore: scanResult.riskScore,
        categories: scanResult.categories
      },
      findings: scanResult.findings
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!scanResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>
            {isScanning ? 'Running security scan...' : 'Loading security analysis...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className={`h-8 w-8 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = getRiskLevelText(scanResult.riskScore);
  const highFindings = scanResult.findings.filter(f => f.severity === 'High');
  const mediumFindings = scanResult.findings.filter(f => f.severity === 'Medium');
  const lowFindings = scanResult.findings.filter(f => f.severity === 'Low');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Application security analysis and vulnerability management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={downloadReport}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button
            onClick={handleSecurityScan}
            disabled={isScanning}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            Re-scan
          </Button>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${riskLevel.color}`}>
                  {scanResult.riskScore}/100
                </span>
                <span className={`text-sm ${riskLevel.color}`}>
                  {riskLevel.text}
                </span>
              </div>
              <Progress value={scanResult.riskScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanResult.totalFindings}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="destructive" className="text-xs">
                {highFindings.length} High
              </Badge>
              <Badge variant="outline" className="text-xs">
                {mediumFindings.length} Medium
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {lowFindings.length} Low
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Last Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(scanResult.scanDate).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {scanResult.categories.length} categories analyzed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {highFindings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Security Issues Found:</strong> {highFindings.length} high-severity 
            vulnerabilities require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Findings Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({scanResult.totalFindings})
          </TabsTrigger>
          <TabsTrigger value="high" className="text-destructive">
            High ({highFindings.length})
          </TabsTrigger>
          <TabsTrigger value="medium" className="text-orange-500">
            Medium ({mediumFindings.length})
          </TabsTrigger>
          <TabsTrigger value="low" className="text-yellow-600">
            Low ({lowFindings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <SecurityFindingsList findings={scanResult.findings} />
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          <SecurityFindingsList findings={highFindings} />
        </TabsContent>

        <TabsContent value="medium" className="space-y-4">
          <SecurityFindingsList findings={mediumFindings} />
        </TabsContent>

        <TabsContent value="low" className="space-y-4">
          <SecurityFindingsList findings={lowFindings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SecurityFindingsListProps {
  findings: SecurityFinding[];
}

function SecurityFindingsList({ findings }: SecurityFindingsListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'outline';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (findings.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Issues Found</h3>
            <p className="text-muted-foreground">
              No security findings in this category.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {findings.map((finding) => (
          <Card key={finding.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{finding.title}</CardTitle>
                <Badge variant={getSeverityColor(finding.severity) as any}>
                  {finding.severity}
                </Badge>
                  </div>
                  <CardDescription>
                    {finding.category} • {finding.location}
                  </CardDescription>
                </div>
                {finding.severity === 'High' ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{finding.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Impact</h4>
                <p className="text-sm text-muted-foreground">{finding.impact}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Remediation</h4>
                <p className="text-sm text-muted-foreground">{finding.remediation}</p>
              </div>

              {finding.cweId && (
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    CWE Reference: {finding.cweId}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}