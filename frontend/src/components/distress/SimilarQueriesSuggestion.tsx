import { useState, useEffect, useCallback } from 'react';
import { FiClock, FiCheckCircle, FiAlertCircle, FiPhone } from 'react-icons/fi';
import { Card, CardBody } from '../common/Card';
import { chatHistoryService, type SimilarQuery } from '../../services/chatHistory';
import { formatDateTime } from '../../utils/validators';
import { SEVERITY_COLORS } from '../../utils/constants';

interface SimilarQueriesSuggestionProps {
  query: string;
  onSelectQuery?: (query: string) => void;
}

export const SimilarQueriesSuggestion = ({
  query,
  onSelectQuery,
}: SimilarQueriesSuggestionProps) => {
  const [suggestions, setSuggestions] = useState<SimilarQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!query || query.length < 10) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await chatHistoryService.getSimilarQueries(query);
      setSuggestions(response.suggestions);
    } catch (err) {
      console.error('Failed to fetch similar queries:', err);
      setError('Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [fetchSuggestions]);

  if (isLoading) {
    return (
      <Card className="mt-4 bg-[#FFF9F0] border-[#FEEAC9]">
        <CardBody className="py-3">
          <p className="text-sm text-[#5D4E4E] opacity-70 text-center">
            Looking for similar past emergencies...
          </p>
        </CardBody>
      </Card>
    );
  }

  if (error || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 bg-[#FFF9F0] border-[#FEEAC9]">
      <CardBody>
        <div className="flex items-center gap-2 mb-3">
          <FiClock className="h-4 w-4 text-[#FD7979]" />
          <h4 className="text-sm font-bold text-[#5D4E4E]">
            Similar Past Emergencies
          </h4>
        </div>
        <p className="text-xs text-[#5D4E4E] opacity-70 mb-3">
          You had similar situations before. Here's who helped:
        </p>

        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onSelectQuery?.(suggestion.query)}
              className="w-full text-left p-3 bg-white rounded-lg border-2 border-[#FFCDC9] hover:border-[#FD7979] hover:bg-[#FEEAC9] transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm text-[#5D4E4E] line-clamp-2 flex-1">
                  {suggestion.query}
                </p>
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold whitespace-nowrap ${
                    SEVERITY_COLORS[suggestion.severity as keyof typeof SEVERITY_COLORS] ||
                    SEVERITY_COLORS.medium
                  }`}
                >
                  {suggestion.severity.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#5D4E4E] opacity-70 flex-wrap">
                <div className="flex items-center gap-1">
                  {suggestion.resolved ? (
                    <FiCheckCircle className="h-3 w-3 text-[#10B981]" />
                  ) : (
                    <FiAlertCircle className="h-3 w-3 text-[#FDACAC]" />
                  )}
                  <span>{suggestion.resolved ? 'Resolved' : 'Not resolved'}</span>
                </div>

                {suggestion.vetContact && (
                  <div className="flex items-center gap-1 text-[#FD7979]">
                    <FiPhone className="h-3 w-3" />
                    <span className="font-medium">
                      {suggestion.vetContact.clinicName}
                    </span>
                  </div>
                )}

                <span>{formatDateTime(suggestion.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
