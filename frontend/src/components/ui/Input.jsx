import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Input = forwardRef(({ label, error, helper, className, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-sm font-medium text-gray-700">{label}</label>
    )}
    <input
      ref={ref}
      className={cn(
        'px-3 py-2 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
    {helper && !error && <p className="text-xs text-gray-400">{helper}</p>}
  </div>
));
Input.displayName = 'Input';
export default Input;
