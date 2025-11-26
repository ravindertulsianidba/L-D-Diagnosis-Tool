export interface Message {
  role: 'user' | 'model';
  content: string;
  isJson?: boolean;
}

// Interfaces mirroring the JSON Schema provided in the prompt
export interface BusinessProblem {
  summary: string;
  impact_areas: string[];
  current_state: string;
  desired_state: string;
  primary_kpis: string[];
  time_horizon: string;
  priority_level: string;
}

export interface PerformanceGap {
  who_is_affected: string;
  roles: string[];
  current_behaviours_or_results: string[];
  expected_behaviours_or_results: string[];
  evidence_sources: string[];
}

export interface RootCauseFactor {
  likelihood: number;
  evidence: string;
}

export interface RootCauseAnalysis {
  is_performance_problem: boolean;
  suspected_skill_gap: boolean;
  data_and_expectations_E1: RootCauseFactor;
  resources_and_tools_E2: RootCauseFactor;
  incentives_and_rewards_E3: RootCauseFactor;
  knowledge_and_skill_P4: RootCauseFactor;
  capacity_P5: RootCauseFactor;
  motives_P6: RootCauseFactor;
}

export interface SolutionMixRecommendation {
  training_needed: boolean;
  training_share_of_solution: string;
  summary: string;
  non_training_components: string[];
}

export interface ConstraintsAndRisks {
  time_constraints: string;
  budget_constraints: string;
  regulatory_or_compliance_factors: string;
  languages_and_accessibility: string;
  technology_constraints: string;
  key_risks_if_ignored: string;
}

export interface DataQuality {
  confidence_score: number;
  validity_risk: string;
  reliability_risk: string;
  missing_information: string[];
  assumptions_made: string[];
}

export interface MeasurementAndSustainment {
  baseline_metrics: string[];
  target_metrics: string[];
  leading_indicators: string[];
  isolation_strategy: string;
  required_drivers: string[];
}

export interface DominoAlignmentInput {
  business_goal_statement: string;
  primary_metrics: string[];
  target_behaviours_or_capabilities: string[];
  priority_audience_segments: string[];
  critical_context_and_constraints: string[];
  training_role_in_overall_solution: string;
  dependencies_outside_training: string[];
}

export interface DiagnosisResult {
  business_problem: BusinessProblem;
  performance_gap: PerformanceGap;
  root_cause_analysis: RootCauseAnalysis;
  solution_mix_recommendation: SolutionMixRecommendation;
  constraints_and_risks: ConstraintsAndRisks;
  data_quality: DataQuality;
  measurement_and_sustainment: MeasurementAndSustainment;
  domino_alignment_input: DominoAlignmentInput;
}