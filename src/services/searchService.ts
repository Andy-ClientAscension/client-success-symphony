
import { format } from "date-fns";
import { getAllClients, Client, Communication } from "@/lib/data";
import { SearchResult } from "@/components/Search/SearchResults";

// Mock resources data
const resources = [
  {
    id: "r1",
    title: "Client Onboarding Guide",
    description: "Step-by-step guide for onboarding new clients",
    url: "https://example.com/onboarding-guide",
    tags: ["onboarding", "clients", "guide"]
  },
  {
    id: "r2",
    title: "NPS Survey Templates",
    description: "Templates for creating effective NPS surveys",
    url: "https://example.com/nps-templates",
    tags: ["nps", "templates", "survey"]
  },
  {
    id: "r3",
    title: "Renewal Process Checklist",
    description: "Checklist for client renewal process",
    url: "https://example.com/renewal-checklist",
    tags: ["renewal", "checklist", "process"]
  },
  {
    id: "r4",
    title: "Team Training Materials",
    description: "Training resources for new team members",
    url: "https://example.com/team-training",
    tags: ["training", "team", "onboarding"]
  },
];

// Mock links data
const links = [
  {
    id: "l1",
    title: "CRM Dashboard",
    url: "https://crm.example.com",
    category: "tools"
  },
  {
    id: "l2",
    title: "Client Success Metrics",
    url: "https://metrics.example.com",
    category: "reporting"
  },
  {
    id: "l3",
    title: "Team Calendar",
    url: "https://calendar.example.com",
    category: "scheduling"
  },
];

// Mock events
const events = [
  {
    id: "e1",
    title: "Quarterly Review - Global Enterprises",
    date: format(new Date(2023, 11, 15), "yyyy-MM-dd"),
    description: "Review quarterly progress and set goals"
  },
  {
    id: "e2",
    title: "Team Meeting - Backend Project Updates",
    date: format(new Date(2023, 11, 8), "yyyy-MM-dd"),
    description: "Weekly team sync for backend projects"
  },
  {
    id: "e3",
    title: "Olympia Project Launch",
    date: format(new Date(2024, 0, 5), "yyyy-MM-dd"),
    description: "Official launch of Olympia project"
  },
];

// Convert client to search result
function clientToSearchResult(client: Client): SearchResult {
  return {
    id: client.id,
    type: 'client',
    title: client.name,
    description: `${client.status} - ${client.csm || 'Unassigned'}`,
    date: format(new Date(client.lastCommunication), 'MMM dd, yyyy')
  };
}

// Convert communication to search result
function communicationToSearchResult(comm: Communication, clientName: string): SearchResult {
  return {
    id: comm.id,
    type: 'communication',
    title: comm.subject,
    description: `${clientName} - ${comm.type}`,
    date: format(new Date(comm.date), 'MMM dd, yyyy')
  };
}

// Convert resource to search result
function resourceToSearchResult(resource: any): SearchResult {
  return {
    id: resource.id,
    type: 'resource',
    title: resource.title,
    description: resource.description,
    url: resource.url
  };
}

// Convert link to search result
function linkToSearchResult(link: any): SearchResult {
  return {
    id: link.id,
    type: 'link',
    title: link.title,
    description: link.category,
    url: link.url
  };
}

// Convert event to search result
function eventToSearchResult(event: any): SearchResult {
  return {
    id: event.id,
    type: 'event',
    title: event.title,
    description: event.description,
    date: format(new Date(event.date), 'MMM dd, yyyy')
  };
}

// Convert students from kanban board to search results
function getStudentResults(query: string): SearchResult[] {
  // This would normally pull from actual student data
  // For now using mock data
  const mockStudents = [
    { id: 's1', name: 'Alice Johnson', team: 'Team-Andy', progress: 75 },
    { id: 's2', name: 'Bob Smith', team: 'Team-Chris', progress: 60 },
    { id: 's3', name: 'Carol Davis', team: 'Team-Andy', progress: 80 },
    { id: 's4', name: 'Dave Wilson', team: 'Team-Cillin', progress: 45 },
    { id: 's5', name: 'Eve Brown', team: 'Team-Chris', progress: 50 },
    { id: 's6', name: 'Frank Miller', team: 'Team-Cillin', progress: 70 },
    { id: 's7', name: 'Grace Lee', team: 'Team-Andy', progress: 30 },
    { id: 's8', name: 'Henry Taylor', team: 'Team-Cillin', progress: 100 },
    { id: 's9', name: 'Ivy Robinson', team: 'Team-Andy', progress: 100 },
  ];
  
  return mockStudents
    .filter(student => 
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.team.toLowerCase().includes(query.toLowerCase())
    )
    .map(student => ({
      id: student.id,
      type: 'student',
      title: student.name,
      description: `${student.team} - Progress: ${student.progress}%`
    }));
}

export function searchAll(query: string): SearchResult[] {
  if (!query || query.trim() === '') {
    return [];
  }

  query = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Search clients
  const clients = getAllClients();
  const clientResults = clients
    .filter(client => 
      client.name.toLowerCase().includes(query) ||
      client.status.toLowerCase().includes(query) ||
      (client.csm && client.csm.toLowerCase().includes(query))
    )
    .map(clientToSearchResult);
  results.push(...clientResults);

  // Search communications
  clients.forEach(client => {
    if (client.communicationLog) {
      const commResults = client.communicationLog
        .filter(comm => 
          comm.subject.toLowerCase().includes(query) ||
          comm.content.toLowerCase().includes(query) ||
          comm.type.toLowerCase().includes(query)
        )
        .map(comm => communicationToSearchResult(comm, client.name));
      results.push(...commResults);
    }
  });

  // Search resources
  const resourceResults = resources
    .filter(resource => 
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    )
    .map(resourceToSearchResult);
  results.push(...resourceResults);

  // Search links
  const linkResults = links
    .filter(link => 
      link.title.toLowerCase().includes(query) ||
      link.category.toLowerCase().includes(query)
    )
    .map(linkToSearchResult);
  results.push(...linkResults);

  // Search events
  const eventResults = events
    .filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    )
    .map(eventToSearchResult);
  results.push(...eventResults);

  // Search students
  const studentResults = getStudentResults(query);
  results.push(...studentResults);

  return results;
}
