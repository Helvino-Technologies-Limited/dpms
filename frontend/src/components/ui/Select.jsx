import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Select = forwardRef(({ label, error, options = [], placeholder, className, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select
      ref={ref}
      className={cn(
        'px-3 py-2 border rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white',
        error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Select.displayName = 'Select';
export default Select;
