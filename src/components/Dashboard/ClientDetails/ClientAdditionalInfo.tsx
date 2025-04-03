
import React from "react";
import { format } from "date-fns";
import { Client } from "@/lib/data";
import { Star, FileText, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClientAdditionalInfoProps {
  client: Client;
}

export function ClientAdditionalInfo({ client }: ClientAdditionalInfoProps) {
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
              <a 
                href={client.trustPilotReview.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full mt-2 text-center px-4 py-2 text-sm border rounded-md hover:bg-red-50"
              >
                View Review
              </a>
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
  );
}
