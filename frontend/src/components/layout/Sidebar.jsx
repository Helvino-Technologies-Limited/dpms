import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FileText, CreditCard,
  Scissors,
  Package, Shield, Stethoscope, Settings, LogOut, Building2,
  Pill, BarChart3, Heart
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { cn, getInitials } from '../../utils/helpers';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Patients', path: '/patients' },
  { icon: Calendar, label: 'Appointments', path: '/appointments' },
  { icon: Stethoscope, label: 'Dental Chart', path: '/dental-chart' },
  { icon: FileText, label: 'Treatments', path: '/treatments' },
  { icon: Scissors, label: 'Services', path: '/services' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Shield, label: 'Insurance', path: '/insurance' },
  { icon: Pill, label: 'Prescriptions', path: '/prescriptions' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Users, label: 'Staff', path: '/staff' },
  { icon: Building2, label: 'Branches', path: '/branches' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40 flex flex-col transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">DentalCare</p>
              <p className="text-xs text-gray-400">Practice Management</p>
            </div>
          </div>
        </div>

        {/* Clinic name */}
        <div className="px-4 py-3 mx-3 mt-3 bg-primary-50 rounded-xl">
          <p className="text-xs text-primary-600 font-medium">Active Clinic</p>
          <p className="text-sm font-semibold text-primary-800 truncate">{user?.clinicName || 'My Clinic'}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => cn('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(user?.fullName || user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role?.replace(/_/g, ' ').toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
