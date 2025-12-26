import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiAlertCircle, FiShoppingBag, FiUser, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useDistress } from '../../context/DistressContext';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ROUTES, DISTRESS_STATUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/validators';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeDistress, isLoading } = useDistress();

  useEffect(() => {
    // If there's an active distress, redirect to tracking
    if (activeDistress && activeDistress.status !== DISTRESS_STATUS.PENDING) {
      navigate(ROUTES.TRACKING);
    }
  }, [activeDistress, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader text="Loading..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">How can we help today?</p>
        </div>

        {/* Emergency CTA */}
        <Card className="mb-6 bg-[#FD7979] border-[#FD7979] text-white">
          <CardBody className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiAlertCircle className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold mb-2">Animal Emergency?</h2>
            <p className="mb-5 opacity-90">Get immediate help from nearby vets</p>
            <Button
              onClick={() => navigate(ROUTES.DISTRESS_CALL)}
              variant="secondary"
              size="lg"
              className="bg-white text-[#FD7979] hover:bg-[#FEEAC9] shadow-md"
            >
              Report Emergency
            </Button>
          </CardBody>
        </Card>

        {/* Active Distress Banner */}
        {activeDistress && (
          <Card className="mb-6 border-2 border-[#FDACAC] bg-[#FFCDC9]">
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FEEAC9] rounded-xl">
                    <FiClock className="h-5 w-5 text-[#FD7979]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Active Emergency</h3>
                    <p className="text-sm text-gray-600">
                      Started {formatDateTime(activeDistress.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(ROUTES.TRACKING)}
                  size="sm"
                >
                  View Status
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to={ROUTES.STORE}>
            <Card hoverable className="h-full">
              <CardBody className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-3 bg-[#FEEAC9] rounded-xl flex items-center justify-center">
                  <FiShoppingBag className="h-7 w-7 text-[#FD7979]" />
                </div>
                <h3 className="font-medium text-gray-900">Pet Store</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Browse medical supplies
                </p>
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
                <p className="text-sm text-gray-500 mt-1">
                  View history & settings
                </p>
              </CardBody>
            </Card>
          </Link>
        </div>

        {/* Tips */}
        <Card className="mt-6 bg-[#FEEAC9]/30">
          <CardBody>
            <h3 className="font-semibold text-gray-900 mb-3">Tips for Emergencies</h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#FD7979] flex-shrink-0"></span>
                Stay calm and assess the situation safely
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#FD7979] flex-shrink-0"></span>
                Take a clear photo if possible - it helps vets assess
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#FD7979] flex-shrink-0"></span>
                Don't move the animal unless it's in immediate danger
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#FD7979] flex-shrink-0"></span>
                Keep the animal warm and comfortable
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};
