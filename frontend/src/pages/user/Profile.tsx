import { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { userService, DistressHistory } from '../../services/user';
import { formatDateTime } from '../../utils/validators';
import { isValidPhone } from '../../utils/validators';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<DistressHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await userService.getDistressHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleEdit = () => {
    setEditData({
      name: user?.name || '',
      phone: user?.phone || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!isValidPhone(editData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSaving(true);
    try {
      const { user: updatedUser } = await userService.updateProfile({
        name: editData.name,
        phone: editData.phone,
      });
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* Profile Info */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-start gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiUser className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <FiMail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <FiPhone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <span className="inline-block mt-2 px-2 py-1 bg-rose-100 text-rose-700 text-sm rounded-full">
                  {user?.role === 'vet' ? 'Vet / Helper' : 'Pet Parent'}
                </span>
              </div>

              <Button variant="ghost" onClick={handleEdit}>
                Edit
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Distress History */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Emergency History</h3>
          </CardHeader>
          <CardBody>
            {isLoadingHistory ? (
              <div className="py-4 flex justify-center">
                <Loader />
              </div>
            ) : history?.distresses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No emergency history yet
              </p>
            ) : (
              <div className="space-y-4">
                {history?.distresses.map((distress) => (
                  <div
                    key={distress._id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FiClock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-900 line-clamp-2">
                        {distress.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateTime(distress.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        distress.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : distress.status === 'cancelled'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {distress.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Profile"
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={editData.name}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              label="Phone Number"
              type="tel"
              value={editData.phone}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                }))
              }
            />
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
