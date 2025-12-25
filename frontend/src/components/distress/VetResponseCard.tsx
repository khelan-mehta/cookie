import { FiMapPin, FiClock, FiMessageCircle } from 'react-icons/fi';
import { Card, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { formatDistance, formatDuration } from '../../utils/validators';

interface VetResponse {
  vetId: string;
  clinicName?: string;
  mode: 'vet_coming' | 'user_going';
  estimatedTime?: number;
  distance?: number;
  message?: string;
}

interface VetResponseCardProps {
  response: VetResponse;
  onSelect: (vetId: string, mode: string) => void;
  isSelecting?: boolean;
  isSelected?: boolean;
}

export const VetResponseCard = ({
  response,
  onSelect,
  isSelecting = false,
  isSelected = false,
}: VetResponseCardProps) => {
  return (
    <Card className={isSelected ? 'ring-2 ring-rose-500' : ''}>
      <CardBody>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {response.clinicName || 'Veterinary Clinic'}
            </h3>
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                response.mode === 'vet_coming'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {response.mode === 'vet_coming' ? 'Vet Coming to You' : 'Visit Clinic'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {response.distance !== undefined && (
            <div className="flex items-center gap-1">
              <FiMapPin className="h-4 w-4" />
              <span>{formatDistance(response.distance)}</span>
            </div>
          )}
          {response.estimatedTime !== undefined && (
            <div className="flex items-center gap-1">
              <FiClock className="h-4 w-4" />
              <span>{formatDuration(response.estimatedTime)}</span>
            </div>
          )}
        </div>

        {response.message && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
            <FiMessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{response.message}</p>
          </div>
        )}

        <Button
          onClick={() => onSelect(response.vetId, response.mode)}
          isLoading={isSelecting}
          disabled={isSelected}
          className="w-full"
        >
          {isSelected ? 'Selected' : 'Accept Response'}
        </Button>
      </CardBody>
    </Card>
  );
};

export const VetResponseList = ({
  responses,
  onSelect,
  selectingVetId,
  selectedVetId,
}: {
  responses: VetResponse[];
  onSelect: (vetId: string, mode: string) => void;
  selectingVetId?: string;
  selectedVetId?: string;
}) => {
  if (responses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Waiting for vet responses...</p>
        <p className="text-sm mt-1">Nearby vets have been notified</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">
        {responses.length} Vet{responses.length > 1 ? 's' : ''} Responded
      </h3>
      {responses.map((response) => (
        <VetResponseCard
          key={response.vetId}
          response={response}
          onSelect={onSelect}
          isSelecting={selectingVetId === response.vetId}
          isSelected={selectedVetId === response.vetId}
        />
      ))}
    </div>
  );
};
