import { useId, type ReactNode } from "react";

export type Option = string | { value: string; label: string };

const input = "w-full bg-transparent border border-white/15 px-3 py-1.5 text-[0.8125rem] text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none transition-colors";
const invalidClass = (invalid: boolean) => (invalid ? "border-red-400/70" : "");

type Slot = { id: string; invalid: boolean; describedBy?: string };

function Field({ label, error, hint, optional, className = "", children }: { label: string; error?: string; hint?: string; optional?: boolean; className?: string; children: (slot: Slot) => ReactNode }) {
  const id = useId();
  const describedBy = error ? `${id}-e` : hint ? `${id}-h` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 flex items-baseline justify-between text-[0.75rem] font-medium text-white/70">
        <span>{label}</span>
        {optional && <span className="font-normal text-white/35">Optional</span>}
      </label>
      {children({ id, invalid: !!error, describedBy })}
      {error ? <p id={`${id}-e`} role="alert" className="mt-1 text-[0.75rem] text-red-400">{error}</p>
        : hint ? <p id={`${id}-h`} className="mt-1 text-[0.75rem] text-white/40">{hint}</p> : null}
    </div>
  );
}

type Common = { label: string; error?: string; hint?: string; optional?: boolean; className?: string };

export function Text({ value, onChange, type = "text", autoComplete, placeholder, ...rest }: Common & { value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; placeholder?: string }) {
  return (
    <Field {...rest}>
      {(s) => <input id={s.id} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={s.invalid} aria-describedby={s.describedBy} className={`${input} ${invalidClass(s.invalid)}`} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

export function Select({ value, onChange, options, ...rest }: Common & { value: string; onChange: (v: string) => void; options: Option[] }) {
  return (
    <Field {...rest}>
      {(s) => (
        <select id={s.id} value={value} aria-invalid={s.invalid} aria-describedby={s.describedBy} className={`${input} [&>option]:bg-neutral-900 ${invalidClass(s.invalid)}`} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </Field>
  );
}

export function TextArea({ value, onChange, placeholder, ...rest }: Common & { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Field {...rest}>
      {(s) => <textarea id={s.id} rows={2} value={value} placeholder={placeholder} aria-invalid={s.invalid} aria-describedby={s.describedBy} className={`${input} resize-none ${invalidClass(s.invalid)}`} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

export function FileField({ onChange, ...rest }: Common & { onChange: (f: File | null) => void }) {
  return (
    <Field {...rest}>
      {(s) => (
        <input id={s.id} type="file" accept=".pdf,.png,.jpg,.jpeg" aria-invalid={s.invalid} aria-describedby={s.describedBy}
          className={`${input} file:mr-3 file:border-0 file:bg-white file:px-3 file:py-1 file:text-[0.75rem] file:font-semibold file:text-black ${invalidClass(s.invalid)}`}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      )}
    </Field>
  );
}

export function Checkbox({ checked, onChange, error, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-relaxed text-white/70">
        <input type="checkbox" checked={checked} aria-invalid={!!error} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-white" />
        <span>{children}</span>
      </label>
      {error && <p role="alert" className="mt-1 ml-7 text-[0.75rem] text-red-400">{error}</p>}
    </div>
  );
}

export const Heading = ({ children }: { children: ReactNode }) => <h3 className="pt-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white/40">{children}</h3>;
