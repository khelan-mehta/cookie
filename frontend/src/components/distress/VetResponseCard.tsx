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
    <Card className={isSelected ? 'ring-2 ring-[#FD7979] border-[#FD7979]' : ''}>
      <CardBody>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {response.clinicName || 'Veterinary Clinic'}
            </h3>
            <span
              className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg mt-1.5 ${
                response.mode === 'vet_coming'
                  ? 'bg-[#FEEAC9] text-gray-800'
                  : 'bg-[#FFCDC9] text-gray-800'
              }`}
            >
              {response.mode === 'vet_coming' ? 'Vet Coming to You' : 'Visit Clinic'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {response.distance !== undefined && (
            <div className="flex items-center gap-1.5 bg-[#FEEAC9]/50 px-2.5 py-1 rounded-lg">
              <FiMapPin className="h-4 w-4 text-[#FD7979]" />
              <span>{formatDistance(response.distance)}</span>
            </div>
          )}
          {response.estimatedTime !== undefined && (
            <div className="flex items-center gap-1.5">
              <FiClock className="h-4 w-4" />
              <span>{formatDuration(response.estimatedTime)}</span>
            </div>
          )}
        </div>

        {response.message && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 p-3 bg-[#FEEAC9]/30 rounded-xl">
            <FiMessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#FD7979]" />
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
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-[#FEEAC9] rounded-xl flex items-center justify-center animate-pulse-soft">
          <FiClock className="h-6 w-6 text-[#FD7979]" />
        </div>
        <p className="text-gray-600 font-medium">Waiting for vet responses...</p>
        <p className="text-sm text-gray-500 mt-1">Nearby vets have been notified</p>
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
