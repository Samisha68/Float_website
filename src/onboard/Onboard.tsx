import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Checkbox, FileField, Select, Text, TextArea } from "./fields";
import {
  type CountryOption, type Docs, type Errors, type Form, type Person,
  emptyPerson, ENTITY_TYPES, fallbackCountries, fetchCountries, ID_TYPES, INDUSTRIES, initialForm, MAX_PEOPLE, ROLES, RPC_PROVIDERS, RPC_USAGE, STEPS, validate,
} from "./model";

const TITLES = ["Company details", "Owners & directors", "Documents", "Activity", "Review & declare"];
const SUBTITLES = [
  "Tell us about your registered business.",
  "List everyone with 25% or more ownership, plus directors and authorized signers.",
  "Upload PDF, PNG or JPG files. Everything here is optional, but we can only proceed once we have all documents.",
  "How you plan to use your credit line.",
  "Confirm everything is accurate before you submit.",
];

function PersonCard({ index, person, errors, countries, canRemove, onChange, onRemove }: { index: number; countries: CountryOption[]; person: Person; errors: Errors; canRemove: boolean; onChange: (patch: Partial<Person>) => void; onRemove: () => void }) {
  const k = `people.${index}`;
  const owner = person.roles.includes("Beneficial owner");
  return (
    <fieldset className="border border-white/10 p-4">
      <legend className="flex items-center gap-3 px-1 mb-3 text-[0.8125rem] font-medium">
        Person {index + 1}
        {canRemove && (
          <button type="button" aria-label={`Remove person ${index + 1}`} className="text-white/40 transition-colors hover:text-white" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </legend>
      <div role="group" aria-label="Roles">
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => {
            const on = person.roles.includes(r);
            return (
              <label key={r} className={`m-0! cursor-pointer border px-3 py-1 text-[0.75rem]! transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white ${on ? "border-white bg-white text-black!" : "border-white/15 text-white/60! hover:text-white!"}`}>
                <input type="checkbox" className="sr-only" checked={on} onChange={() => onChange({ roles: on ? person.roles.filter((x) => x !== r) : [...person.roles, r] })} />
                {r}
              </label>
            );
          })}
        </div>
        {errors[`${k}.roles`] && <p role="alert" className="mt-1 text-[0.75rem] text-red-400">{errors[`${k}.roles`]}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Text label="First name" value={person.first} onChange={(v) => onChange({ first: v })} error={errors[`${k}.first`]} autoComplete="off" />
        <Text label="Last name" value={person.last} onChange={(v) => onChange({ last: v })} error={errors[`${k}.last`]} autoComplete="off" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Text label="Date of birth" type="date" value={person.dob} onChange={(v) => onChange({ dob: v })} error={errors[`${k}.dob`]} autoComplete="off" />
        {owner && <Text label="Ownership %" type="number" hint="25% or more" value={person.ownership} onChange={(v) => onChange({ ownership: v })} error={errors[`${k}.ownership`]} autoComplete="off" />}
        <Text label="Email" type="email" value={person.email} onChange={(v) => onChange({ email: v })} error={errors[`${k}.email`]} autoComplete="off" />
        <Text label="Phone" type="tel" value={person.phone} onChange={(v) => onChange({ phone: v })} optional autoComplete="off" />
        <Select label="Nationality" value={person.nationality} onChange={(v) => onChange({ nationality: v })} options={countries} error={errors[`${k}.nationality`]} />
        <Select label="ID document type" value={person.idType} onChange={(v) => onChange({ idType: v })} options={ID_TYPES} error={errors[`${k}.idType`]} />
        <Text label="ID document number" value={person.idNumber} onChange={(v) => onChange({ idNumber: v })} error={errors[`${k}.idNumber`]} autoComplete="off" />
      </div>
      <Text label="Residential address" value={person.address} onChange={(address) => onChange({ address })} error={errors[`${k}.address`]} autoComplete="off" />
      <fieldset>
        <legend className="py-1 text-[0.75rem] font-medium text-white/70">Is this person a politically exposed person (PEP)?</legend>
        <div className="flex gap-6 text-[0.8125rem] text-white/70">
          {(["yes", "no"] as const).map((v) => (
            <label key={v} className="m-0! flex! cursor-pointer items-center py-3 gap-2 text-[0.8125rem]! text-white/70!">
              <input type="radio" name={`pep-${index}`} checked={person.pep === v} onChange={() => onChange({ pep: v })} className="m-0! min-h-0! p-0! accent-white" />
              {v === "yes" ? "Yes" : "No"}
            </label>
          ))}
        </div>
        {errors[`${k}.pep`] && <p role="alert" className="mt-1 text-[0.75rem] text-red-400">{errors[`${k}.pep`]}</p>}
      </fieldset>
    </fieldset>
  );
}

export default function Onboard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>(fallbackCountries);
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => { fetchCountries().then(setCountries); }, []);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setPerson = (i: number, patch: Partial<Person>) => setForm((f) => ({ ...f, people: f.people.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));
  const setDoc = (key: keyof Docs) => (file: File | null) => setForm((f) => ({ ...f, docs: { ...f.docs, [key]: file } }));
  const last = step === STEPS.length - 1;

  function go(next: number) {
    setStep(next);
    setErrors({});
    card.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    card.current?.focus({ preventScroll: true });
  }

  function onNext() {
    const found = validate(step, form);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    if (last) submit();
    else go(step + 1);
  }

  // TODO: send to the KYB API once the endpoint is confirmed. Owners' personal data must not be
  // shown back after submission, so only the business name is kept and the rest is cleared.
  function submit() {
    setSubmitted(form.legalName);
    setForm(initialForm());
  }

  return (
    <div className="flex min-h-svh flex-col bg-black font-[family-name:var(--font-ui)] text-[#f4f2ef]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 pb-14 pt-28"><div className="w-full max-w-3xl">
        {submitted !== null ? (
          <div role="status" className="border border-white/15 bg-white/[0.03] p-8 text-center">
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center bg-white text-black"><Check className="h-5 w-5" aria-hidden="true" /></div>
            <h1 className="text-2xl font-semibold">Application submitted</h1>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-white/60">
              Thanks, {submitted}. Your business is now <strong className="text-white">in review</strong>. We'll email you if we need anything else. For privacy, the details you entered are not shown again.
            </p>
            <a href="/" className="mt-6 inline-block bg-white px-4 py-1.5 text-[0.8125rem] font-semibold text-black transition-all hover:bg-white/90">Back to home</a>
          </div>
        ) : (
          <div ref={card} tabIndex={-1} className="border border-white/15 bg-white/[0.03] p-5 focus:outline-none sm:px-8 sm:py-6">
            <ol className="mb-4 flex items-center gap-2" aria-label="Progress">
              {STEPS.map((name, i) => (
                <li key={name} className="flex-1" aria-current={i === step ? "step" : undefined}>
                  <div className={`h-0.5 ${i <= step ? "bg-white" : "bg-white/15"}`} />
                  <span className={`mt-2 hidden text-[0.6875rem] sm:block ${i === step ? "text-white" : "text-white/35"}`}>{name}</span>
                </li>
              ))}
            </ol>
            <p className="text-[0.75rem] text-white/40">Step {step + 1} of {STEPS.length}</p>
            <h1 className="mt-0.5 text-xl font-semibold">{TITLES[step]}</h1>
            <p className="mb-4 mt-0.5 text-[0.8125rem] text-white/50">{SUBTITLES[step]}</p>

            <form noValidate onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-3">
              {step === 0 && (
                <>
                  <Text label="Legal Name" hint="Exactly as registered" value={form.legalName} onChange={(v) => set("legalName", v)} error={errors.legalName} autoComplete="organization" />
                  <Text label="Trading / brand name " value={form.tradingName} onChange={(v) => set("tradingName", v)} optional />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Select label="Country of incorporation" value={form.country} onChange={(v) => set("country", v)} options={countries} error={errors.country} />
                    <Select label="Entity type" value={form.entityType} onChange={(v) => set("entityType", v)} options={ENTITY_TYPES} error={errors.entityType} />
                    <Text label="Registration number" hint="e.g. CAC RC number" value={form.regNumber} onChange={(v) => set("regNumber", v)} error={errors.regNumber} />
                    <Text label="Tax ID (TIN / EIN)" value={form.taxId} onChange={(v) => set("taxId", v)} error={errors.taxId} />
                    <Text label="Date of incorporation" type="date" value={form.incorporated} onChange={(v) => set("incorporated", v)} error={errors.incorporated} />
                    <Select label="Industry" value={form.industry} onChange={(v) => set("industry", v)} options={INDUSTRIES} error={errors.industry} />
                  </div>
                  <TextArea label="What does the business do?" value={form.description} onChange={(v) => set("description", v)} error={errors.description} />
                  <Text label="Business email" type="email" hint="Where our reviewer will contact you" value={form.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Text label="Website " type="url" value={form.website} onChange={(v) => set("website", v)} optional placeholder="https://" />
                    <Text label="Business Phone " type="tel" value={form.phone} onChange={(v) => set("phone", v)} optional autoComplete="tel" />
                  </div>
                  <Text label="Registered address" hint="Street, city, state / region and postal code" value={form.registered} onChange={(a) => set("registered", a)} error={errors.registered} autoComplete="off" />
                  <Checkbox checked={form.sameOperating} onChange={(v) => set("sameOperating", v)}>Our operating address is the same as the registered address</Checkbox>
                  {!form.sameOperating && (
                    <Text label="Operating address" value={form.operating} onChange={(a) => set("operating", a)} error={errors.operating} autoComplete="off" />
                  )}
                </>
              )}

              {step === 1 && (
                <>
                  {errors.people && <p role="alert" className="text-[0.8125rem] text-red-400">{errors.people}</p>}
                  {form.people.map((p, i) => (
                    <PersonCard key={i} index={i} person={p} errors={errors} countries={countries} canRemove={form.people.length > 1}
                      onChange={(patch) => setPerson(i, patch)} onRemove={() => set("people", form.people.filter((_, j) => j !== i))} />
                  ))}
                  {form.people.length < MAX_PEOPLE && (
                    <button type="button" className="flex items-center gap-1.5 text-[0.8125rem] text-white/60 transition-colors hover:text-white" onClick={() => set("people", [...form.people, emptyPerson()])}>
                      <Plus className="h-4 w-4" aria-hidden="true" /> Add another person
                    </button>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <FileField label="Certificate of incorporation" onChange={setDoc("incorporation")} optional />
                  <FileField label="Proof of business address" hint="Utility bill or bank statement, under 3 months old" onChange={setDoc("addressProof")} optional />
                  <FileField label="Government ID for each owner and director" hint="Combine into one PDF if needed" onChange={setDoc("ownerIds")} optional />
                  <FileField label="Memorandum and articles of association" onChange={setDoc("memorandum")} optional />
                  <TextArea label="Anything we should know about your business or documents?" hint="If you can't provide a document, tell us why. We'll reach out, and can only proceed once we have all required documents." value={form.docsNote} onChange={(v) => set("docsNote", v)} optional />
                  <p className="text-[0.75rem] text-white/40">If upload isn't available yet, our reviewer will collect documents from you by email.</p>
                </>
              )}

              {step === 3 && (
                <>
                  <Select label="Main RPC / API provider" value={form.rpcProvider} onChange={(v) => set("rpcProvider", v)} options={RPC_PROVIDERS} error={errors.rpcProvider} />
                  <Select label="Estimated monthly usage" value={form.rpcUsage} onChange={(v) => set("rpcUsage", v)} options={RPC_USAGE} error={errors.rpcUsage} />
                  <TextArea label="Other RPC / API providers you'd like us to support" value={form.otherProviders} onChange={(v) => set("otherProviders", v)} optional placeholder="e.g. a specific provider or data API" />
                  <TextArea label="Source of funds for settlement" value={form.sourceOfFunds} onChange={(v) => set("sourceOfFunds", v)} error={errors.sourceOfFunds} placeholder="e.g. Revenue from customer subscriptions" />
                  <TextArea label="Solana wallet(s) you'll settle from" value={form.wallets} onChange={(v) => set("wallets", v)} error={errors.wallets} hint="One per line or comma-separated. You'll prove ownership of each wallet later." />
                </>
              )}

              {step === 4 && (
                <>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 border border-white/10 p-3 text-[0.8125rem]">
                    <dt className="text-white/40">Business</dt><dd>{form.legalName}</dd>
                    <dt className="text-white/40">Country</dt><dd>{countries.find((c) => c.value === form.country)?.label}</dd>
                    <dt className="text-white/40">People</dt><dd>{form.people.length}</dd>
                    <dt className="text-white/40">Documents</dt><dd>{Object.values(form.docs).filter(Boolean).length} uploaded</dd>
                    <dt className="text-white/40">RPC provider</dt><dd>{form.rpcProvider}</dd>
                    <dt className="text-white/40">Monthly usage</dt><dd>{form.rpcUsage}</dd>
                  </dl>
                  <Text label="Your full name" value={form.signerName} onChange={(v) => set("signerName", v)} error={errors.signerName} autoComplete="name" />
                  <Text label="Your title" value={form.signerTitle} onChange={(v) => set("signerTitle", v)} error={errors.signerTitle} autoComplete="organization-title" />
                  <Checkbox checked={form.truthful} onChange={(v) => set("truthful", v)} error={errors.truthful}>I confirm the information provided is true and complete.</Checkbox>
                  <Checkbox checked={form.consent} onChange={(v) => set("consent", v)} error={errors.consent}>I consent to verification and data processing, as described in the <a href="/privacy" className="underline">privacy policy</a>.</Checkbox>
                  <Checkbox checked={form.shareReputation} onChange={(v) => set("shareReputation", v)}>Optional: share our reputation across Float partners.</Checkbox>
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <button type="button" disabled={step === 0} onClick={() => go(step - 1)} className="flex items-center gap-1.5 text-[0.8125rem] text-white/60 transition-colors hover:text-white disabled:invisible">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                </button>
                <button type="submit" className="flex items-center gap-1.5 bg-white px-5 py-2 text-[0.8125rem] font-semibold text-black transition-all hover:bg-white/90">
                  {last ? "Submit application" : <>Continue <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div></main>
      <Footer />
    </div>
  );
}
