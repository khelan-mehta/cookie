import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiShoppingBag, FiUser, FiToggleLeft, FiToggleRight, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user';
import { distressService, type Distress } from '../../services/distress';
import { locationService } from '../../services/location';
import { ROUTES } from '../../utils/constants';
import { formatDistance, formatDateTime } from '../../utils/validators';

export const VetDashboard = () => {
  const { user, vetProfile, updateVetProfile } = useAuth();
  const [nearbyDistresses, setNearbyDistresses] = useState<Distress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'unknown' | 'updating' | 'updated' | 'error'>('unknown');
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Update vet location to backend
  const updateVetLocation = useCallback(async () => {
    try {
      setLocationStatus('updating');
      const position = await locationService.getCurrentPosition();
      const coordinates: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      await locationService.updateVetLocation(coordinates);
      setLocationStatus('updated');
      console.log('Vet location updated:', coordinates);
    } catch (error) {
      console.error('Failed to update vet location:', error);
      setLocationStatus('error');
    }
  }, []);

  // ✅ Start location heartbeat when available
  const startLocationHeartbeat = useCallback(() => {
    // Update immediately
    updateVetLocation();

    // Then update every 30 seconds
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    locationIntervalRef.current = setInterval(updateVetLocation, 30000);
  }, [updateVetLocation]);

  // ✅ Stop location heartbeat
  const stopLocationHeartbeat = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  }, []);

  // ✅ Initialize location on mount if available
  useEffect(() => {
    if (vetProfile?.isAvailable) {
      startLocationHeartbeat();
    }
    return () => stopLocationHeartbeat();
  }, [vetProfile?.isAvailable, startLocationHeartbeat, stopLocationHeartbeat]);

  useEffect(() => {
    loadNearbyDistresses();
  }, []);

  const loadNearbyDistresses = async () => {
    try {
      const data = await distressService.getNearbyDistresses();
      setNearbyDistresses(data.distresses);
    } catch (err) {
      console.error('Failed to load distresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    setIsTogglingAvailability(true);
    try {
      const result = await userService.toggleVetAvailability();
      updateVetProfile({
        ...vetProfile!,
        isAvailable: result.isAvailable,
      });

      // ✅ Start/stop location heartbeat based on availability
      if (result.isAvailable) {
        startLocationHeartbeat();
        // Reload distresses after location is set
        setTimeout(loadNearbyDistresses, 1000);
        toast.success('You are now available to respond');
      } else {
        stopLocationHeartbeat();
        toast.success('You are now unavailable');
      }
    } catch (err) {
      toast.error('Failed to update availability');
      console.error(err);
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, Dr. {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              {vetProfile?.clinicName || 'Set up your clinic profile'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Location Status Indicator */}
            {vetProfile?.isAvailable && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                locationStatus === 'updated' ? 'bg-green-100 text-green-700' :
                locationStatus === 'updating' ? 'bg-blue-100 text-blue-700' :
                locationStatus === 'error' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                <FiMapPin className="h-3 w-3" />
                {locationStatus === 'updated' ? 'Location synced' :
                 locationStatus === 'updating' ? 'Syncing...' :
                 locationStatus === 'error' ? 'Location error' :
                 'Getting location...'}
              </div>
            )}

            {/* Availability Toggle */}
            <button
              onClick={handleToggleAvailability}
              disabled={isTogglingAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                vetProfile?.isAvailable
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {vetProfile?.isAvailable ? (
                <>
                  <FiToggleRight className="h-5 w-5" />
                  Available
                </>
              ) : (
                <>
                  <FiToggleLeft className="h-5 w-5" />
                  Unavailable
                </>
              )}
            </button>
          </div>
        </div>

        {/* Setup Alert */}
        {!vetProfile?.clinicName && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardBody>
              <p className="text-amber-800">
                Complete your profile to appear in search results.{' '}
                <Link to={ROUTES.PROFILE} className="underline font-medium">
                  Set up now
                </Link>
              </p>
            </CardBody>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-3xl font-bold text-rose-500">
                {nearbyDistresses.length}
              </p>
              <p className="text-sm text-gray-600">Active Emergencies</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {vetProfile?.reviewCount || 0}
              </p>
              <p className="text-sm text-gray-600">Total Responses</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {vetProfile?.rating?.toFixed(1) || '-'}
              </p>
              <p className="text-sm text-gray-600">Rating</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {vetProfile?.isAvailable ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-gray-600">Available</p>
            </CardBody>
          </Card>
        </div>

        {/* Nearby Emergencies */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Nearby Emergencies
              </h2>
              <Link
                to={ROUTES.VET_DISTRESS_LIST}
                className="text-rose-600 text-sm hover:underline"
              >
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader />
              </div>
            ) : nearbyDistresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiAlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active emergencies nearby</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyDistresses.slice(0, 3).map((distress) => (
                  <Link
                    key={distress._id}
                    to={`${ROUTES.VET_DISTRESS_LIST}?id=${distress._id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-900 line-clamp-2">
                          {distress.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDateTime(distress.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        {distress.distance !== undefined && (
                          <span className="text-rose-600 font-medium">
                            {formatDistance(distress.distance)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to={ROUTES.VET_STORE}>
            <Card hoverable className="h-full">
              <CardBody className="text-center py-6">
                <FiShoppingBag className="h-8 w-8 mx-auto mb-2 text-rose-500" />
                <h3 className="font-medium text-gray-900">My Store</h3>
                <p className="text-sm text-gray-500 mt-1">Manage products</p>
              </CardBody>
            </Card>
          </Link>

          <Link to={ROUTES.PROFILE}>
            <Card hoverable className="h-full">
              <CardBody className="text-center py-6">
                <FiUser className="h-8 w-8 mx-auto mb-2 text-rose-500" />
                <h3 className="font-medium text-gray-900">Profile</h3>
                <p className="text-sm text-gray-500 mt-1">Clinic settings</p>
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
