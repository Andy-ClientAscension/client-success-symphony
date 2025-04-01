import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  BarChart, 
  Star, 
  FileText, 
  Award,
  Phone,
  DollarSign,
  BarChart2,
  User
} from "lucide-react";
import { format } from "date-fns";
import { Client } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { ClientBiWeeklyNotes } from "./ClientBiWeeklyNotes";
import { HealthScoreHistory } from "./HealthScoreHistory";

interface ClientDetailsProps {
  client: Client;
}

export function ClientDetails({ client }: ClientDetailsProps) {
  const { toast } = useToast();

  const handleContactClient = () => {
    toast({
      title: "Contact Initiated",
      description: `Opening communication with ${client.name}`,
    });
  };

  const handleViewHistory = () => {
    toast({
      title: "Loading History",
      description: `Viewing interaction history for ${client.name}`,
    });
  };

  const handleAddNote = () => {
    toast({
      title: "Add Note",
      description: `Adding a note for ${client.name}`,
    });
  };
  
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 hover:bg-success-200';
      case 'at-risk':
        return 'bg-warning-100 text-warning-800 hover:bg-warning-200';
      case 'churned':
        return 'bg-danger-100 text-danger-800 hover:bg-danger-200';
      case 'new':
        return 'bg-brand-100 text-brand-800 hover:bg-brand-200';
      default:
        return '';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-success-500';
    if (progress >= 40) return 'bg-warning-500';
    return 'bg-danger-500';
  };
  
  const getNPSColor = (score: number | null) => {
    if (score === null) return '';
    if (score >= 8) return 'text-success-600';
    if (score >= 6) return 'text-warning-600';
    return 'text-danger-600';
  };
  
  const renderStarRating = (rating: number | null) => {
    if (rating === null) return 'No rating yet';
    
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i < rating ? 'text-warning-500 fill-warning-500' : 'text-gray-300'}`} 
        />
      );
    }
    
    return <div className="flex items-center gap-1">{stars}</div>;
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-red-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Client Details</CardTitle>
          <Badge className={getStatusColor(client.status)}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                {client.logo ? (
                  <img src={client.logo} alt={client.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold">{client.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{client.name}</h2>
                <p className="text-sm text-muted-foreground">Client since {format(new Date(client.lastPayment.date), 'MMMM yyyy')}</p>
                {client.csm && (
                  <div className="flex items-center mt-1 text-sm">
                    <User className="h-3 w-3 mr-1 text-red-600" />
                    <span>CSM: {client.csm}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(client.progress)}`} 
                      style={{ width: `${client.progress}%` }} 
                    />
                  </div>
                  <span className="text-sm font-medium">{client.progress}%</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">NPS Score</span>
                <span className={`text-2xl font-bold ${getNPSColor(client.npsScore)}`}>
                  {client.npsScore !== null ? client.npsScore : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Calls Booked</span>
                </div>
                <p className="text-xl font-bold">{client.callsBooked}</p>
              </div>
              
              <div className="border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Deals Closed</span>
                </div>
                <p className="text-xl font-bold">{client.dealsClosed}</p>
              </div>
              
              <div className="border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Monthly Revenue</span>
                </div>
                <p className="text-xl font-bold">${client.mrr}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <span className="font-medium">End Date</span>
                </div>
                <p>{format(new Date(client.endDate), 'MMM dd, yyyy')}</p>
              </div>
              
              <div className="border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Last Communication</span>
                </div>
                <p>{format(new Date(client.lastCommunication), 'MMM dd, yyyy')}</p>
              </div>
              
              <div className="border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Last Payment</span>
                </div>
                <p>${client.lastPayment.amount} • {format(new Date(client.lastPayment.date), 'MMM dd, yyyy')}</p>
              </div>
              
              <div className="border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Lifetime Value</span>
                </div>
                <p>${client.lastPayment.amount * 12}</p>
              </div>
            </div>
            
            <div className="border border-red-100 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium">TrustPilot Review</h4>
                </div>
                {client.trustPilotReview?.date ? (
                  <div className="ml-7 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        {renderStarRating(client.trustPilotReview.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(client.trustPilotReview.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {client.trustPilotReview.link && (
                      <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                        <a href={client.trustPilotReview.link} target="_blank" rel="noopener noreferrer">
                          View Review
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="ml-7 text-muted-foreground">No TrustPilot review yet</div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium">Case Study Interview</h4>
                </div>
                <div className="ml-7 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={client.caseStudyInterview?.completed ? 'success' : 'secondary'}>
                      {client.caseStudyInterview?.completed ? 'Completed' : 'Pending'}
                    </Badge>
                    {client.caseStudyInterview?.scheduledDate && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(client.caseStudyInterview.scheduledDate), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                  {client.caseStudyInterview?.notes && (
                    <p className="text-sm mt-1">{client.caseStudyInterview.notes}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium">Referrals</h4>
                </div>
                <div className="ml-7">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{client.referrals?.count || 0}</span>
                    <span className="text-muted-foreground">clients referred</span>
                  </div>
                  {client.referrals?.names && client.referrals.names.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Referred clients:</p>
                      <div className="grid grid-cols-1 gap-1">
                        {client.referrals.names.map((name, index) => (
                          <Badge key={index} variant="outline" className="justify-start">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No referrals yet</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleContactClient}
              >
                Contact
              </Button>
              <Button 
                variant="outline" 
                className="border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleViewHistory}
              >
                View History
              </Button>
              <Button 
                variant="outline" 
                className="border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleAddNote}
              >
                Add Note
              </Button>
              <ClientBiWeeklyNotes clientId={client.id} clientName={client.name} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <HealthScoreHistory clientId={client.id} clientName={client.name} />
    </div>
  );
}
