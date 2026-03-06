import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils/helpers';
import { format } from 'date-fns';

export default function Header({ onMenuClick }) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients, appointments..."
            className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs text-gray-400">{format(new Date(), 'EEEE, MMM dd yyyy')}</span>
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(user?.fullName || user?.email)}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
