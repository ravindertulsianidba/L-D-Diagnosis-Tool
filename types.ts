export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum DiagnosticPhase {
  CLARIFY = 1,
  ROOT_CAUSE = 2,
  LANE_DECISION = 3,
  FOCUS_AREAS = 4
}

export interface PhaseConfig {
  id: DiagnosticPhase;
  title: string;
  description: string;
}
