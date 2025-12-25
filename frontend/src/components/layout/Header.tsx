import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const getDashboardRoute = () => {
    return user?.role === 'vet' ? ROUTES.VET_DASHBOARD : ROUTES.DASHBOARD;
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardRoute()} className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-xl text-gray-900">Cookie</span>
          </Link>

          {isAuthenticated && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to={getDashboardRoute()}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                {user?.role === 'user' && (
                  <Link
                    to={ROUTES.STORE}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Store
                  </Link>
                )}
                {user?.role === 'vet' && (
                  <>
                    <Link
                      to={ROUTES.VET_DISTRESS_LIST}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Emergencies
                    </Link>
                    <Link
                      to={ROUTES.VET_STORE}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      My Store
                    </Link>
                  </>
                )}
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <Link
                  to={ROUTES.PROFILE}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <FiUser className="h-5 w-5" />
                  )}
                  <span>{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {isMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-4 space-y-3">
            <Link
              to={getDashboardRoute()}
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            {user?.role === 'user' && (
              <Link
                to={ROUTES.STORE}
                className="block py-2 text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Store
              </Link>
            )}
            {user?.role === 'vet' && (
              <>
                <Link
                  to={ROUTES.VET_DISTRESS_LIST}
                  className="block py-2 text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Emergencies
                </Link>
                <Link
                  to={ROUTES.VET_STORE}
                  className="block py-2 text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Store
                </Link>
              </>
            )}
            <Link
              to={ROUTES.PROFILE}
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left py-2 text-red-600"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
