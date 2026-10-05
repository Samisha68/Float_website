import type { ComponentType } from "react";
import {
  FaAnchor, FaArrowRight, FaBook, FaBoxArchive, FaBug, FaCircleCheck, FaCode, FaCodeBranch, FaDatabase,
  FaDiagramProject, FaEyeSlash, FaFileCode, FaFileInvoiceDollar, FaFlask, FaHand, FaHandshake, FaIdCard,
  FaKey, FaLink, FaLock, FaMagnifyingGlassDollar, FaMap, FaPenToSquare, FaPlug, FaRankingStar, FaReceipt,
  FaRotate, FaSatelliteDish, FaScaleBalanced, FaServer, FaShieldHalved, FaSignal, FaSliders, FaStairs,
  FaStore, FaTableList, FaUserCheck,
} from "react-icons/fa6";

// The MDX uses Font Awesome class strings ("fa-solid fa-key"). Only these are in use; add to the
// map when a page starts using a new one. Unknown names render nothing rather than breaking the page.
const icons: Record<string, ComponentType<{ "aria-hidden"?: boolean }>> = {
  anchor: FaAnchor, "arrow-right": FaArrowRight, book: FaBook, "box-archive": FaBoxArchive, bug: FaBug,
  "circle-check": FaCircleCheck, code: FaCode, "code-branch": FaCodeBranch, database: FaDatabase,
  "diagram-project": FaDiagramProject, "eye-slash": FaEyeSlash, "file-code": FaFileCode,
  "file-invoice-dollar": FaFileInvoiceDollar, flask: FaFlask, hand: FaHand, handshake: FaHandshake,
  "id-card": FaIdCard, key: FaKey, link: FaLink, lock: FaLock, "magnifying-glass-dollar": FaMagnifyingGlassDollar,
  map: FaMap, "pen-to-square": FaPenToSquare, plug: FaPlug, "ranking-star": FaRankingStar, receipt: FaReceipt,
  rotate: FaRotate, "satellite-dish": FaSatelliteDish, "scale-balanced": FaScaleBalanced, server: FaServer,
  "shield-halved": FaShieldHalved, signal: FaSignal, sliders: FaSliders, stairs: FaStairs, store: FaStore,
  "table-list": FaTableList, "user-check": FaUserCheck,
};

export function Icon({ name }: { name?: string }) {
  const key = name?.split(/\s+/).find((part) => part.startsWith("fa-") && part !== "fa-solid")?.slice(3);
  const Component = key ? icons[key] : undefined;
  return Component ? <span className="icon"><Component aria-hidden /></span> : null;
}
