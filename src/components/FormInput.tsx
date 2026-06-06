type FormInputProps = {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  min?: string;
  inputMode?: 'numeric' | 'decimal' | 'text' | 'tel';
  pattern?: string;
};

export function FormInput({ name, label, placeholder, type = 'text', required, min, inputMode, pattern }: FormInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        required={required}
        inputMode={inputMode}
        pattern={pattern}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
      />
    </label>
  );
}
