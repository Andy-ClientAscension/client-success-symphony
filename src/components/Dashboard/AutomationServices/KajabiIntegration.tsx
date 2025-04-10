
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiIntegrations, isApiConnected } from "@/lib/api";

interface KajabiIntegrationProps {
  connectService: () => void;
}

export function KajabiIntegration({ connectService }: KajabiIntegrationProps) {
  const { toast } = useToast();
  const kajabiConnected = isApiConnected("kajabi");

  const renderConnectionStatus = () => {
    if (kajabiConnected) {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="text-sm">Connected</span>
        </div>
      );
    }
    
    return (
      <Button variant="outline" size="sm" onClick={connectService}>
        Connect
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7E22CE" />
            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#9333EA" fillOpacity="0.8" />
          </svg>
          Kajabi Integration
        </CardTitle>
        <CardDescription>
          Connect to Kajabi for online courses and digital product automation
        </CardDescription>
        <div className="mt-2">{renderConnectionStatus()}</div>
      </CardHeader>
      {kajabiConnected && (
        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-2" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Kajabi webhooks are not available in the current integration. Please use Zapier or Make to connect with Kajabi.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => {
                  toast({
                    title: "Fetching Courses",
                    description: "Getting courses from Kajabi...",
                  });
                  apiIntegrations.kajabi.getCourses().then(response => {
                    if (response.success) {
                      toast({
                        title: "Success",
                        description: "Courses retrieved successfully",
                      });
                    }
                  });
                }}>
                  Fetch Courses
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Members</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => {
                  toast({
                    title: "Fetching Members",
                    description: "Getting members from Kajabi...",
                  });
                  apiIntegrations.kajabi.getMembers().then(response => {
                    if (response.success) {
                      toast({
                        title: "Success",
                        description: "Members retrieved successfully",
                      });
                    }
                  });
                }}>
                  Fetch Members
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
