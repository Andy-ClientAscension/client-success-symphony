
import { format } from "date-fns";
import { getAllClients, Client, Communication } from "@/lib/data";
import { SearchResult } from "@/components/Search/SearchResults";

// Mock SSC data
const sscTeamMembers = [
  {
    id: "ssc1",
    name: "Andy Johnson",
    team: "Enterprise",
    role: "Client Success Coach",
    clients: ["client1", "client5", "client9"],
    joinedDate: "2023-04-15"
  },
  {
    id: "ssc2",
    name: "Chris Smith",
    team: "SMB",
    role: "Client Success Coach",
    clients: ["client2", "client6", "client10"],
    joinedDate: "2023-02-10"
  },
  {
    id: "ssc3",
    name: "Cillin Brown",
    team: "Mid Market",
    role: "Client Success Coach",
    clients: ["client3", "client7", "client11"],
    joinedDate: "2023-05-22"
  },
  {
    id: "ssc4",
    name: "Dana Wilson",
    team: "Enterprise",
    role: "Client Success Coach",
    clients: ["client4", "client8", "client12"],
    joinedDate: "2023-01-05"
  },
  {
    id: "ssc5",
    name: "Eve Taylor",
    team: "SMB",
    role: "Client Success Coach",
    clients: ["client13", "client16", "client19"],
    joinedDate: "2023-03-15"
  },
  {
    id: "ssc6",
    name: "Frank Miller",
    team: "Mid Market",
    role: "Client Success Coach",
    clients: ["client14", "client17", "client20"],
    joinedDate: "2023-07-10"
  },
];

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
  {
    id: "r5",
    title: "SSC Handbook",
    description: "Comprehensive guide for Client Success Coaches",
    url: "https://example.com/ssc-handbook",
    tags: ["ssc", "handbook", "guide"]
  },
  {
    id: "r6",
    title: "Client Health Score Guide",
    description: "How to interpret and improve client health scores",
    url: "https://example.com/health-score-guide",
    tags: ["health", "score", "metrics"]
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
  {
    id: "l4",
    title: "SSC Training Portal",
    url: "https://training.example.com",
    category: "education"
  },
  {
    id: "l5",
    title: "Resource Library",
    url: "https://resources.example.com",
    category: "knowledge"
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
  {
    id: "e4",
    title: "SSC Team Alignment",
    date: format(new Date(2024, 1, 10), "yyyy-MM-dd"),
    description: "Alignment session for Client Success Coaches"
  },
  {
    id: "e5",
    title: "Client Success Strategy Meeting",
    date: format(new Date(2024, 1, 15), "yyyy-MM-dd"),
    description: "Review success strategies and share best practices"
  },
];

// Convert client to search result
function clientToSearchResult(client: Client): SearchResult {
  return {
    id: client.id,
    type: 'client',
    title: client.name,
    description: `${client.status} - ${client.csm || 'Unassigned'}`,
    date: format(new Date(client.lastCommunication), 'MMM dd, yyyy'),
    team: client.team
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

// Convert SSC team member to search result
function sscToSearchResult(ssc: any): SearchResult {
  return {
    id: ssc.id,
    type: 'ssc',
    title: ssc.name,
    description: `${ssc.role} - ${ssc.clients.length} clients`,
    date: `Joined: ${format(new Date(ssc.joinedDate), 'MMM dd, yyyy')}`,
    team: ssc.team
  };
}

// Convert students from kanban board to search results
function getStudentResults(query: string): SearchResult[] {
  try {
    // This would normally pull from actual student data
    // For now using mock data
    const mockStudents = [
      { id: 's1', name: 'Alice Johnson', team: 'Enterprise', progress: 75 },
      { id: 's2', name: 'Bob Smith', team: 'SMB', progress: 60 },
      { id: 's3', name: 'Carol Davis', team: 'Enterprise', progress: 80 },
      { id: 's4', name: 'Dave Wilson', team: 'Mid Market', progress: 45 },
      { id: 's5', name: 'Eve Brown', team: 'SMB', progress: 50 },
      { id: 's6', name: 'Frank Miller', team: 'Mid Market', progress: 70 },
      { id: 's7', name: 'Grace Lee', team: 'Enterprise', progress: 30 },
      { id: 's8', name: 'Henry Taylor', team: 'Mid Market', progress: 100 },
      { id: 's9', name: 'Ivy Robinson', team: 'Enterprise', progress: 95 },
      { id: 's10', name: 'Jack Wilson', team: 'SMB', progress: 88 },
      { id: 's11', name: 'Karen Martin', team: 'Mid Market', progress: 40 },
      { id: 's12', name: 'Leo James', team: 'Enterprise', progress: 65 },
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
        description: `Progress: ${student.progress}%`,
        team: student.team
      }));
  } catch (error) {
    console.error("Error getting student results:", error);
    return [];
  }
}

export function searchAll(query: string): SearchResult[] {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    query = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search clients
    try {
      const clients = getAllClients();
      const clientResults = clients
        .filter(client => 
          client.name.toLowerCase().includes(query) ||
          client.status.toLowerCase().includes(query) ||
          (client.csm && client.csm.toLowerCase().includes(query)) ||
          (client.team && client.team.toLowerCase().includes(query))
        )
        .map(clientToSearchResult);
      results.push(...clientResults);
    } catch (error) {
      console.error("Error searching clients:", error);
    }

    // Search SSC team members
    try {
      const sscResults = sscTeamMembers
        .filter(ssc => 
          ssc.name.toLowerCase().includes(query) || 
          ssc.role.toLowerCase().includes(query) ||
          ssc.team.toLowerCase().includes(query)
        )
        .map(sscToSearchResult);
      results.push(...sscResults);
    } catch (error) {
      console.error("Error searching SSC team members:", error);
    }

    // Search communications
    try {
      const clients = getAllClients();
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
    } catch (error) {
      console.error("Error searching communications:", error);
    }

    // Search resources
    try {
      const resourceResults = resources
        .filter(resource => 
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some(tag => tag.toLowerCase().includes(query))
        )
        .map(resourceToSearchResult);
      results.push(...resourceResults);
    } catch (error) {
      console.error("Error searching resources:", error);
    }

    // Search links
    try {
      const linkResults = links
        .filter(link => 
          link.title.toLowerCase().includes(query) ||
          link.category.toLowerCase().includes(query)
        )
        .map(linkToSearchResult);
      results.push(...linkResults);
    } catch (error) {
      console.error("Error searching links:", error);
    }

    // Search events
    try {
      const eventResults = events
        .filter(event => 
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
        )
        .map(eventToSearchResult);
      results.push(...eventResults);
    } catch (error) {
      console.error("Error searching events:", error);
    }

    // Search students
    try {
      const studentResults = getStudentResults(query);
      results.push(...studentResults);
    } catch (error) {
      console.error("Error searching students:", error);
    }

    return results;
  } catch (error) {
    console.error("Error in searchAll function:", error);
    return [];
  }
}
