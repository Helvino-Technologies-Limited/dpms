import { format, parseISO } from 'date-fns';

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '-';
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, fmt);
  } catch {
    return '-';
  }
};

export const formatCurrency = (amount, currency = 'KES') => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, 'MMM dd, yyyy HH:mm');
  } catch {
    return '-';
  }
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-gray-100 text-gray-700',
  RESCHEDULED: 'bg-purple-100 text-purple-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PARTIAL: 'bg-orange-100 text-orange-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
  TRIAL: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-700',
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');
