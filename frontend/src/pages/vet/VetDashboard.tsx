import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiShoppingBag, FiUser, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user';
import { distressService, type Distress } from '../../services/distress';
import { ROUTES } from '../../utils/constants';
import { formatDistance, formatDateTime } from '../../utils/validators';

export const VetDashboard = () => {
  const { user, vetProfile, updateVetProfile } = useAuth();
  const [nearbyDistresses, setNearbyDistresses] = useState<Distress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

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
      toast.success(
        result.isAvailable
          ? 'You are now available to respond'
          : 'You are now unavailable'
      );
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

          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            disabled={isTogglingAvailability}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              vetProfile?.isAvailable
                ? 'bg-[#FEEAC9] text-gray-800 hover:bg-[#FFCDC9]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {vetProfile?.isAvailable ? (
              <>
                <FiToggleRight className="h-5 w-5 text-[#FD7979]" />
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

        {/* Setup Alert */}
        {!vetProfile?.clinicName && (
          <Card className="mb-6 bg-[#FFCDC9] border-[#FDACAC]">
            <CardBody>
              <p className="text-gray-800">
                Complete your profile to appear in search results.{' '}
                <Link to={ROUTES.PROFILE} className="underline font-medium text-[#FD7979]">
                  Set up now
                </Link>
              </p>
            </CardBody>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center py-5">
              <p className="text-3xl font-bold text-[#FD7979]">
                {nearbyDistresses.length}
              </p>
              <p className="text-sm text-gray-600">Active Emergencies</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-5">
              <p className="text-3xl font-bold text-gray-900">
                {vetProfile?.reviewCount || 0}
              </p>
              <p className="text-sm text-gray-600">Total Responses</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-5">
              <p className="text-3xl font-bold text-gray-900">
                {vetProfile?.rating?.toFixed(1) || '-'}
              </p>
              <p className="text-sm text-gray-600">Rating</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-5">
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
                className="text-[#FD7979] text-sm hover:underline font-medium"
              >
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader />
              </div>
            ) : nearbyDistresses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-[#FEEAC9] rounded-2xl flex items-center justify-center">
                  <FiAlertCircle className="h-8 w-8 text-[#FDACAC]" />
                </div>
                <p className="text-gray-600">No active emergencies nearby</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyDistresses.slice(0, 3).map((distress) => (
                  <Link
                    key={distress._id}
                    to={`${ROUTES.VET_DISTRESS_LIST}?id=${distress._id}`}
                    className="block p-4 bg-[#FEEAC9]/30 rounded-xl hover:bg-[#FEEAC9]/50 transition-colors border border-transparent hover:border-[#FDACAC]"
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
                      <div className="text-right ml-3">
                        {distress.distance !== undefined && (
                          <span className="text-[#FD7979] font-medium bg-[#FFCDC9] px-2 py-1 rounded-lg text-sm">
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
                <div className="w-14 h-14 mx-auto mb-3 bg-[#FEEAC9] rounded-xl flex items-center justify-center">
                  <FiShoppingBag className="h-7 w-7 text-[#FD7979]" />
                </div>
                <h3 className="font-medium text-gray-900">My Store</h3>
                <p className="text-sm text-gray-500 mt-1">Manage products</p>
              </CardBody>
            </Card>
          </Link>

          <Link to={ROUTES.PROFILE}>
            <Card hoverable className="h-full">
              <CardBody className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-3 bg-[#FEEAC9] rounded-xl flex items-center justify-center">
                  <FiUser className="h-7 w-7 text-[#FD7979]" />
                </div>
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
