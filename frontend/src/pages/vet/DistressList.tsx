import { useState, useEffect, useCallback } from 'react';
import { FiMapPin, FiClock, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { TextArea } from '../../components/common/Input';
import { usePolling } from '../../hooks/usePolling';
import { distressService, type Distress } from '../../services/distress';
import { locationService } from '../../services/location';
import { formatDistance, formatDateTime } from '../../utils/validators';
import { SEVERITY_COLORS } from '../../utils/constants';

export const DistressList = () => {
  const [distresses, setDistresses] = useState<Distress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistress, setSelectedDistress] = useState<Distress | null>(null);
  const [responseMode, setResponseMode] = useState<'vet_coming' | 'user_going'>('vet_coming');
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // ✅ Update vet location before loading distresses
  const updateVetLocationAndLoad = useCallback(async () => {
    try {
      const position = await locationService.getCurrentPosition();
      const coordinates: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      await locationService.updateVetLocation(coordinates);
      setLocationError(null);
      console.log('Vet location updated before loading distresses:', coordinates);
    } catch (error) {
      console.error('Failed to update vet location:', error);
      setLocationError('Could not get your location. Enable location access to see nearby emergencies.');
    }
  }, []);

  const loadDistresses = useCallback(async () => {
    try {
      const data = await distressService.getNearbyDistresses();
      setDistresses(data.distresses);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message?.includes('location')) {
        setLocationError('Please set your location first');
      }
      console.error('Failed to load distresses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // First update location, then load distresses
    updateVetLocationAndLoad().then(() => loadDistresses());
  }, [updateVetLocationAndLoad, loadDistresses]);

  // Use HTTP polling instead of WebSocket for real-time updates
  usePolling({
    pollingInterval: 5000, // Poll every 5 seconds for nearby distresses
    onNewDistress: (data) => {
      if (data.distresses && data.distresses.length > 0) {
        loadDistresses();
        toast('New emergency nearby!', { icon: '🚨' });
      }
    },
    enabled: true,
  });

  const handleRespond = async () => {
    if (!selectedDistress) return;

    setIsResponding(true);
    try {
      await distressService.respondToDistress(
        selectedDistress._id,
        responseMode,
        responseMessage
      );
      toast.success('Response sent successfully!');
      setSelectedDistress(null);
      setResponseMessage('');
      loadDistresses();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to respond');
      console.error(err);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nearby Emergencies</h1>
          <Button
            variant="ghost"
            onClick={() => {
              setIsLoading(true);
              loadDistresses();
            }}
          >
            <FiRefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Location Error Banner */}
        {locationError && (
          <Card className="mb-4 bg-amber-50 border-amber-200">
            <CardBody className="flex items-center gap-3">
              <FiAlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-amber-800 text-sm">{locationError}</p>
            </CardBody>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader text="Loading emergencies..." />
          </div>
        ) : distresses.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-500">No active emergencies in your area</p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure your location is set in your profile
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {distresses.map((distress) => (
              <Card key={distress._id}>
                <CardBody>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      {distress.aiAnalysis?.severity && (
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 ${
                            SEVERITY_COLORS[distress.aiAnalysis.severity]
                          }`}
                        >
                          {distress.aiAnalysis.severity.toUpperCase()}
                        </span>
                      )}
                      <p className="text-gray-900">{distress.description}</p>
                    </div>
                    {distress.imageUrl && (
                      <img
                        src={distress.imageUrl}
                        alt="Emergency"
                        className="w-20 h-20 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {distress.distance !== undefined && (
                      <div className="flex items-center gap-1">
                        <FiMapPin className="h-4 w-4" />
                        <span>{formatDistance(distress.distance)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FiClock className="h-4 w-4" />
                      <span>{formatDateTime(distress.createdAt)}</span>
                    </div>
                    <span className="text-gray-400">
                      {distress.responses.length} response(s)
                    </span>
                  </div>

                  <Button
                    onClick={() => setSelectedDistress(distress)}
                    className="w-full"
                  >
                    Respond to Emergency
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Response Modal */}
        <Modal
          isOpen={!!selectedDistress}
          onClose={() => setSelectedDistress(null)}
          title="Respond to Emergency"
          size="lg"
        >
          {selectedDistress && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Emergency Details</h4>
                <p className="text-gray-600 text-sm">{selectedDistress.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Response Mode</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setResponseMode('vet_coming')}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      responseMode === 'vet_coming'
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">I'll come to you</p>
                    <p className="text-sm text-gray-500">Visit the location</p>
                  </button>
                  <button
                    onClick={() => setResponseMode('user_going')}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      responseMode === 'user_going'
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">Come to clinic</p>
                    <p className="text-sm text-gray-500">Bring the animal</p>
                  </button>
                </div>
              </div>

              <div>
                <TextArea
                  label="Message (Optional)"
                  placeholder="Add any instructions or notes..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedDistress(null)}
                  disabled={isResponding}
                >
                  Cancel
                </Button>
                <Button onClick={handleRespond} isLoading={isResponding}>
                  Send Response
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};
