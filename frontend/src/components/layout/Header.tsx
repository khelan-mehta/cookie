import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiLogOut, FiMenu, FiX, FiHome, FiShoppingBag, FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const getDashboardRoute = () => {
    return user?.role === 'vet' ? ROUTES.VET_DASHBOARD : ROUTES.DASHBOARD;
  };

  const isActiveRoute = (route: string) => {
    return location.pathname === route;
  };

  const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
        isActiveRoute(to)
          ? 'bg-[#FD7979] text-white shadow-sm'
          : 'text-gray-700 hover:bg-[#FEEAC9]'
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <header className="bg-white border-b-2 border-[#FEEAC9] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={getDashboardRoute()} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#FD7979] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Cookie</span>
          </Link>

          {isAuthenticated && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2 bg-[#FEEAC9]/30 rounded-full p-1.5">
                <NavLink to={getDashboardRoute()} icon={FiHome}>
                  Dashboard
                </NavLink>
                {user?.role === 'user' && (
                  <NavLink to={ROUTES.STORE} icon={FiShoppingBag}>
                    Store
                  </NavLink>
                )}
                {user?.role === 'vet' && (
                  <>
                    <NavLink to={ROUTES.VET_DISTRESS_LIST} icon={FiAlertTriangle}>
                      Emergencies
                    </NavLink>
                    <NavLink to={ROUTES.VET_STORE} icon={FiPackage}>
                      My Store
                    </NavLink>
                  </>
                )}
              </nav>

              {/* User Section */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to={ROUTES.PROFILE}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                    isActiveRoute(ROUTES.PROFILE)
                      ? 'bg-[#FFCDC9] text-gray-900'
                      : 'hover:bg-[#FEEAC9] text-gray-700'
                  }`}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full border-2 border-[#FDACAC]"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#FDACAC] flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="font-medium max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-500 hover:text-[#FD7979] hover:bg-[#FEEAC9] rounded-full transition-all"
                  title="Logout"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2.5 text-gray-700 hover:bg-[#FEEAC9] rounded-full transition-colors"
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
        <div className="md:hidden border-t border-[#FEEAC9] bg-white animate-slideUp">
          <nav className="px-4 py-4 space-y-2">
            <Link
              to={getDashboardRoute()}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${
                isActiveRoute(getDashboardRoute())
                  ? 'bg-[#FD7979] text-white'
                  : 'text-gray-700 hover:bg-[#FEEAC9]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FiHome className="h-5 w-5" />
              Dashboard
            </Link>
            {user?.role === 'user' && (
              <Link
                to={ROUTES.STORE}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${
                  isActiveRoute(ROUTES.STORE)
                    ? 'bg-[#FD7979] text-white'
                    : 'text-gray-700 hover:bg-[#FEEAC9]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FiShoppingBag className="h-5 w-5" />
                Store
              </Link>
            )}
            {user?.role === 'vet' && (
              <>
                <Link
                  to={ROUTES.VET_DISTRESS_LIST}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${
                    isActiveRoute(ROUTES.VET_DISTRESS_LIST)
                      ? 'bg-[#FD7979] text-white'
                      : 'text-gray-700 hover:bg-[#FEEAC9]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiAlertTriangle className="h-5 w-5" />
                  Emergencies
                </Link>
                <Link
                  to={ROUTES.VET_STORE}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${
                    isActiveRoute(ROUTES.VET_STORE)
                      ? 'bg-[#FD7979] text-white'
                      : 'text-gray-700 hover:bg-[#FEEAC9]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiPackage className="h-5 w-5" />
                  My Store
                </Link>
              </>
            )}
            <div className="border-t border-[#FEEAC9] pt-2 mt-2">
              <Link
                to={ROUTES.PROFILE}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${
                  isActiveRoute(ROUTES.PROFILE)
                    ? 'bg-[#FFCDC9] text-gray-900'
                    : 'text-gray-700 hover:bg-[#FEEAC9]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUser className="h-5 w-5" />
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-xl text-[#FD7979] hover:bg-[#FEEAC9] transition-colors"
              >
                <FiLogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
