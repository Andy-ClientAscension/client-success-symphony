
import React from "react";
import { X, User, FileText, Link, Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export interface SearchResult {
  id: string;
  type: 'client' | 'student' | 'resource' | 'link' | 'event' | 'communication';
  title: string;
  description?: string;
  url?: string;
  date?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
}

export function SearchResults({ results, isOpen, onClose, searchQuery }: SearchResultsProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'client':
        navigate(`/client/${result.id}`);
        break;
      case 'student':
        // Navigate to student detail or highlight in kanban board
        navigate('/#student-' + result.id);
        break;
      case 'resource':
      case 'link':
        if (result.url) {
          window.open(result.url, '_blank');
        }
        break;
      case 'event':
        navigate('/calendar');
        break;
      case 'communication':
        navigate('/communications');
        break;
      default:
        break;
    }
    onClose();
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
      case 'student':
        return <User className="h-4 w-4 text-muted-foreground" />;
      case 'resource':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'link':
        return <Link className="h-4 w-4 text-muted-foreground" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
      case 'communication':
        return <Phone className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg max-h-[70vh] overflow-hidden bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">
          Search results for "{searchQuery}" ({results.length})
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="max-h-[60vh]">
        {results.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No results found for "{searchQuery}"
          </div>
        ) : (
          <ul className="p-2">
            {results.map((result) => (
              <li key={`${result.type}-${result.id}`}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-muted"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {result.description}
                        </div>
                      )}
                      {result.date && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.date}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1 capitalize">
                        Type: {result.type}
                      </div>
                    </div>
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </Card>
  );
}
