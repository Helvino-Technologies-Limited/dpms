import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Heart, Eye, EyeOff, ArrowLeft, ShieldCheck, Stethoscope, ClipboardList, Wallet, AlertTriangle } from 'lucide-react';
import { authAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import Seo from '../../components/Seo';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO !== 'false';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'Demo@1234';

const DEMO_ACCOUNTS = [
  { label: 'Clinic Admin', email: 'admin@demo.helvino.org', icon: ShieldCheck },
  { label: 'Dentist', email: 'dentist@demo.helvino.org', icon: Stethoscope },
  { label: 'Receptionist', email: 'reception@demo.helvino.org', icon: ClipboardList },
  { label: 'Cashier', email: 'cashier@demo.helvino.org', icon: Wallet },
];

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [notice, setNotice] = useState(() => {
    const msg = sessionStorage.getItem('dpms_login_notice');
    sessionStorage.removeItem('dpms_login_notice');
    return msg;
  });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const login = async (data) => {
    try {
      const res = await authAPI.login(data);
      const { accessToken, ...user } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate(user.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || (err.response ? 'Login failed' : 'Cannot reach the server');
      if (err.response?.data?.errors?.code === 'TENANT_INACTIVE') {
        setNotice(message);
      } else {
        toast.error(message);
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    await login(data);
    setLoading(false);
  };

  const demoLogin = async (email) => {
    setDemoLoading(email);
    setValue('email', email);
    setValue('password', DEMO_PASSWORD);
    await login({ email, password: DEMO_PASSWORD });
    setDemoLoading(null);
  };

  return (
    <div className="min-h-screen flex">
      <Seo title="Login" path="/login" noindex description="Sign in to DPMS to manage patients, appointments, dental charts and billing for your dental clinic." />
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-700 to-teal-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <img
          src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80"
          alt="Dental clinic"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-9 h-9 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">DPMS</h2>
          <p className="text-primary-200 text-lg">Dental Practice Management System</p>
          <p className="text-primary-300 text-sm mt-3">by Helvino Technologies Limited</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:max-w-xl">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">DPMS</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your clinic dashboard</p>

          {notice && (
            <div className="flex gap-3 p-3 mb-6 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{notice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="admin@clinic.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full justify-center py-3" loading={loading}>
              Sign In
            </Button>
          </form>

          {DEMO_ENABLED && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Try a demo account</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => {
                  const { label, email } = account;
                  const Icon = account.icon;
                  return (
                  <button
                    key={email}
                    type="button"
                    onClick={() => demoLogin(email)}
                    disabled={demoLoading !== null || loading}
                    title={email}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${demoLoading === email ? 'animate-pulse' : ''}`} />
                    <span className="truncate">{demoLoading === email ? 'Signing in…' : label}</span>
                  </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Shared demo clinic — don't enter real patient data.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
              Register your clinic
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
