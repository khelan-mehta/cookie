import { useState } from 'react';
import { FiAlertCircle, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';
import type { AIAnalysis } from '../../services/distress';
import { SEVERITY_COLORS } from '../../utils/constants';

interface AIGuidancePanelProps {
  analysis: AIAnalysis | null;
  isLoading?: boolean;
  collapsible?: boolean;
  initialCollapsed?: boolean;
}

export const AIGuidancePanel = ({
  analysis,
  isLoading = false,
  collapsible = true,
  initialCollapsed = false,
}: AIGuidancePanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  if (isLoading) {
    return (
      <div className="bg-[#FEEAC9] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-gray-800">
          <div className="animate-spin h-4 w-4 border-2 border-[#FD7979] border-t-transparent rounded-full" />
          <span className="font-medium">Analyzing situation...</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          AI is reviewing the information to provide guidance
        </p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const severityColor = SEVERITY_COLORS[analysis.severity] || SEVERITY_COLORS.medium;

  return (
    <div className="bg-white rounded-2xl border border-[#FEEAC9] overflow-hidden">
      <button
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
        className="w-full px-5 py-4 flex items-center justify-between bg-[#FEEAC9]/30"
        disabled={!collapsible}
      >
        <div className="flex items-center gap-2">
          <FiAlertCircle className="h-5 w-5 text-[#FD7979]" />
          <span className="font-semibold text-gray-900">AI Guidance</span>
          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${severityColor}`}>
            {analysis?.severity?.toUpperCase()}
          </span>
        </div>
        {collapsible && (
          isCollapsed ? (
            <FiChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <FiChevronUp className="h-5 w-5 text-gray-500" />
          )
        )}
      </button>

      {!isCollapsed && (
        <div className="p-5 space-y-4">
          {analysis.immediateSteps && analysis.immediateSteps.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Immediate Steps</h4>
              <ul className="space-y-2">
                {analysis.immediateSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[#FFCDC9] text-[#FD7979] rounded-lg text-xs font-bold">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
              <ul className="space-y-1.5">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#FD7979] flex-shrink-0"></span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.possibleConditions && analysis.possibleConditions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Possible Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.possibleConditions.map((condition, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-[#FEEAC9] text-gray-700 text-sm rounded-xl"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-[#FEEAC9]/50 rounded-xl">
            <FiInfo className="h-4 w-4 text-[#FD7979] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-700">
              This AI guidance is advisory only and should not replace professional
              veterinary care. Always consult a qualified veterinarian for proper
              diagnosis and treatment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
