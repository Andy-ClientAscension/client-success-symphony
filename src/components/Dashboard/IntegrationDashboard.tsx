import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { verifyIntegrations, type VerificationResult, type IntegrationStatus } from '@/utils/integration-verifier';
import { useToast } from '@/hooks/use-toast';

export function IntegrationDashboard() {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerified, setLastVerified] = useState<Date | null>(null);
  const { toast } = useToast();

  const runVerification = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyIntegrations();
      setVerificationResult(result);
      setLastVerified(new Date());
      
      toast({
        title: "Verification Complete",
        description: `Integration health: ${result.overallHealth}`,
        variant: result.overallHealth === 'critical' ? 'destructive' : 'default'
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not complete integration verification",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // Run initial verification on component mount
    runVerification();
  }, []);

  const getStatusIcon = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'untested':
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'missing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'untested':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Verification</h2>
          <p className="text-muted-foreground">
            Monitor and verify external service connections
          </p>
        </div>
        <Button 
          onClick={runVerification} 
          disabled={isVerifying}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? 'Verifying...' : 'Run Verification'}
        </Button>
      </div>

      {/* Overall Health Status */}
      {verificationResult && (
        <Alert className={`border-l-4 ${
          verificationResult.overallHealth === 'healthy' ? 'border-l-green-500' :
          verificationResult.overallHealth === 'degraded' ? 'border-l-yellow-500' :
          'border-l-red-500'
        }`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Overall Health: </span>
            <span className={getHealthColor(verificationResult.overallHealth)}>
              {verificationResult.overallHealth.toUpperCase()}
            </span>
            {lastVerified && (
              <span className="text-sm text-muted-foreground ml-2">
                (Last checked: {lastVerified.toLocaleTimeString()})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Status</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verificationResult?.integrations.map((integration) => (
              <Card key={integration.name} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    {getStatusIcon(integration.status)}
                  </div>
                  <Badge className={getStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {integration.details}
                  </p>
                  {integration.metrics && (
                    <div className="space-y-1 text-xs">
                      {integration.metrics.responseTime && (
                        <div>Response: {integration.metrics.responseTime}ms</div>
                      )}
                      {integration.metrics.successRate !== undefined && (
                        <div>Success Rate: {integration.metrics.successRate}%</div>
                      )}
                    </div>
                  )}
                  {integration.errors && integration.errors.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      {integration.errors[0]}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {verificationResult?.integrations.map((integration) => (
            <Card key={integration.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    {integration.name}
                  </CardTitle>
                  <Badge className={getStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
                <CardDescription>
                  Last checked: {integration.lastChecked.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Details</h4>
                    <p className="text-sm text-muted-foreground">{integration.details}</p>
                  </div>
                  
                  {integration.metrics && (
                    <div>
                      <h4 className="font-medium">Metrics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {integration.metrics.responseTime && (
                          <div>
                            <span className="text-muted-foreground">Response Time:</span>
                            <div className="font-mono">{integration.metrics.responseTime}ms</div>
                          </div>
                        )}
                        {integration.metrics.successRate !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Success Rate:</span>
                            <div className="font-mono">{integration.metrics.successRate}%</div>
                          </div>
                        )}
                        {integration.metrics.errorCount !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Error Count:</span>
                            <div className="font-mono">{integration.metrics.errorCount}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {integration.errors && integration.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600">Errors</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                        {integration.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {verificationResult?.recommendations && verificationResult.recommendations.length > 0 ? (
            <div className="space-y-3">
              {verificationResult.recommendations.map((recommendation, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">All Good!</h3>
                <p className="text-muted-foreground">No recommendations at this time.</p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common integration tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get OpenRouter API Key
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Stripe API Keys
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`https://supabase.com/dashboard/project/bajfdvphpoopkmpgzyeo/settings/functions`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Supabase Secrets
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}