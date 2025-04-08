
import React from "react";
import { X, User, FileText, Link, Calendar, Phone, UserCircle2, Bookmark, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export interface SearchResult {
  id: string;
  type: 'client' | 'student' | 'resource' | 'link' | 'event' | 'communication' | 'ssc';
  title: string;
  description?: string;
  url?: string;
  date?: string;
  team?: string;
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
      case 'ssc':
        // Navigate to SSC profile or highlight in team view
        navigate('/analytics?team=' + result.team);
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
        return <User className="h-4 w-4 text-blue-600" />;
      case 'student':
        return <School className="h-4 w-4 text-green-600" />;
      case 'ssc':
        return <UserCircle2 className="h-4 w-4 text-purple-600" />;
      case 'resource':
        return <FileText className="h-4 w-4 text-amber-600" />;
      case 'link':
        return <Link className="h-4 w-4 text-cyan-600" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-pink-600" />;
      case 'communication':
        return <Phone className="h-4 w-4 text-red-600" />;
      default:
        return <Bookmark className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Group results by type for better organization
  const groupedResults = results.reduce((acc, result) => {
    const group = acc[result.type] || [];
    group.push(result);
    acc[result.type] = group;
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Determine if we have results
  const hasResults = Object.keys(groupedResults).length > 0;

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
        {!hasResults ? (
          <div className="p-6 text-center text-muted-foreground">
            No results found for "{searchQuery}"
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedResults).map(([type, typeResults]) => (
              <div key={type} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {type === 'ssc' ? 'SSCs' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                </div>
                <ul>
                  {typeResults.map((result) => (
                    <li key={`${result.type}-${result.id}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-muted"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-0.5 flex-shrink-0">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{result.title}</div>
                            {result.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {result.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {result.date && (
                                <span className="text-xs text-muted-foreground">
                                  {result.date}
                                </span>
                              )}
                              {result.team && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                  {result.team}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
