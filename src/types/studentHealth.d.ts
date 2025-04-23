
declare namespace StudentHealth {
  interface HealthScoreFactors {
    engagement: number;      // 0-100 scale
    progress: number;        // 0-100 scale
    sentiment: number;       // 0-100 scale
    attendance: number;      // 0-100 scale
    completion: number;      // 0-100 scale
  }
  
  interface HealthScoreHistory {
    date: string;            // ISO date string
    score: number;           // 0-100 scale
    factors: HealthScoreFactors;
    notes?: string;
  }
  
  interface RiskCategory {
    level: 'low' | 'medium' | 'high' | 'critical';
    threshold: number;       // score threshold for this category
    color: string;           // color code for visual representation
  }
  
  interface HealthScoreTrend {
    period: '30d' | '60d' | '90d';
    startScore: number;
    endScore: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }
  
  interface StudentHealthData {
    studentId: string;
    currentScore: number;
    riskLevel: RiskCategory['level'];
    lastUpdated: string;
    factors: HealthScoreFactors;
    history: HealthScoreHistory[];
    trends: {
      '30d': HealthScoreTrend;
      '60d': HealthScoreTrend;
      '90d': HealthScoreTrend;
    };
  }
}
