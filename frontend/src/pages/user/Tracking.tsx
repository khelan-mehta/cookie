import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiPhone } from 'react-icons/fi';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { LiveMap } from '../../components/map/LiveMap';
import { AIGuidancePanel } from '../../components/distress/AIGuidancePanel';
import { VetResponseList } from '../../components/distress/VetResponseCard';
import { ConfirmModal } from '../../components/common/Modal';
import { useDistress } from '../../context/DistressContext';
import { useSocket } from '../../hooks/useSocket';
import { distressService, Distress } from '../../services/distress';
import { ROUTES, DISTRESS_STATUS } from '../../utils/constants';

export const Tracking = () => {
  const navigate = useNavigate();
  const { activeDistress, aiAnalysis, setActiveDistress, clearDistress, refreshActiveDistress } = useDistress();
  const [isSelectingVet, setIsSelectingVet] = useState(false);
  const [selectingVetId, setSelectingVetId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [vetLocation, setVetLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleDistressUpdated = useCallback(() => {
    refreshActiveDistress();
  }, [refreshActiveDistress]);

  const handleLocationUpdate = useCallback((data: { coordinates: [number, number] }) => {
    setVetLocation({
      lng: data.coordinates[0],
      lat: data.coordinates[1],
    });
  }, []);

  useSocket({
    distressId: activeDistress?._id,
    onDistressUpdated: handleDistressUpdated,
    onVetResponse: handleDistressUpdated,
    onDistressResolved: () => {
      toast.success('Emergency resolved!');
      clearDistress();
      navigate(ROUTES.DASHBOARD);
    },
    onLocationUpdate: handleLocationUpdate,
  });

  useEffect(() => {
    if (!activeDistress) {
      refreshActiveDistress();
    }
  }, [activeDistress, refreshActiveDistress]);

  const handleSelectVet = async (vetId: string, mode: string) => {
    if (!activeDistress) return;

    setIsSelectingVet(true);
    setSelectingVetId(vetId);

    try {
      const result = await distressService.selectVet(activeDistress._id, vetId, mode);
      setActiveDistress(result.distress as Distress);
      toast.success('Vet selected! Help is on the way.');
    } catch (err) {
      toast.error('Failed to select vet. Please try again.');
      console.error(err);
    } finally {
      setIsSelectingVet(false);
      setSelectingVetId(null);
    }
  };

  const handleCancel = async () => {
    if (!activeDistress) return;

    setIsCancelling(true);

    try {
      await distressService.cancelDistress(activeDistress._id);
      toast.success('Emergency cancelled');
      clearDistress();
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error('Failed to cancel. Please try again.');
      console.error(err);
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleResolve = async () => {
    if (!activeDistress) return;

    setIsResolving(true);

    try {
      await distressService.resolveDistress(activeDistress._id);
      toast.success('Emergency resolved! Thank you.');
      clearDistress();
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error('Failed to resolve. Please try again.');
      console.error(err);
    } finally {
      setIsResolving(false);
      setShowResolveModal(false);
    }
  };

  if (!activeDistress) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader text="Loading emergency details..." />
        </div>
      </Layout>
    );
  }

  const userLocation = activeDistress.location?.coordinates
    ? { lng: activeDistress.location.coordinates[0], lat: activeDistress.location.coordinates[1] }
    : undefined;

  const selectedVetLocation = activeDistress.selectedVetId?.location?.coordinates
    ? {
        lng: activeDistress.selectedVetId.location.coordinates[0],
        lat: activeDistress.selectedVetId.location.coordinates[1],
      }
    : vetLocation;

  const isInProgress = activeDistress.status === DISTRESS_STATUS.IN_PROGRESS;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Status Banner */}
        <Card className={`mb-6 ${isInProgress ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {isInProgress ? 'Help is Coming!' : 'Waiting for Responses'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isInProgress
                    ? activeDistress.responseMode === 'vet_coming'
                      ? 'A vet is on their way to you'
                      : 'Head to the clinic for assistance'
                    : 'Nearby vets have been notified'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isInProgress ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {activeDistress.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <Card className="lg:row-span-2">
            <CardBody className="p-0">
              <LiveMap
                userLocation={userLocation}
                vetLocation={selectedVetLocation || undefined}
                showRoute={isInProgress && !!selectedVetLocation}
                className="h-[300px] lg:h-[500px] rounded-xl"
              />
            </CardBody>
          </Card>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Guidance */}
            {(aiAnalysis || activeDistress.aiAnalysis) && (
              <AIGuidancePanel
                analysis={aiAnalysis || activeDistress.aiAnalysis || null}
                collapsible
                initialCollapsed={isInProgress}
              />
            )}

            {/* Vet Responses (when waiting) */}
            {!activeDistress.selectedVetId && (
              <Card>
                <CardBody>
                  <VetResponseList
                    responses={activeDistress.responses.map((r) => ({
                      vetId: typeof r.vetId === 'string' ? r.vetId : r.vetId._id,
                      clinicName: typeof r.vetId === 'object' ? r.vetId.clinicName : undefined,
                      mode: r.mode,
                      estimatedTime: r.estimatedTime,
                      distance: r.distance,
                      message: r.message,
                    }))}
                    onSelect={handleSelectVet}
                    selectingVetId={selectingVetId || undefined}
                  />
                </CardBody>
              </Card>
            )}

            {/* Selected Vet Info */}
            {activeDistress.selectedVetId && (
              <Card>
                <CardBody>
                  <h3 className="font-semibold text-gray-900 mb-3">Your Helper</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        {activeDistress.selectedVetId.clinicName || 'Veterinary Clinic'}
                      </p>
                      {activeDistress.selectedVetId.clinicAddress && (
                        <p className="text-sm text-gray-500">
                          {activeDistress.selectedVetId.clinicAddress}
                        </p>
                      )}
                    </div>
                    <a
                      href={`tel:${activeDistress.userId.phone}`}
                      className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                    >
                      <FiPhone className="h-5 w-5" />
                    </a>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {isInProgress ? (
                <Button
                  onClick={() => setShowResolveModal(true)}
                  className="flex-1"
                >
                  <FiCheck className="mr-2 h-4 w-4" />
                  Mark Resolved
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Cancel Emergency
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Modal */}
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
          title="Cancel Emergency"
          message="Are you sure you want to cancel this emergency? Vets who have responded will be notified."
          confirmText="Yes, Cancel"
          variant="danger"
          isLoading={isCancelling}
        />

        {/* Resolve Modal */}
        <ConfirmModal
          isOpen={showResolveModal}
          onClose={() => setShowResolveModal(false)}
          onConfirm={handleResolve}
          title="Mark as Resolved"
          message="Has the emergency been resolved? This will close the ticket."
          confirmText="Yes, Resolved"
          isLoading={isResolving}
        />
      </div>
    </Layout>
  );
};
