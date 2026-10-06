export const MAX_PEOPLE = 25;
export type CountryOption = { value: string; label: string };
const COUNTRY_CODES = ["NG", "US", "GB", "CA", "GH", "KE", "ZA", "EG", "AE", "IN", "SG", "DE", "FR", "NL", "ES", "IT", "BR", "MX", "AU", "JP", "CH", "IE", "PT", "SE", "TR", "UA", "PL", "ID", "PH", "VN", "HK", "KR"];
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const byLabel = (a: CountryOption, b: CountryOption) => a.label.localeCompare(b.label);
// Offline fallback, used until (or if) the REST Countries request succeeds.
export const fallbackCountries: CountryOption[] = COUNTRY_CODES.map((value) => ({ value, label: regionNames.of(value) ?? value })).sort(byLabel);

let countryRequest: Promise<CountryOption[]> | null = null;
export function fetchCountries(): Promise<CountryOption[]> {
  countryRequest ??= fetch("https://restcountries.com/v3.1/all?fields=name,cca2")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((rows: { cca2: string; name: { common: string } }[]) => rows.map((c) => ({ value: c.cca2, label: c.name.common })).sort(byLabel))
    .catch(() => { countryRequest = null; return fallbackCountries; });
  return countryRequest;
}

export const ENTITY_TYPES = ["Limited company (Ltd)", "Public company (PLC)", "LLC", "Sole proprietorship", "Partnership", "Other"];
export const INDUSTRIES = ["Fintech / payments", "Infrastructure / developer tools", "E-commerce / marketplace", "SaaS", "Media / content", "Gaming", "AI / data", "Logistics", "Other"];
export const ROLES = ["Beneficial owner", "Director", "Authorized signer"];
export const ID_TYPES = ["Passport", "National ID", "Driver's licence"];
export const RPC_PROVIDERS = ["Solami"];
export const RPC_USAGE = ["Under 10M requests / month", "10M – 100M requests / month", "100M – 1B requests / month", "1B – 10B requests / month", "Over 10B requests / month"];
export const STEPS = ["Company", "People", "Documents", "Activity", "Review"];

export type Address = string;
export type Person = {
  roles: string[]; first: string; last: string; dob: string; ownership: string; email: string; phone: string;
  address: Address; nationality: string; idType: string; idNumber: string; pep: "" | "yes" | "no";
};
export type Docs = { incorporation: File | null; addressProof: File | null; ownerIds: File | null; memorandum: File | null };
export type Form = {
  legalName: string; tradingName: string; country: string; regNumber: string; taxId: string; entityType: string; incorporated: string;
  industry: string; description: string; website: string; phone: string; email: string;
  registered: Address; sameOperating: boolean; operating: Address;
  people: Person[]; docs: Docs; docsNote: string;
  rpcProvider: string; rpcUsage: string; otherProviders: string; sourceOfFunds: string; wallets: string;
  truthful: boolean; signerName: string; signerTitle: string; consent: boolean; shareReputation: boolean;
};
export type Errors = Record<string, string>;

export const emptyAddress = (): Address => "";
export const emptyPerson = (): Person => ({ roles: [], first: "", last: "", dob: "", ownership: "", email: "", phone: "", address: emptyAddress(), nationality: "", idType: "", idNumber: "", pep: "" });
export const initialForm = (): Form => ({
  legalName: "", tradingName: "", country: "", regNumber: "", taxId: "", entityType: "", incorporated: "", industry: "", description: "", website: "", phone: "", email: "",
  registered: emptyAddress(), sameOperating: true, operating: emptyAddress(),
  people: [emptyPerson()], docs: { incorporation: null, addressProof: null, ownerIds: null, memorandum: null }, docsNote: "",
  rpcProvider: "", rpcUsage: "", otherProviders: "", sourceOfFunds: "", wallets: "",
  truthful: false, signerName: "", signerTitle: "", consent: false, shareReputation: false,
});

const filled = (v: string) => v.trim().length > 0;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const addressErrors = (a: Address, key: string, e: Errors) => { if (!filled(a)) e[key] = "Required"; };

export function validate(step: number, f: Form): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!filled(f.legalName)) e.legalName = "Required";
    if (!f.country) e.country = "Required";
    if (!filled(f.regNumber) && !filled(f.taxId)) { e.regNumber = "Enter a registration number or a tax ID"; e.taxId = "Enter a registration number or a tax ID"; }
    if (!f.entityType) e.entityType = "Required";
    if (!f.incorporated) e.incorporated = "Required";
    else if (f.incorporated > new Date().toISOString().slice(0, 10)) e.incorporated = "Date can't be in the future";
    if (!f.industry) e.industry = "Required";
    if (!filled(f.description)) e.description = "Required";
    if (!emailOk(f.email)) e.email = "Enter a valid email";
    addressErrors(f.registered, "registered", e);
    if (!f.sameOperating) addressErrors(f.operating, "operating", e);
  }
  if (step === 1) {
    f.people.forEach((p, i) => {
      const k = `people.${i}`;
      if (!p.roles.length) e[`${k}.roles`] = "Pick at least one role";
      if (!filled(p.first)) e[`${k}.first`] = "Required";
      if (!filled(p.last)) e[`${k}.last`] = "Required";
      if (!p.dob) e[`${k}.dob`] = "Required";
      if (p.roles.includes("Beneficial owner")) {
        const n = Number(p.ownership);
        if (!filled(p.ownership) || Number.isNaN(n) || n < 25 || n > 100) e[`${k}.ownership`] = "Enter 25–100";
      }
      if (!emailOk(p.email)) e[`${k}.email`] = "Enter a valid email";
      addressErrors(p.address, `${k}.address`, e);
      if (!p.nationality) e[`${k}.nationality`] = "Required";
      if (!p.idType) e[`${k}.idType`] = "Required";
      if (!filled(p.idNumber)) e[`${k}.idNumber`] = "Required";
      if (!p.pep) e[`${k}.pep`] = "Required";
    });
    if (!f.people.some((p) => p.roles.includes("Beneficial owner"))) e.people = "Add at least one beneficial owner (25% or more)";
  }
  if (step === 3) {
    if (!f.rpcProvider) e.rpcProvider = "Required";
    if (!f.rpcUsage) e.rpcUsage = "Required";
    if (!filled(f.sourceOfFunds)) e.sourceOfFunds = "Required";
    const wallets = f.wallets.split(/[\s,]+/).filter(Boolean);
    if (!wallets.length) e.wallets = "Add at least one Solana wallet address";
    else if (!wallets.every((w) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w))) e.wallets = "One or more addresses don't look like Solana addresses";
  }
  if (step === 4) {
    if (!f.truthful) e.truthful = "Please confirm";
    if (!filled(f.signerName)) e.signerName = "Required";
    if (!filled(f.signerTitle)) e.signerTitle = "Required";
    if (!f.consent) e.consent = "Consent is required to continue";
  }
  return e;
}
