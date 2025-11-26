import React from 'react';
import { DiagnosisResult, RootCauseFactor } from '../types';
import { Download, AlertTriangle, CheckCircle, BarChart2, Layers, Target, ShieldAlert, GitMerge } from 'lucide-react';

interface Props {
  data: DiagnosisResult;
  onReset: () => void;
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
      <span className="text-slate-500">{icon}</span>
      <h3 className="font-semibold text-slate-800 uppercase tracking-wide text-sm">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const KeyValue: React.FC<{ label: string; value: string | string[] | React.ReactNode; full?: boolean }> = ({ label, value, full }) => (
  <div className={`mb-4 ${full ? 'col-span-2' : ''}`}>
    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</dt>
    <dd className="text-sm text-slate-700 font-medium">
      {Array.isArray(value) ? (
        <ul className="list-disc list-outside pl-4 space-y-1">
          {value.map((v, i) => <li key={i}>{v}</li>)}
        </ul>
      ) : (
        value
      )}
    </dd>
  </div>
);

const RootCauseBar: React.FC<{ label: string; factor: RootCauseFactor; code: string }> = ({ label, factor, code }) => {
  const percentage = Math.round(factor.likelihood * 100);
  let colorClass = "bg-green-500";
  if (percentage > 30) colorClass = "bg-yellow-500";
  if (percentage > 70) colorClass = "bg-red-500";

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-slate-700">
          <span className="text-slate-400 font-mono text-xs mr-2">{code}</span>
          {label}
        </span>
        <span className="text-xs font-bold text-slate-600">{percentage}% Impact</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-2">
        "{factor.evidence || "No specific evidence cited"}"
      </p>
    </div>
  );
};

export const DiagnosisDashboard: React.FC<Props> = ({ data, onReset }) => {
  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnosis-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Diagnostic Report</h1>
          <p className="text-slate-500 mt-1">
            Generated on {new Date().toLocaleDateString()} • Confidence Score: {(data.data_quality.confidence_score * 100).toFixed(0)}%
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadJson}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors font-medium text-sm"
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            New Consultation
          </button>
        </div>
      </header>

      {/* Top Row: Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Business Problem" icon={<AlertTriangle size={18} />} className="border-l-4 border-l-orange-400">
          <KeyValue label="Summary" value={data.business_problem.summary} />
          <div className="grid grid-cols-2 gap-4">
            <KeyValue label="Impact Areas" value={data.business_problem.impact_areas} />
            <KeyValue label="Priority" value={<span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 uppercase">{data.business_problem.priority_level}</span>} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <KeyValue label="Current State" value={data.business_problem.current_state} />
            <KeyValue label="Desired State" value={data.business_problem.desired_state} />
          </div>
        </SectionCard>

        <SectionCard title="Solution Recommendation" icon={<CheckCircle size={18} />} className="border-l-4 border-l-indigo-500">
             <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-500 uppercase">Training Role</span>
                    <span className="text-sm font-bold text-indigo-900 bg-white px-3 py-1 rounded shadow-sm">
                        {data.solution_mix_recommendation.training_share_of_solution.toUpperCase()}
                    </span>
                </div>
                <p className="text-sm text-indigo-800 leading-relaxed">
                    {data.solution_mix_recommendation.summary}
                </p>
             </div>
             <KeyValue label="Non-Training Components Required" value={data.solution_mix_recommendation.non_training_components} />
        </SectionCard>
      </div>

      {/* Middle Row: Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Root Cause Analysis - Spans 2 cols */}
        <div className="lg:col-span-2">
            <SectionCard title="Root Cause Analysis (Gilbert's BEM)" icon={<BarChart2 size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Environment (E1-E3)</h4>
                        <RootCauseBar code="E1" label="Data & Expectations" factor={data.root_cause_analysis.data_and_expectations_E1} />
                        <RootCauseBar code="E2" label="Resources & Tools" factor={data.root_cause_analysis.resources_and_tools_E2} />
                        <RootCauseBar code="E3" label="Incentives & Rewards" factor={data.root_cause_analysis.incentives_and_rewards_E3} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Performer (P4-P6)</h4>
                        <RootCauseBar code="P4" label="Knowledge & Skill" factor={data.root_cause_analysis.knowledge_and_skill_P4} />
                        <RootCauseBar code="P5" label="Capacity" factor={data.root_cause_analysis.capacity_P5} />
                        <RootCauseBar code="P6" label="Motives" factor={data.root_cause_analysis.motives_P6} />
                    </div>
                </div>
            </SectionCard>
        </div>

        {/* Alignment Input */}
        <div className="lg:col-span-1">
            <SectionCard title="Domino Alignment Input" icon={<GitMerge size={18} />} className="h-full">
                <KeyValue label="Goal Statement" value={data.domino_alignment_input.business_goal_statement} />
                <KeyValue label="Target Audience" value={data.domino_alignment_input.priority_audience_segments} />
                <KeyValue label="Critical Constraints" value={data.domino_alignment_input.critical_context_and_constraints} />
                <KeyValue label="Dependencies" value={data.domino_alignment_input.dependencies_outside_training} />
            </SectionCard>
        </div>
      </div>

      {/* Bottom Row: Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <SectionCard title="Gap Analysis" icon={<Layers size={18} />}>
            <KeyValue label="Who" value={data.performance_gap.who_is_affected} />
            <KeyValue label="Current Results" value={data.performance_gap.current_behaviours_or_results} />
            <KeyValue label="Expected Results" value={data.performance_gap.expected_behaviours_or_results} />
         </SectionCard>

         <SectionCard title="Measurement" icon={<Target size={18} />}>
            <KeyValue label="Baseline" value={data.measurement_and_sustainment.baseline_metrics} />
            <KeyValue label="Target" value={data.measurement_and_sustainment.target_metrics} />
            <KeyValue label="Leading Indicators" value={data.measurement_and_sustainment.leading_indicators} />
         </SectionCard>

         <SectionCard title="Risks & Constraints" icon={<ShieldAlert size={18} />}>
            <KeyValue label="Key Risks" value={data.constraints_and_risks.key_risks_if_ignored} />
            <KeyValue label="Budget" value={data.constraints_and_risks.budget_constraints} />
            <KeyValue label="Time" value={data.constraints_and_risks.time_constraints} />
         </SectionCard>

         <SectionCard title="Data Quality" icon={<AlertTriangle size={18} />}>
            <div className="flex items-center gap-2 mb-4">
                <div className={`text-lg font-bold ${data.data_quality.confidence_score > 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {(data.data_quality.confidence_score * 100).toFixed(0)}%
                </div>
                <span className="text-sm text-slate-500">Confidence Score</span>
            </div>
            <KeyValue label="Missing Info" value={data.data_quality.missing_information.length > 0 ? data.data_quality.missing_information : "None"} />
            <KeyValue label="Assumptions" value={data.data_quality.assumptions_made.length > 0 ? data.data_quality.assumptions_made : "None"} />
         </SectionCard>
      </div>
    </div>
  );
};
