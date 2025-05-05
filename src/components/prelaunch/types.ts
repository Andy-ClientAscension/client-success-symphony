
export interface VerificationState {
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  results: any[];
  issues: string[];
}

export interface VerificationTabProps {
  state: VerificationState;
  onActionClick?: () => void;
}
