// components/ui/ToggleButton.jsx

const ToggleButton = ({
  name,
  label,
  register,
  errors,
  required = false,
  defaultValue = true,
  onToggle = (_checked: boolean) => {},
  disabled = false,
  size = 'md', // sm, md, lg
  variant = 'primary', // primary, success, danger, warning
}: any) => {
  const sizeClasses = {
    sm: 'w-9 h-5 after:h-4 after:w-4 after:left-[2px] after:top-[2px]',
    md: 'w-11 h-6 after:h-5 after:w-5 after:left-[2px] after:top-[2px]',
    lg: 'w-14 h-7 after:h-6 after:w-6 after:left-[1px] after:top-[1px]',
  };

  const variantClasses = {
    primary: 'peer-checked:bg-blue-600',
    success: 'peer-checked:bg-green-600',
    danger: 'peer-checked:bg-red-600',
    warning: 'peer-checked:bg-yellow-600',
  };

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex items-center space-x-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            {...register(name, {
              required: required ? `${label} is required` : false,
            })}
            defaultChecked={defaultValue}
            disabled={disabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div
            className={`${sizeClasses[size as keyof typeof sizeClasses]} bg-gray-200 rounded-full peer 
            peer-checked:after:translate-x-full after:content-[''] after:absolute 
            after:bg-white after:rounded-full after:transition-all 
            ${variantClasses[variant as keyof typeof variantClasses]} peer-disabled:opacity-50 
            peer-disabled:cursor-not-allowed transition-colors duration-300`}
          ></div>
        </label>

        <span className="text-sm font-medium text-gray-600">
          {defaultValue ? 'Active' : 'Inactive'}
        </span>
      </div>

      {errors && errors[name] && (
        <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

export default ToggleButton;
