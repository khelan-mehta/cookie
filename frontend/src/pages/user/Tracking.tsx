import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiPhone } from "react-icons/fi";
import { Layout } from "../../components/layout/Layout";
import { Card, CardBody } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { LiveMap } from "../../components/map/LiveMap";
import { AIGuidancePanel } from "../../components/distress/AIGuidancePanel";
import { VetResponseList } from "../../components/distress/VetResponseCard";
import { ConfirmModal } from "../../components/common/Modal";
import { useDistress } from "../../context/DistressContext";
import { usePolling } from "../../hooks/usePolling";
import { locationService } from "../../services/location";
import { distressService, type Distress } from "../../services/distress";
import { ROUTES, DISTRESS_STATUS } from "../../utils/constants";

export const Tracking = () => {
  const navigate = useNavigate();
  const {
    activeDistress,
    aiAnalysis,
    setActiveDistress,
    clearDistress,
    refreshActiveDistress,
  } = useDistress();
  const [isSelectingVet, setIsSelectingVet] = useState(false);
  const [selectingVetId, setSelectingVetId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [vetLocation, setVetLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userCurrentLocation, setUserCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const locationWatchIdRef = useRef<number | null>(null);
  const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start watching user location and send updates
  useEffect(() => {
    if (!activeDistress?._id) return;

    // Get initial position
    locationService.getCurrentPosition()
      .then((position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setUserCurrentLocation({ lng: coords[0], lat: coords[1] });
        // Send initial location update
        locationService.updateDistressLocation(activeDistress._id, coords);
      })
      .catch((err) => {
        console.error("Failed to get initial position:", err);
      });

    // Watch position continuously
    locationWatchIdRef.current = locationService.watchPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setUserCurrentLocation({ lng: coords[0], lat: coords[1] });
      },
      (error) => {
        console.error("Location watch error:", error);
      }
    );

    // Send location updates to server every 5 seconds
    locationUpdateIntervalRef.current = setInterval(() => {
      if (userCurrentLocation && activeDistress?._id) {
        locationService.updateDistressLocation(activeDistress._id, [
          userCurrentLocation.lng,
          userCurrentLocation.lat,
        ]).catch(console.error);
      }
    }, 5000);

    return () => {
      if (locationWatchIdRef.current !== null) {
        locationService.clearWatch(locationWatchIdRef.current);
      }
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    };
  }, [activeDistress?._id]);

  // Update location when userCurrentLocation changes
  useEffect(() => {
    if (userCurrentLocation && activeDistress?._id) {
      locationService.updateDistressLocation(activeDistress._id, [
        userCurrentLocation.lng,
        userCurrentLocation.lat,
      ]).catch(console.error);
    }
  }, [userCurrentLocation, activeDistress?._id]);

  const handleDistressUpdated = useCallback(() => {
    refreshActiveDistress();
  }, [refreshActiveDistress]);

  const handleLocationUpdate = useCallback(
    (data: { coordinates: [number, number] }) => {
      setVetLocation({
        lng: data.coordinates[0],
        lat: data.coordinates[1],
      });
    },
    []
  );

  // Use HTTP polling instead of WebSocket for real-time updates
  usePolling({
    distressId: activeDistress?._id,
    pollingInterval: 3000, // Poll every 3 seconds
    onDistressUpdated: handleDistressUpdated,
    onDistressResolved: () => {
      toast.success("Emergency resolved!");
      clearDistress();
      navigate(ROUTES.DASHBOARD);
    },
    onLocationUpdate: handleLocationUpdate,
    enabled: !!activeDistress?._id,
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
      const result = await distressService.selectVet(
        activeDistress._id,
        vetId,
        mode
      );
      setActiveDistress(result.distress as Distress);
      toast.success("Vet selected! Help is on the way.");
    } catch (err) {
      toast.error("Failed to select vet. Please try again.");
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
      toast.success("Emergency cancelled");
      clearDistress();
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error("Failed to cancel. Please try again.");
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
      toast.success("Emergency resolved! Thank you.");
      clearDistress();
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      toast.error("Failed to resolve. Please try again.");
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

  // Use real-time user location if available, otherwise fall back to initial distress location
  const userLocation = userCurrentLocation || (activeDistress.location?.coordinates
    ? {
        lng: activeDistress.location.coordinates[0],
        lat: activeDistress.location.coordinates[1],
      }
    : undefined);

  const selectedVetLocation = activeDistress.selectedVetId?.location
    ?.coordinates
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
        <Card
          className={`mb-6 ${
            isInProgress
              ? "bg-[#FEEAC9] border-[#FDACAC]"
              : "bg-[#FFCDC9] border-[#FDACAC]"
          }`}
        >
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {isInProgress ? "Help is Coming!" : "Waiting for Responses"}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isInProgress
                    ? activeDistress.responseMode === "vet_coming"
                      ? "A vet is on their way to you"
                      : "Head to the clinic for assistance"
                    : "Nearby vets have been notified"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isInProgress
                    ? "bg-[#FEEAC9] text-gray-800 border border-[#FDACAC]"
                    : "bg-[#FD7979] text-white"
                }`}
              >
                {activeDistress.status.replace("_", " ").toUpperCase()}
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
                    responses={activeDistress.responses.map((r: any) => ({
                      vetId:
                        typeof r.vetId === "string" ? r.vetId : r.vetId._id,
                      clinicName:
                        typeof r.vetId === "object"
                          ? r.vetId.clinicName
                          : undefined,
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
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Your Helper
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        {activeDistress.selectedVetId.clinicName ||
                          "Veterinary Clinic"}
                      </p>
                      {activeDistress.selectedVetId.clinicAddress && (
                        <p className="text-sm text-gray-500">
                          {activeDistress.selectedVetId.clinicAddress}
                        </p>
                      )}
                    </div>
                    <a
                      href={`tel:${activeDistress.userId.phone}`}
                      className="p-3 bg-[#FEEAC9] text-[#FD7979] rounded-full hover:bg-[#FFCDC9] transition-colors"
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
