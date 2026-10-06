import { useId, type ReactNode } from "react";

export type Option = string | { value: string; label: string };

/* Shared input styling */
const input =
  "w-full h-8 bg-transparent border border-white/15 px-3 text-[0.8125rem] text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none transition-colors";

const invalidClass = (invalid: boolean) =>
  invalid ? "border-red-400/70" : "";

type Slot = {
  id: string;
  invalid: boolean;
  describedBy?: string;
};

function Field({
  label,
  error,
  hint,
  optional,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: (slot: Slot) => ReactNode;
}) {
  const id = useId();

  const describedBy = error
    ? `${id}-e`
    : hint
      ? `${id}-h`
      : undefined;

  return (
    <div className={`flex flex-col ${className}`}>
      <label
        htmlFor={id}
        className="mb-1 text-[0.75rem] font-medium leading-none text-white/70"
      >
        {label}

        {optional && (
          <span className="ml-1 text-[0.7rem] font-normal text-white/35">
            Optional
          </span>
        )}
      </label>

      {children({
        id,
        invalid: !!error,
        describedBy,
      })}

      {error ? (
        <p
          id={`${id}-e`}
          role="alert"
          className="mt-1 text-[0.7rem] leading-tight text-red-400"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-h`}
          className="mt-1 text-[0.7rem] leading-tight text-white/40"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Common = {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
};

export function Text({
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  ...rest
}: Common & {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <Field {...rest}>
      {(s) => (
        <input
          id={s.id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={s.invalid}
          aria-describedby={s.describedBy}
          className={`${input} ${invalidClass(s.invalid)}`}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

export function Select({
  value,
  onChange,
  options,
  ...rest
}: Common & {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  return (
    <Field {...rest}>
      {(s) => (
        <select
          id={s.id}
          value={value}
          aria-invalid={s.invalid}
          aria-describedby={s.describedBy}
          className={`${input} [&>option]:bg-neutral-900 ${invalidClass(
            s.invalid
          )}`}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>

          {options.map((o) =>
            typeof o === "string" ? (
              <option key={o} value={o}>
                {o}
              </option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            )
          )}
        </select>
      )}
    </Field>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  ...rest
}: Common & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field {...rest}>
      {(s) => (
        <textarea
          id={s.id}
          rows={2}
          value={value}
          placeholder={placeholder}
          aria-invalid={s.invalid}
          aria-describedby={s.describedBy}
          className={`
            w-full
            min-h-[4rem]
            resize-none
            bg-transparent
            border border-white/15
            px-3 py-2
            text-[0.8125rem]
            text-white
            placeholder:text-white/30
            focus:border-white/60
            focus:outline-none
            transition-colors
            ${invalidClass(s.invalid)}
          `}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

export function FileField({
  onChange,
  ...rest
}: Common & {
  onChange: (f: File | null) => void;
}) {
  return (
    <Field {...rest}>
      {(s) => (
        <input
          id={s.id}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          aria-invalid={s.invalid}
          aria-describedby={s.describedBy}
          className={`
            w-full
            bg-transparent
            border border-white/15
            px-2 py-1
            text-[0.75rem]
            text-white
            focus:border-white/60
            focus:outline-none
            transition-colors
            file:mr-3
            file:border-0
            file:bg-white
            file:px-3
            file:py-1
            file:text-[0.75rem]
            file:font-semibold
            file:text-black
            ${invalidClass(s.invalid)}
          `}
          onChange={(e) =>
            onChange(e.target.files?.[0] ?? null)
          }
        />
      )}
    </Field>
  );
}

export function Checkbox({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {/* "!" because the global unlayered label/input rules in styles.css would otherwise win. */}
      <label className="m-0! flex! w-fit cursor-pointer items-center gap-2 text-[0.8125rem]! leading-tight text-white/70!">
        <input
          type="checkbox"
          checked={checked}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.checked)}
          className="m-0! h-4 w-4 min-h-0! shrink-0 cursor-pointer p-0! accent-white"
        />

        <span>{children}</span>
      </label>

      {error && (
        <p
          role="alert"
          className="mt-1 ml-6 text-[0.7rem] text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export const Heading = ({
  children,
}: {
  children: ReactNode;
}) => (
  <h3 className="text-[0.6875rem] font-medium uppercase tracking-wider text-white/40">
    {children}
  </h3>
);