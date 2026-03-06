import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Heart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  clinicName: z.string().min(2, 'Clinic name required'),
  ownerName: z.string().min(2, 'Owner name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const { confirmPassword, ...payload } = data;
    try {
      const res = await authAPI.register(payload);
      const { accessToken, ...user } = res.data.data;
      setAuth(user, accessToken);
      toast.success('Clinic registered! 5-day trial activated.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-700 to-primary-600 items-center justify-center p-12 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80"
          alt="Dental practice"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 text-white max-w-sm">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-6">
            <Heart className="w-9 h-9 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-6">Start your 5-day free trial</h2>
          <ul className="space-y-3">
            {['No credit card required', 'Full access to all features', 'Free onboarding support', 'Cancel anytime'].map(item => (
              <li key={item} className="flex items-center gap-3 text-primary-100">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Register Your Clinic</h1>
          <p className="text-gray-500 text-sm mb-6">Get started with a 5-day free trial</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Clinic Name" placeholder="Smile Dental" error={errors.clinicName?.message} {...register('clinicName')} />
              <Input label="Owner Name" placeholder="Dr. John Doe" error={errors.ownerName?.message} {...register('ownerName')} />
            </div>
            <Input label="Email" type="email" placeholder="owner@clinic.com" error={errors.email?.message} {...register('email')} />
            <Input label="Phone Number" placeholder="0712345678" error={errors.phone?.message} {...register('phone')} />
            <Input label="Address" placeholder="123 Clinic Street, Nairobi" error={errors.address?.message} {...register('address')} />
            <Input label="License Number (optional)" placeholder="DEN-2024-XXXX" error={errors.licenseNumber?.message} {...register('licenseNumber')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Password" type="password" placeholder="Min 8 chars" error={errors.password?.message} {...register('password')} />
              <Input label="Confirm Password" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            </div>

            <Button type="submit" className="w-full justify-center py-3 mt-2" loading={loading}>
              Create Account & Start Trial
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already registered?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
