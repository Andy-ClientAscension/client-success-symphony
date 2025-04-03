
import React from "react";
import { Button } from "@/components/ui/button";
import { ClientBiWeeklyNotes } from "../ClientBiWeeklyNotes";

interface ClientActionButtonsProps {
  clientId: string;
  clientName: string;
  onContactClient: () => void;
  onViewHistory: () => void;
  onAddNote: () => void;
}

export function ClientActionButtons({
  clientId,
  clientName,
  onContactClient,
  onViewHistory,
  onAddNote
}: ClientActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        className="bg-red-600 hover:bg-red-700"
        onClick={onContactClient}
      >
        Contact
      </Button>
      <Button 
        variant="outline" 
        className="border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={onViewHistory}
      >
        View History
      </Button>
      <Button 
        variant="outline" 
        className="border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={onAddNote}
      >
        Add Note
      </Button>
      <ClientBiWeeklyNotes clientId={clientId} clientName={clientName} />
    </div>
  );
}
