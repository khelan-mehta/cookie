import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiHeart } from 'react-icons/fi';
import { authService } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { isValidPhone } from '../../utils/validators';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

type Role = 'user' | 'vet';

export const RoleSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const tempData = location.state?.tempData;

  const [role, setRole] = useState<Role>('user');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tempData) {
    navigate(ROUTES.LOGIN);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        ...tempData,
        phone,
        role,
      });

      login(response.token, response.user);
      navigate(role === 'vet' ? ROUTES.VET_DASHBOARD : ROUTES.DASHBOARD);
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF5] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FD7979] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {tempData.name}!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#FEEAC9]">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-[#FD7979]/10 text-[#FD7979] rounded-xl text-sm border border-[#FDACAC]">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    role === 'user'
                      ? 'border-[#FD7979] bg-[#FFCDC9]'
                      : 'border-[#FEEAC9] hover:border-[#FDACAC]'
                  }`}
                >
                  <FiUser className={`h-6 w-6 ${role === 'user' ? 'text-[#FD7979]' : 'text-gray-500'}`} />
                  <span className={`font-medium ${role === 'user' ? 'text-gray-900' : 'text-gray-700'}`}>
                    Pet Parent
                  </span>
                  <span className="text-xs text-gray-500">
                    Report emergencies
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vet')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    role === 'vet'
                      ? 'border-[#FD7979] bg-[#FFCDC9]'
                      : 'border-[#FEEAC9] hover:border-[#FDACAC]'
                  }`}
                >
                  <FiHeart className={`h-6 w-6 ${role === 'vet' ? 'text-[#FD7979]' : 'text-gray-500'}`} />
                  <span className={`font-medium ${role === 'vet' ? 'text-gray-900' : 'text-gray-700'}`}>
                    Vet / Helper
                  </span>
                  <span className="text-xs text-gray-500">
                    Respond to calls
                  </span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
