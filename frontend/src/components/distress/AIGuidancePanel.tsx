import { useState } from 'react';
import { FiAlertCircle, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';
import { AIAnalysis } from '../../services/distress';
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
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <div className="animate-spin h-4 w-4 border-2 border-blue-700 border-t-transparent rounded-full" />
          <span className="font-medium">Analyzing situation...</span>
        </div>
        <p className="text-sm text-blue-600 mt-1">
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50"
        disabled={!collapsible}
      >
        <div className="flex items-center gap-2">
          <FiAlertCircle className="h-5 w-5 text-rose-500" />
          <span className="font-semibold text-gray-900">AI Guidance</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityColor}`}>
            {analysis.severity.toUpperCase()}
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
        <div className="p-4 space-y-4">
          {analysis.immediateSteps && analysis.immediateSteps.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Immediate Steps</h4>
              <ul className="space-y-1">
                {analysis.immediateSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-rose-100 text-rose-600 rounded-full text-xs font-medium">
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
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400">•</span>
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
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <FiInfo className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
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
