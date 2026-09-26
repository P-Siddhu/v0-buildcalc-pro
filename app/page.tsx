"use client"

/**
 * BuildCalc Pro — Intelligent Structural Estimator
 * Created by Siddhu Pogula
 *
 * Single-file React application for residential construction estimation
 * for the Indian market. Features the Intelligent Validation Engine (IVE)
 * which surfaces educational reasoning rooted in IS 456, IS 875 & IS 1893.
 */

import * as React from "react"
import {
  Building2,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  Download,
  Ruler,
  Hammer,
  Layers3,
  Banknote,
  HardHat,
  BookOpen,
  Compass,
  Sparkles,
  CheckCircle2,
  Github,
  Linkedin,
  Mail,
  CircleHelp,
  Sun,
  Moon,
  Settings2,
  Smartphone,
  Monitor,
  Home,
  Plus,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Move,
  DoorOpen,
  PanelTop,
  RotateCcw,
  ChevronsUp,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

/* ============================================================================
 *  TYPES & STATE
 * ==========================================================================*/

type Unit = "sqft" | "m2"
type Orientation = "portrait" | "landscape"
type Quality = "standard" | "premium" | "luxury"
type Severity = "error" | "warning" | "info" | "ok"

type Inputs = {
  // Geometry
  plotLength: number // ft
  plotWidth: number // ft
  builtUpArea: number // sqft
  floors: number // including ground (G+0 → 1)
  // Structural
  slabThickness: number // mm
  wallThickness: number // mm (external)
  concreteGrade: "M15" | "M20" | "M25" | "M30" | "M35"
  steelGrade: "Fe415" | "Fe500" | "Fe550"
  // Foundation & site
  soilType: "hard" | "medium" | "soft" | "filled"
  foundationType: "isolated" | "raft" | "pile" | "combined"
  plinthHeight: number // ft
  // Project
  quality: Quality
  // Material rates (₹)
  cementRate: number // per 50kg bag
  steelRate: number // per kg
  sandRate: number // per cuft
  aggregateRate: number // per cuft
  brickRate: number // per piece
  laborRate: number // ₹/sqft (skilled+unskilled bundle)
}

type State = {
  unit: Unit
  orientation: Orientation
  inputs: Inputs
}

type Action =
  | { type: "SET_UNIT"; unit: Unit }
  | { type: "SET_ORIENTATION"; orientation: Orientation }
  | { type: "SET_INPUT"; key: keyof Inputs; value: Inputs[keyof Inputs] }
  | { type: "RESET" }
  | { type: "PRESET"; preset: "budget" | "standard" | "premium" }

const DEFAULT_INPUTS: Inputs = {
  plotLength: 40,
  plotWidth: 30,
  builtUpArea: 1200,
  floors: 2,
  slabThickness: 125,
  wallThickness: 230,
  concreteGrade: "M25",
  steelGrade: "Fe500",
  soilType: "medium",
  foundationType: "isolated",
  plinthHeight: 2,
  quality: "standard",
  cementRate: 420,
  steelRate: 72,
  sandRate: 75,
  aggregateRate: 65,
  brickRate: 9,
  laborRate: 320,
}

const initialState: State = {
  unit: "sqft",
  orientation: "portrait",
  inputs: DEFAULT_INPUTS,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_UNIT":
      return { ...state, unit: action.unit }
    case "SET_ORIENTATION":
      return { ...state, orientation: action.orientation }
    case "SET_INPUT":
      return { ...state, inputs: { ...state.inputs, [action.key]: action.value } }
    case "RESET":
      return { ...state, inputs: DEFAULT_INPUTS }
    case "PRESET": {
      const map: Record<typeof action.preset, Partial<Inputs>> = {
        budget: { quality: "standard", concreteGrade: "M20", steelGrade: "Fe415", slabThickness: 110 },
        standard: { quality: "standard", concreteGrade: "M25", steelGrade: "Fe500", slabThickness: 125 },
        premium: { quality: "premium", concreteGrade: "M30", steelGrade: "Fe500", slabThickness: 150 },
      }
      return { ...state, inputs: { ...state.inputs, ...map[action.preset] } }
    }
    default:
      return state
  }
}

/* ============================================================================
 *  INTELLIGENT VALIDATION ENGINE (IVE)
 *  Each rule returns severity + educational reason rooted in IS Codes.
 * ==========================================================================*/

type ValidationFinding = {
  id: string
  severity: Severity
  field: string
  title: string
  reason: string
  code: string // e.g. "IS 456 : Clause 23.2.1"
}

function runIVE(i: Inputs): ValidationFinding[] {
  const out: ValidationFinding[] = []

  /* ---- SLAB ---- */
  if (i.slabThickness < 100) {
    out.push({
      id: "slab-min",
      severity: "error",
      field: "slabThickness",
      title: "Slab below code minimum",
      reason:
        "IS 456 effectively limits residential one-way / two-way slabs to ≥100 mm to satisfy span/depth ratios, deflection control and minimum cover (20 mm) plus reinforcement. Going below 100 mm risks cracking, deflection failure and inadequate fire resistance.",
      code: "IS 456 : 2000 — Cl. 23.2.1 & 26.4",
    })
  } else if (i.slabThickness > 200) {
    out.push({
      id: "slab-over",
      severity: "warning",
      field: "slabThickness",
      title: "Slab thicker than typical residential",
      reason:
        "Residential RCC slabs typically range 110–175 mm. Beyond 200 mm you add dead load (each extra 25 mm ≈ 60 kg/m²) which cascades into bigger beams, columns and footings. Verify it is actually required by span or transfer-slab conditions.",
      code: "IS 456 : 2000 — Cl. 23 (Deflection)",
    })
  }

  /* ---- FLOORS / HEIGHT ---- */
  if (i.floors > 4) {
    out.push({
      id: "floors-highrise",
      severity: "error",
      field: "floors",
      title: "High-rise threshold exceeded",
      reason:
        "Buildings above G+3 require specialised wind-load analysis (IS 875 Part 3), dynamic seismic analysis and soil–structure interaction (IS 1893). Thumb-rule estimators are not safe past this height — engage a licensed structural consultant.",
      code: "IS 1893 (Part 1) : 2016 — Cl. 7.8 & IS 875 (Part 3)",
    })
  } else if (i.floors === 4) {
    out.push({
      id: "floors-gplus3",
      severity: "warning",
      field: "floors",
      title: "G+3 — wind & seismic checks recommended",
      reason:
        "At G+3 you are at the practical ceiling of equivalent-static design. Confirm seismic zone factor Z, importance factor I and response reduction R, and verify drift limits ≤ 0.004h.",
      code: "IS 1893 (Part 1) : 2016 — Cl. 7.11.1",
    })
  }

  /* ---- BUILT-UP AREA ---- */
  if (i.builtUpArea < 200) {
    out.push({
      id: "area-min",
      severity: "error",
      field: "builtUpArea",
      title: "Area below practical residential minimum",
      reason:
        "A residential footprint under 200 sqft is typically a utility shed, not a habitable dwelling. Bye-laws across most Indian municipalities (NBC 2016) require a minimum carpet of ≈ 9.5 m² (≈ 100 sqft) per habitable room — total dwelling minimums are higher.",
      code: "NBC 2016 — Part 3 (Habitability)",
    })
  } else if (i.builtUpArea > 10000) {
    out.push({
      id: "area-comm",
      severity: "warning",
      field: "builtUpArea",
      title: "Area exceeds residential thumb-rule scope",
      reason:
        "Above 10,000 sqft per floor you cross into mid-scale commercial/institutional design — fire egress (NBC Part 4), staircase widths and structural redundancy rules differ materially. Per-sqft estimation will under-predict.",
      code: "NBC 2016 — Part 4 (Fire & Life Safety)",
    })
  }

  /* ---- WALL ---- */
  if (i.wallThickness < 100) {
    out.push({
      id: "wall-thin",
      severity: "error",
      field: "wallThickness",
      title: "External wall too thin",
      reason:
        "Solid masonry external walls in seismic zones III–V should be ≥ 230 mm. Below 100 mm the wall cannot develop sufficient out-of-plane bending capacity, fire rating or thermal resistance.",
      code: "IS 1905 : 1987 & IS 4326 : 2013",
    })
  } else if (i.wallThickness < 200 && i.floors >= 2) {
    out.push({
      id: "wall-shear",
      severity: "warning",
      field: "wallThickness",
      title: "Consider 230 mm walls for multi-storey",
      reason:
        "For G+1 and above in seismic zones III–V, IS 4326 recommends 230 mm (9-inch) external load-bearing walls or framed RCC with infill. 115 mm half-brick is partition-grade only.",
      code: "IS 4326 : 2013 — Cl. 8.1",
    })
  }

  /* ---- PLOT GEOMETRY ---- */
  const aspectRatio = Math.max(i.plotLength, i.plotWidth) / Math.max(1, Math.min(i.plotLength, i.plotWidth))
  if (aspectRatio > 4) {
    out.push({
      id: "plot-aspect",
      severity: "warning",
      field: "plotLength",
      title: "Plan irregularity (aspect ratio > 4)",
      reason:
        "Long, narrow plans behave torsionally under earthquake loading. IS 1893 flags L/B > 4 as a plan-geometry irregularity requiring expansion joints or 3D dynamic analysis.",
      code: "IS 1893 (Part 1) : 2016 — Table 5",
    })
  }
  if (i.plotLength < 15 || i.plotWidth < 15) {
    out.push({
      id: "plot-narrow",
      severity: "warning",
      field: "plotWidth",
      title: "Plot dimension below practical minimum",
      reason:
        "Plot dimension under 15 ft (≈ 4.5 m) leaves no clearance for setbacks, footings or services. Most municipal bye-laws require minimum setbacks of 3–5 ft on each side.",
      code: "NBC 2016 — Part 3 (Setbacks)",
    })
  }

  /* ---- CONCRETE GRADE ---- */
  if (i.concreteGrade === "M15") {
    out.push({
      id: "grade-low",
      severity: "error",
      field: "concreteGrade",
      title: "M15 not permitted for RCC",
      reason:
        "IS 456 : 2000 mandates M20 as the minimum grade for reinforced concrete in any structural member. M15 is permitted only for plain concrete (PCC) bedding/levelling.",
      code: "IS 456 : 2000 — Table 5",
    })
  } else if (i.concreteGrade === "M20" && i.floors >= 3) {
    out.push({
      id: "grade-upgrade",
      severity: "warning",
      field: "concreteGrade",
      title: "Upgrade to M25 for G+2 and above",
      reason:
        "For severe-exposure conditions and structures over two storeys, IS 456 Table 5 effectively pushes the minimum grade to M25 to control durability, cracking and creep over time.",
      code: "IS 456 : 2000 — Table 5 (Severe Exposure)",
    })
  }

  /* ---- PLINTH ---- */
  if (i.plinthHeight < 1.5) {
    out.push({
      id: "plinth-low",
      severity: "warning",
      field: "plinthHeight",
      title: "Plinth height risks moisture & flooding",
      reason:
        "NBC recommends plinth ≥ 450 mm (1.5 ft) above general ground level. Lower plinth invites capillary rise, vector ingress and monsoon flooding — and breaches NBC Part 9 (Plumbing) gradient requirements.",
      code: "NBC 2016 — Part 9 & Part 3",
    })
  }

  /* ---- FOUNDATION × SOIL ---- */
  if (i.soilType === "soft" && i.foundationType === "isolated" && i.floors >= 2) {
    out.push({
      id: "found-mismatch",
      severity: "error",
      field: "foundationType",
      title: "Isolated footings unsafe on soft soil",
      reason:
        "Soft / loose soils (SBC < 100 kN/m²) settle differentially under isolated footings. For G+1 and above on soft strata, use a raft, combined footings or piles per IS 1904 to distribute loads.",
      code: "IS 1904 : 1986 — Cl. 4.2 & IS 2950",
    })
  }
  if (i.soilType === "filled") {
    out.push({
      id: "found-fill",
      severity: "warning",
      field: "soilType",
      title: "Filled soil — geotech investigation required",
      reason:
        "Filled / made-up ground has unpredictable bearing capacity and is prone to long-term consolidation. A site-specific Plate Load Test or SPT (IS 1888 / IS 2131) is mandatory before final foundation sizing.",
      code: "IS 1888 : 1982 / IS 2131 : 1981",
    })
  }

  /* ---- MATERIAL RATE SANITY ---- */
  if (i.steelRate < 50 || i.steelRate > 150) {
    out.push({
      id: "rate-steel",
      severity: "info",
      field: "steelRate",
      title: "Steel rate looks unusual",
      reason:
        "TMT bar rates in India typically sit between ₹65–95 per kg (Fe500). A rate outside ₹50–150 likely indicates wrong unit or stale data — reverify with the supplier on the day of order.",
      code: "Market Reference",
    })
  }
  if (i.cementRate < 280 || i.cementRate > 600) {
    out.push({
      id: "rate-cement",
      severity: "info",
      field: "cementRate",
      title: "Cement rate looks unusual",
      reason:
        "OPC 53 / PPC 50 kg bags in India typically retail at ₹350–480. Values outside ₹280–600 are atypical — check whether you entered per-bag or per-tonne.",
      code: "Market Reference",
    })
  }

  /* ---- ALL CLEAR ---- */
  if (out.length === 0) {
    out.push({
      id: "ok",
      severity: "ok",
      field: "*",
      title: "All inputs satisfy IS Code thumb-rule checks",
      reason:
        "Your geometry, materials and structural parameters fall within the safe envelope defined by IS 456, IS 875, IS 1893 and NBC 2016 for residential thumb-rule estimation. A licensed structural consultant should still validate the final design.",
      code: "IS 456 / IS 875 / IS 1893 / NBC 2016",
    })
  }

  return out
}

/* ============================================================================
 *  ESTIMATION ENGINE
 *  Indian residential thumb-rule per built-up sqft + adjustments.
 * ==========================================================================*/

type Material = {
  key: string
  label: string
  qty: number
  unit: string
  rate: number
  cost: number
  icon: React.ComponentType<{ className?: string }>
}

type Estimate = {
  totalArea: number // total built-up across floors
  materials: Material[]
  laborCost: number
  contingencyCost: number
  subTotal: number
  total: number
  perSqft: number
  qualityMult: number
  floorMult: number
  carbonKg: number // approx embodied CO₂
}

function computeEstimate(i: Inputs): Estimate {
  const totalArea = i.builtUpArea * Math.max(1, i.floors)

  // Quality multipliers (Indian residential reality)
  const qualityMult =
    i.quality === "luxury" ? 1.6 : i.quality === "premium" ? 1.28 : 1.0

  // Slab-thickness influence: each +25 mm above 125 ≈ +6% concrete materials
  const slabMult = 1 + (i.slabThickness - 125) / 125 * 0.55

  // Concrete-grade influence on cement quantity
  const gradeCementMult: Record<Inputs["concreteGrade"], number> = {
    M15: 0.85,
    M20: 1.0,
    M25: 1.1,
    M30: 1.22,
    M35: 1.32,
  }
  // Steel grade slightly reduces required quantity (higher fy → less steel)
  const steelGradeMult: Record<Inputs["steelGrade"], number> = {
    Fe415: 1.08,
    Fe500: 1.0,
    Fe550: 0.94,
  }

  // Floor multiplier — extra columns/footings per added floor
  const floorMult = 1 + (Math.max(1, i.floors) - 1) * 0.04

  // Per-sqft thumb rules (residential RCC, Indian practice)
  const cementBags = totalArea * 0.4 * gradeCementMult[i.concreteGrade] * slabMult * floorMult
  const steelKg = totalArea * (i.quality === "luxury" ? 5 : i.quality === "premium" ? 4.5 : 4) *
    steelGradeMult[i.steelGrade] * slabMult * floorMult
  const sandCuft = totalArea * 0.82 * slabMult
  const aggregateCuft = totalArea * 1.34 * slabMult
  const bricks =
    totalArea *
    (i.wallThickness >= 230 ? 8 : i.wallThickness >= 150 ? 6 : 4.5) *
    (1 + (Math.max(1, i.floors) - 1) * 0.02)

  // Foundation premium
  const foundationFactor: Record<Inputs["foundationType"], number> = {
    isolated: 1.0,
    combined: 1.08,
    raft: 1.18,
    pile: 1.32,
  }
  const foundationCost =
    totalArea * 110 * foundationFactor[i.foundationType] *
    (i.soilType === "soft" ? 1.2 : i.soilType === "filled" ? 1.3 : i.soilType === "hard" ? 0.92 : 1.0)

  // Finishes scale strongly with quality
  const finishesPerSqft =
    i.quality === "luxury" ? 850 : i.quality === "premium" ? 540 : 320
  const finishesCost = totalArea * finishesPerSqft

  // Plumbing + electrical bundle
  const mepPerSqft =
    i.quality === "luxury" ? 380 : i.quality === "premium" ? 260 : 180
  const mepCost = totalArea * mepPerSqft

  const materials: Material[] = [
    {
      key: "cement",
      label: "Cement (OPC/PPC)",
      qty: Math.round(cementBags),
      unit: "bags (50 kg)",
      rate: i.cementRate,
      cost: cementBags * i.cementRate,
      icon: Layers3,
    },
    {
      key: "steel",
      label: `TMT Steel ${i.steelGrade}`,
      qty: Math.round(steelKg),
      unit: "kg",
      rate: i.steelRate,
      cost: steelKg * i.steelRate,
      icon: Hammer,
    },
    {
      key: "sand",
      label: "River / M-Sand",
      qty: Math.round(sandCuft),
      unit: "cuft",
      rate: i.sandRate,
      cost: sandCuft * i.sandRate,
      icon: Ruler,
    },
    {
      key: "aggregate",
      label: "Coarse Aggregate (20 mm)",
      qty: Math.round(aggregateCuft),
      unit: "cuft",
      rate: i.aggregateRate,
      cost: aggregateCuft * i.aggregateRate,
      icon: Layers3,
    },
    {
      key: "bricks",
      label: "Burnt Clay / AAC Bricks",
      qty: Math.round(bricks),
      unit: "pieces",
      rate: i.brickRate,
      cost: bricks * i.brickRate,
      icon: Building2,
    },
    {
      key: "finishes",
      label: "Finishes (tiles, paint, doors)",
      qty: totalArea,
      unit: "sqft",
      rate: finishesPerSqft,
      cost: finishesCost,
      icon: Sparkles,
    },
    {
      key: "mep",
      label: "Plumbing + Electrical",
      qty: totalArea,
      unit: "sqft",
      rate: mepPerSqft,
      cost: mepCost,
      icon: HardHat,
    },
    {
      key: "foundation",
      label: `Foundation (${i.foundationType})`,
      qty: i.builtUpArea,
      unit: "sqft (footprint)",
      rate: Math.round(foundationCost / i.builtUpArea),
      cost: foundationCost,
      icon: Compass,
    },
  ]

  const materialCost = materials.reduce((s, m) => s + m.cost, 0)
  const laborCost = totalArea * i.laborRate * qualityMult
  const subTotal = materialCost + laborCost
  const contingencyCost = subTotal * 0.05 // 5% contingency
  const total = subTotal + contingencyCost
  const perSqft = total / totalArea

  // Embodied carbon (approx): cement ≈ 410 kg CO₂/bag, steel ≈ 1.85 kg/kg, brick ≈ 0.24 kg
  const carbonKg = cementBags * 41 + steelKg * 1.85 + bricks * 0.24

  return {
    totalArea,
    materials,
    laborCost,
    contingencyCost,
    subTotal,
    total,
    perSqft,
    qualityMult,
    floorMult,
    carbonKg,
  }
}

/* ============================================================================
 *  HELPERS
 * ==========================================================================*/

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n))

const fmtNum = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n))

const sqftToM2 = (n: number) => n * 0.092903
const ftToM = (n: number) => n * 0.3048

const CHART_COLORS = ["#22d3ee", "#38bdf8", "#0ea5e9", "#06b6d4", "#67e8f9", "#7dd3fc", "#a5f3fc", "#bae6fd"]

/* ============================================================================
 *  THEME HOOK — light / dark with localStorage persistence
 * ==========================================================================*/

type Theme = "light" | "dark"

function useTheme(): [Theme, (t: Theme) => void, () => void] {
  const [theme, setThemeState] = React.useState<Theme>("dark")

  // Read the active theme from <html> on mount (set by no-flash inline script)
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setThemeState(isDark ? "dark" : "light")
  }, [])

  const apply = React.useCallback((t: Theme) => {
    if (t === "dark") document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
    try {
      localStorage.setItem("buildcalc-theme", t)
    } catch {
      /* ignore */
    }
    setThemeState(t)
  }, [])

  const toggle = React.useCallback(() => {
    apply(theme === "dark" ? "light" : "dark")
  }, [apply, theme])

  return [theme, apply, toggle]
}

/* ============================================================================
 *  COMPONENT
 * ==========================================================================*/

export default function Page() {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const { unit, orientation, inputs } = state
  const [theme, , toggleTheme] = useTheme()

  const findings = React.useMemo(() => runIVE(inputs), [inputs])
  const estimate = React.useMemo(() => computeEstimate(inputs), [inputs])

  const errorCount = findings.filter((f) => f.severity === "error").length
  const warnCount = findings.filter((f) => f.severity === "warning").length
  const isCompliant = errorCount === 0

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    dispatch({ type: "SET_INPUT", key, value: value as Inputs[keyof Inputs] })

  const handleExportPDF = React.useCallback(async () => {
    const [{ default: jsPDF }, autoTableMod] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ])
    const autoTable = (autoTableMod as { default: typeof import("jspdf-autotable").default }).default

    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: orientation === "landscape" ? "l" : "p" })
    const pageW = doc.internal.pageSize.getWidth()

    // Header band
    doc.setFillColor(2, 6, 23)
    doc.rect(0, 0, pageW, 70, "F")
    doc.setTextColor(34, 211, 238)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("BuildCalc Pro", 40, 35)
    doc.setTextColor(226, 232, 240)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Intelligent Structural Estimator — IS 456 / IS 875 / IS 1893", 40, 52)
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(9)
    doc.text("Created by Siddhu Pogula", pageW - 40, 35, { align: "right" })
    doc.text(new Date().toLocaleDateString("en-IN", { dateStyle: "long" }), pageW - 40, 52, {
      align: "right",
    })

    // Project summary
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.text("Project Summary", 40, 100)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    const summary = [
      ["Built-up Area", `${fmtNum(inputs.builtUpArea)} sqft × ${inputs.floors} floor(s) = ${fmtNum(estimate.totalArea)} sqft`],
      ["Plot Size", `${inputs.plotLength} × ${inputs.plotWidth} ft`],
      ["Concrete / Steel", `${inputs.concreteGrade} / ${inputs.steelGrade}`],
      ["Foundation / Soil", `${inputs.foundationType} on ${inputs.soilType} soil`],
      ["Quality Tier", inputs.quality.toUpperCase()],
      ["IS Code Compliance", isCompliant ? "PASS" : `FAIL — ${errorCount} blocking issue(s)`],
    ]
    autoTable(doc, {
      startY: 110,
      head: [["Parameter", "Value"]],
      body: summary,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    })

    // Materials
    autoTable(doc, {
      // @ts-expect-error - jspdf-autotable adds lastAutoTable
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Material", "Quantity", "Unit", "Rate (₹)", "Cost (₹)"]],
      body: estimate.materials.map((m) => [
        m.label,
        fmtNum(m.qty),
        m.unit,
        fmtNum(m.rate),
        fmtNum(m.cost),
      ]),
      theme: "striped",
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 9 },
    })

    // Cost summary
    autoTable(doc, {
      // @ts-expect-error - jspdf-autotable adds lastAutoTable
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Cost Component", "Amount"]],
      body: [
        ["Material Subtotal", fmtINR(estimate.subTotal - estimate.laborCost)],
        ["Labor", fmtINR(estimate.laborCost)],
        ["Contingency (5%)", fmtINR(estimate.contingencyCost)],
        ["TOTAL", fmtINR(estimate.total)],
        ["Cost / sqft", fmtINR(estimate.perSqft)],
      ],
      theme: "grid",
      headStyles: { fillColor: [34, 211, 238], textColor: [15, 23, 42] },
      styles: { fontSize: 10 },
    })

    // Findings
    if (findings.length) {
      autoTable(doc, {
        // @ts-expect-error - jspdf-autotable adds lastAutoTable
        startY: doc.lastAutoTable.finalY + 16,
        head: [["Severity", "Finding", "IS Code Reference"]],
        body: findings.map((f) => [f.severity.toUpperCase(), `${f.title} — ${f.reason}`, f.code]),
        theme: "grid",
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 8, cellPadding: 6 },
        columnStyles: { 1: { cellWidth: 320 } },
      })
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p)
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text(
        `BuildCalc Pro — Created by Siddhu Pogula  •  Page ${p} of ${pageCount}  •  Estimates are indicative; final design must be certified by a licensed structural engineer.`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: "center" },
      )
    }

    doc.save(`BuildCalc-Pro_${inputs.builtUpArea}sqft_${Date.now()}.pdf`)
  }, [inputs, estimate, findings, isCompliant, errorCount, orientation])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen text-foreground">
        <Navbar
          unit={unit}
          orientation={orientation}
          theme={theme}
          onUnit={(u) => dispatch({ type: "SET_UNIT", unit: u })}
          onOrientation={(o) => dispatch({ type: "SET_ORIENTATION", orientation: o })}
          onToggleTheme={toggleTheme}
          onExport={handleExportPDF}
          isCompliant={isCompliant}
        />

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
          <Hero
            estimate={estimate}
            isCompliant={isCompliant}
            errorCount={errorCount}
            warnCount={warnCount}
            onPreset={(p) => dispatch({ type: "PRESET", preset: p })}
            onReset={() => dispatch({ type: "RESET" })}
          />

          <HousePlanner
            plotLength={inputs.plotLength}
            plotWidth={inputs.plotWidth}
            builtUpArea={inputs.builtUpArea}
            onBuiltUpAreaChange={(area) => set("builtUpArea", area)}
          />

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* INPUT COLUMN */}
            <div className="lg:col-span-3">
              <InputPanel inputs={inputs} unit={unit} set={set} findings={findings} />
            </div>
            {/* RESULTS COLUMN */}
            <div className="lg:col-span-2">
              <ResultsPanel estimate={estimate} findings={findings} onExport={handleExportPDF} />
            </div>
          </div>

          <DetailedBreakdown estimate={estimate} unit={unit} />

          <ComplianceLog findings={findings} />
        </main>

        <Footer />
      </div>
    </TooltipProvider>
  )
}

/* ============================================================================
 *  HOUSE PLANNER + 2D FLOOR PLAN
 * ==========================================================================*/

type PlannerRoom = {
  id: string
  name: string
  preset: string
  length: number
  width: number
  unit: "ft" | "m"
  door: number
  windows: number
  notes: string
  x: number
  y: number
}

type PlannerFloor = "ground" | "first" | "second"

const ROOM_PRESETS = [
  "Living / Hall", "Master Bedroom", "Bedroom", "Kitchen", "Dining", "Bathroom", "Toilet",
  "Pooja Room", "Utility", "Store Room", "Balcony", "Staircase", "Parking", "Custom Room",
]

const initialPlannerRooms: PlannerRoom[] = [
  { id: "living", name: "Living / Hall", preset: "Living / Hall", length: 16, width: 12, unit: "ft", door: 1, windows: 2, notes: "Main family gathering space", x: 4, y: 4 },
  { id: "kitchen", name: "Kitchen", preset: "Kitchen", length: 10, width: 8, unit: "ft", door: 1, windows: 1, notes: "Provide exhaust and service access", x: 22, y: 4 },
  { id: "master", name: "Master Bedroom", preset: "Master Bedroom", length: 14, width: 12, unit: "ft", door: 1, windows: 2, notes: "", x: 4, y: 18 },
  { id: "bath", name: "Bathroom", preset: "Bathroom", length: 7, width: 5, unit: "ft", door: 1, windows: 1, notes: "Wet area", x: 22, y: 18 },
]

function roomArea(room: PlannerRoom) {
  const factor = room.unit === "m" ? 10.7639 : 1
  return room.length * room.width * factor
}

function HousePlanner({
  plotLength,
  plotWidth,
  builtUpArea,
  onBuiltUpAreaChange,
}: {
  plotLength: number
  plotWidth: number
  builtUpArea: number
  onBuiltUpAreaChange: (area: number) => void
}) {
  const [floor, setFloor] = React.useState<PlannerFloor>("ground")
  const [plannerPlotLength, setPlannerPlotLength] = React.useState(plotLength)
  const [plannerPlotWidth, setPlannerPlotWidth] = React.useState(plotWidth)
  const [plotUnit, setPlotUnit] = React.useState<"ft" | "m">("ft")
  const [plotOrientation, setPlotOrientation] = React.useState("North")
  const [floors, setFloors] = React.useState("Ground")
  const [setbacks, setSetbacks] = React.useState({ front: 5, rear: 3, left: 3, right: 3 })
  const [roomsByFloor, setRoomsByFloor] = React.useState<Record<PlannerFloor, PlannerRoom[]>>({
    ground: initialPlannerRooms,
    first: [],
    second: [],
  })
  const [selectedId, setSelectedId] = React.useState("living")
  const [zoom, setZoom] = React.useState(1)
  const [history, setHistory] = React.useState<PlannerRoom[][]>([])
  const [future, setFuture] = React.useState<PlannerRoom[][]>([])
  const [drag, setDrag] = React.useState<{ id: string; x: number; y: number; px: number; py: number } | null>(null)

  const rooms = roomsByFloor[floor]
  const selected = rooms.find((room) => room.id === selectedId) ?? rooms[0]
  const plotArea = plannerPlotLength * plannerPlotWidth
  const totalRoomArea = rooms.reduce((sum, room) => sum + roomArea(room), 0)
  const totalBuiltUp = Object.values(roomsByFloor).reduce((sum, floorRooms) => sum + floorRooms.reduce((s, room) => s + roomArea(room), 0), 0)
  const remainingPlot = Math.max(0, plotArea - totalRoomArea)

  React.useEffect(() => {
    if (totalBuiltUp > 0 && Math.round(totalBuiltUp) !== Math.round(builtUpArea)) onBuiltUpAreaChange(Math.round(totalBuiltUp))
  }, [totalBuiltUp, builtUpArea])

  const updateRooms = (next: PlannerRoom[], record = true) => {
    if (record) {
      setHistory((stack) => [...stack.slice(-19), rooms])
      setFuture([])
    }
    setRoomsByFloor((all) => ({ ...all, [floor]: next }))
  }

  const updateSelected = (patch: Partial<PlannerRoom>) => {
    if (!selected) return
    updateRooms(rooms.map((room) => room.id === selected.id ? { ...room, ...patch } : room))
  }

  const addRoom = () => {
    const id = `room-${Date.now()}`
    const next: PlannerRoom = { id, name: "Bedroom", preset: "Bedroom", length: 10, width: 10, unit: "ft", door: 1, windows: 2, notes: "", x: 8, y: 8 }
    updateRooms([...rooms, next])
    setSelectedId(id)
  }

  const duplicateRoom = () => {
    if (!selected) return
    const id = `room-${Date.now()}`
    updateRooms([...rooms, { ...selected, id, name: `${selected.name} Copy`, x: selected.x + 3, y: selected.y + 3 }])
    setSelectedId(id)
  }

  const deleteRoom = () => {
    if (!selected) return
    updateRooms(rooms.filter((room) => room.id !== selected.id))
    setSelectedId(rooms.find((room) => room.id !== selected.id)?.id ?? "")
  }

  const undo = () => {
    const previous = history.at(-1)
    if (!previous) return
    setFuture((stack) => [...stack, rooms])
    setHistory((stack) => stack.slice(0, -1))
    updateRooms(previous, false)
  }

  const redo = () => {
    const next = future.at(-1)
    if (!next) return
    setHistory((stack) => [...stack, rooms])
    setFuture((stack) => stack.slice(0, -1))
    updateRooms(next, false)
  }

  const onRoomPointerDown = (event: React.PointerEvent, room: PlannerRoom) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedId(room.id)
    setDrag({ id: room.id, x: room.x, y: room.y, px: event.clientX, py: event.clientY })
  }

  const onRoomPointerMove = (event: React.PointerEvent) => {
    if (!drag) return
    const dx = (event.clientX - drag.px) / (8 * zoom)
    const dy = (event.clientY - drag.py) / (8 * zoom)
    setRoomsByFloor((all) => ({ ...all, [floor]: rooms.map((room) => room.id === drag.id ? { ...room, x: Math.max(1, drag.x + dx), y: Math.max(1, drag.y + dy) } : room) }))
  }

  const finishDrag = () => {
    if (!drag) return
    setHistory((stack) => [...stack.slice(-19), rooms])
    setFuture([])
    setDrag(null)
  }

  const floorButtons: { id: PlannerFloor; label: string }[] = [
    { id: "ground", label: "GROUND FLOOR" }, { id: "first", label: "FIRST FLOOR" }, { id: "second", label: "SECOND FLOOR" },
  ]

  return (
    <section className="mt-10 rounded-3xl glass p-4 sm:p-6" id="house-planner">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300"><Home className="size-5" /><span className="font-mono text-xs uppercase tracking-[0.2em]">House Planner</span></div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Plan rooms. See quantities. Estimate with confidence.</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">A preliminary architectural planning surface. Generated layouts are not construction drawings and require professional review.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground"><Move className="size-3.5" /> Drag rooms on canvas · scroll to zoom</div>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-border/70 bg-background/40 p-4 md:grid-cols-2 xl:grid-cols-6">
        <PlannerNumber label="Plot length" value={plannerPlotLength} onChange={setPlannerPlotLength} suffix={plotUnit} />
        <PlannerNumber label="Plot width" value={plannerPlotWidth} onChange={setPlannerPlotWidth} suffix={plotUnit} />
        <PlannerSelect label="Plot unit" value={plotUnit} options={["ft", "m"]} onChange={(v) => setPlotUnit(v as "ft" | "m")} />
        <PlannerSelect label="North / entry" value={plotOrientation} options={["North", "South", "East", "West"]} onChange={setPlotOrientation} />
        <PlannerSelect label="Floors" value={floors} options={["Ground", "G+1", "G+2"]} onChange={setFloors} />
        <div className="flex items-end"><Badge variant="secondary" className="h-9 w-full justify-center">{plotArea.toLocaleString()} {plotUnit === "ft" ? "sqft" : "m²"} plot</Badge></div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-border/70 pb-3">
        {floorButtons.map((item) => <Button key={item.id} size="sm" variant={floor === item.id ? "default" : "outline"} onClick={() => { setFloor(item.id); setSelectedId(roomsByFloor[item.id][0]?.id ?? "") }}>{item.label}<Badge variant="secondary" className="ml-1">{roomsByFloor[item.id].length}</Badge></Button>)}
        <div className="ml-auto flex items-center gap-1"><Button size="icon" variant="ghost" onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 /></Button><Button size="icon" variant="ghost" onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 /></Button><Button size="icon" variant="ghost" onClick={() => setZoom((value) => Math.min(1.8, value + 0.15))} aria-label="Zoom in"><ZoomIn /></Button><Button size="icon" variant="ghost" onClick={() => setZoom((value) => Math.max(0.65, value - 0.15))} aria-label="Zoom out"><ZoomOut /></Button><Button size="icon" variant="ghost" onClick={() => setZoom(1)} aria-label="Reset zoom"><RotateCcw /></Button></div>
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-slate-100/80 p-2 dark:bg-slate-950/70">
          <svg viewBox="0 0 100 70" className="h-[420px] w-full touch-none" role="img" aria-label={`${floor} floor interactive plan`} style={{ transform: `scale(${zoom})`, transformOrigin: "center" }} onPointerMove={onRoomPointerMove} onPointerUp={finishDrag}>
            <defs><pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.12" opacity="0.3" /></pattern></defs>
            <rect x="0" y="0" width="100" height="70" fill="url(#grid)" className="text-slate-400 dark:text-slate-600" />
            <rect x="2" y="2" width="96" height="66" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 1" className="text-cyan-600 dark:text-cyan-400" />
            <rect x={2 + setbacks.left / Math.max(plannerPlotLength, 1) * 96} y={2 + setbacks.front / Math.max(plotWidth, 1) * 66} width={96 - (setbacks.left + setbacks.right) / Math.max(plannerPlotLength, 1) * 96} height={66 - (setbacks.front + setbacks.rear) / Math.max(plotWidth, 1) * 66} fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" className="text-amber-500" />
            <text x="5" y="7" fontSize="2.8" className="fill-slate-600 dark:fill-slate-300">N ↑</text>
            <text x="50" y="67" textAnchor="middle" fontSize="2" className="fill-slate-500">Setback envelope · {plotOrientation} facing</text>
            {rooms.map((room) => { const w = Math.max(8, room.length / Math.max(plannerPlotLength, 1) * 96); const h = Math.max(7, room.width / Math.max(plotWidth, 1) * 66); const active = selected?.id === room.id; return <g key={room.id} transform={`translate(${room.x} ${room.y})`} onPointerDown={(event) => onRoomPointerDown(event, room)} className="cursor-move"><rect width={w} height={h} rx="0.8" fill={active ? "#0891b2" : "#334155"} fillOpacity="0.88" stroke={active ? "#67e8f9" : "#94a3b8"} strokeWidth={active ? "0.6" : "0.35"} /><text x={w / 2} y={h / 2 - 1} textAnchor="middle" fontSize="2.5" fill="white" pointerEvents="none">{room.name.slice(0, 16)}</text><text x={w / 2} y={h / 2 + 3} textAnchor="middle" fontSize="2" fill="#bae6fd" pointerEvents="none">{Math.round(roomArea(room))} sqft</text>{room.door > 0 && <path d={`M ${w / 2 - 2} 0 Q ${w / 2} 3 ${w / 2 + 2} 0`} fill="none" stroke="#fbbf24" strokeWidth="0.45" />}{room.windows > 0 && <path d={`M 2 ${h} L ${Math.min(w - 2, 2 + room.windows * 2)} ${h}`} stroke="#67e8f9" strokeWidth="1" />}</g> })}
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Rooms</h3><Button size="sm" onClick={addRoom}><Plus data-icon="inline-start" /> Add room</Button></div>
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">{rooms.map((room) => <button key={room.id} onClick={() => setSelectedId(room.id)} className={cn("flex items-center justify-between rounded-xl border p-3 text-left transition", selected?.id === room.id ? "border-cyan-400/60 bg-cyan-400/10" : "border-border/70 bg-background/40 hover:bg-muted")}><span className="min-w-0"><span className="block truncate text-sm font-medium">{room.name}</span><span className="text-xs text-muted-foreground">{room.length} × {room.width} {room.unit} · {Math.round(roomArea(room))} sqft</span></span><DoorOpen className="size-4 shrink-0 text-cyan-600 dark:text-cyan-400" /></button>)}</div>
          {selected ? <div className="rounded-2xl border border-border/70 bg-background/40 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Edit room</span><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={duplicateRoom} aria-label="Duplicate room"><Copy /></Button><Button size="icon" variant="ghost" onClick={deleteRoom} aria-label="Delete room"><Trash2 /></Button></div></div><div className="grid gap-3"><PlannerText label="Room name" value={selected.name} onChange={(value) => updateSelected({ name: value })} /><div className="grid grid-cols-2 gap-2"><PlannerNumber label="Length" value={selected.length} suffix={selected.unit} onChange={(value) => updateSelected({ length: Math.max(1, value) })} /><PlannerNumber label="Width" value={selected.width} suffix={selected.unit} onChange={(value) => updateSelected({ width: Math.max(1, value) })} /></div><PlannerSelect label="Preset" value={selected.preset} options={ROOM_PRESETS} onChange={(value) => updateSelected({ preset: value, name: value === "Custom Room" ? selected.name : value })} /><div className="grid grid-cols-2 gap-2"><PlannerNumber label="Doors" value={selected.door} onChange={(value) => updateSelected({ door: Math.max(0, value) })} /><PlannerNumber label="Windows" value={selected.windows} onChange={(value) => updateSelected({ windows: Math.max(0, value) })} /></div><PlannerText label="Notes" value={selected.notes} onChange={(value) => updateSelected({ notes: value })} /><div className="rounded-lg bg-cyan-500/10 p-2 text-xs text-cyan-800 dark:text-cyan-200">Room area: <strong>{Math.round(roomArea(selected))} sqft</strong> · preliminary</div></div></div> : <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">Add a room to begin this floor.</div>}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><PlannerMetric label="Total room area" value={`${Math.round(totalRoomArea).toLocaleString()} sqft`} /><PlannerMetric label="Total built-up area" value={`${Math.round(totalBuiltUp).toLocaleString()} sqft`} /><PlannerMetric label="Remaining plot area" value={`${Math.round(remainingPlot).toLocaleString()} sqft`} /><PlannerMetric label="Estimation sync" value={`${Math.round(builtUpArea).toLocaleString()} sqft`} /></div>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground"><span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-700 dark:text-cyan-300">1 Project setup</span><span>→</span><span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-700 dark:text-cyan-300">2 Rooms</span><span>→</span><span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-700 dark:text-cyan-300">3 Floor plan</span><span>→</span><span className="rounded-full bg-muted px-3 py-1">4 Quantities</span><span>→</span><span className="rounded-full bg-muted px-3 py-1">5 Estimate</span></div>
    </section>
  )
}

function PlannerNumber({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  return <div className="flex flex-col gap-1"><Label className="text-xs text-muted-foreground">{label}</Label><div className="relative"><Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-9 pr-10" /><span className="pointer-events-none absolute right-2 top-2 text-xs text-muted-foreground">{suffix}</span></div></div>
}

function PlannerText({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="flex flex-col gap-1"><Label className="text-xs text-muted-foreground">{label}</Label><Input value={value} onChange={(event) => onChange(event.target.value)} className="h-9" /></div>
}

function PlannerSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="flex flex-col gap-1"><Label className="text-xs text-muted-foreground">{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>
}

function PlannerMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border/70 bg-background/40 p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 font-mono text-sm font-semibold">{value}</div></div>
}

/* ============================================================================
 *  NAVBAR
 * ==========================================================================*/

function Navbar({
  unit,
  orientation,
  theme,
  onUnit,
  onOrientation,
  onToggleTheme,
  onExport,
  isCompliant,
}: {
  unit: Unit
  orientation: Orientation
  theme: Theme
  onUnit: (u: Unit) => void
  onOrientation: (o: Orientation) => void
  onToggleTheme: () => void
  onExport: () => void
  isCompliant: boolean
}) {
  const segBase = "rounded-full px-3 py-1 text-xs font-medium transition"
  const segActive = "bg-cyan-500/15 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300"
  const segInactive = "text-muted-foreground hover:text-foreground"

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* BRAND */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950 neon-glow">
            <Building2 className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-mono text-sm font-semibold tracking-tight">
              BuildCalc <span className="neon-text">Pro</span>
            </span>
            <span className="hidden truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Created by Siddhu Pogula
            </span>
          </div>
        </div>

        {/* DESKTOP CONTROLS */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Unit toggle — md+ */}
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/60 p-1 dark:border-white/10 dark:bg-white/[0.03] md:flex">
            <button onClick={() => onUnit("sqft")} className={cn(segBase, unit === "sqft" ? segActive : segInactive)}>
              sqft
            </button>
            <button onClick={() => onUnit("m2")} className={cn(segBase, unit === "m2" ? segActive : segInactive)}>
              m²
            </button>
          </div>

          {/* Orientation toggle — lg+ */}
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/60 p-1 dark:border-white/10 dark:bg-white/[0.03] lg:flex">
            <button
              onClick={() => onOrientation("portrait")}
              className={cn(segBase, orientation === "portrait" ? segActive : segInactive)}
            >
              <Smartphone className="mr-1 inline h-3 w-3" />
              Portrait
            </button>
            <button
              onClick={() => onOrientation("landscape")}
              className={cn(segBase, orientation === "landscape" ? segActive : segInactive)}
            >
              <Monitor className="mr-1 inline h-3 w-3" />
              Landscape
            </button>
          </div>

          {/* Compliance badge — sm+ */}
          <Badge
            variant="outline"
            className={cn(
              "hidden border-slate-200 bg-white/60 font-mono text-[10px] dark:border-white/10 dark:bg-white/[0.03] sm:flex",
              isCompliant
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-amber-700 dark:text-amber-300",
            )}
          >
            <span
              className={cn(
                "mr-1.5 h-1.5 w-1.5 rounded-full",
                isCompliant ? "bg-emerald-500 dark:bg-emerald-400" : "bg-amber-500 dark:bg-amber-400",
              )}
            />
            {isCompliant ? "IS-CODE OK" : "REVIEW"}
          </Badge>

          {/* Theme toggle — always visible */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="h-9 w-9 shrink-0 border-slate-200 bg-white/60 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              >
                <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
            </TooltipContent>
          </Tooltip>

          {/* Mobile settings — visible below lg */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Settings"
                  className="h-9 w-9 shrink-0 border-slate-200 bg-white/60 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  Units
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={unit} onValueChange={(v) => onUnit(v as Unit)}>
                  <DropdownMenuRadioItem value="sqft">Square Feet (sqft)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="m2">Square Metres (m²)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  PDF Orientation
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={orientation}
                  onValueChange={(v) => onOrientation(v as Orientation)}
                >
                  <DropdownMenuRadioItem value="portrait">
                    <Smartphone className="mr-2 h-3.5 w-3.5" /> Portrait
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="landscape">
                    <Monitor className="mr-2 h-3.5 w-3.5" /> Landscape
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="opacity-100">
                  <span className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isCompliant ? "bg-emerald-500" : "bg-amber-500",
                      )}
                    />
                    {isCompliant ? "IS-Code: All Clear" : "IS-Code: Review Needed"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Export — primary CTA */}
          <Button
            size="sm"
            onClick={onExport}
            className="shrink-0 bg-gradient-to-r from-cyan-500 to-sky-600 text-white hover:from-cyan-400 hover:to-sky-500 dark:from-cyan-400 dark:to-sky-500 dark:text-slate-950 dark:hover:from-cyan-300 dark:hover:to-sky-400 neon-glow"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

/* ============================================================================
 *  HERO
 * ==========================================================================*/

function Hero({
  estimate,
  isCompliant,
  errorCount,
  warnCount,
  onPreset,
  onReset,
}: {
  estimate: Estimate
  isCompliant: boolean
  errorCount: number
  warnCount: number
  onPreset: (p: "budget" | "standard" | "premium") => void
  onReset: () => void
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative grid items-end gap-8 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="font-mono uppercase tracking-[0.2em] text-cyan-300">India · 2026</span>
          </div>

          <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Intelligent Structural <span className="neon-text">Estimator</span> for Indian residential builds.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            A safety-first calculator with an embedded reasoning engine. Every input is checked against{" "}
            <span className="font-medium text-foreground">IS 456</span>,{" "}
            <span className="font-medium text-foreground">IS 875</span>,{" "}
            <span className="font-medium text-foreground">IS 1893</span> and{" "}
            <span className="font-medium text-foreground">NBC 2016</span> — and we explain the engineering{" "}
            <em>why</em>.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button variant="outline" className="border-white/10 bg-white/[0.03]" onClick={() => onPreset("budget")}>
              Budget Preset
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/[0.03]" onClick={() => onPreset("standard")}>
              Standard Preset
            </Button>
            <Button variant="outline" className="border-white/10 bg-white/[0.03]" onClick={() => onPreset("premium")}>
              Premium Preset
            </Button>
            <Button variant="ghost" onClick={onReset} className="text-muted-foreground hover:text-foreground">
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2">
          <StatCard
            icon={Banknote}
            label="Estimated Cost"
            value={fmtINR(estimate.total)}
            sub={`${fmtINR(estimate.perSqft)} / sqft`}
            accent
          />
          <StatCard
            icon={Layers3}
            label="Total Area"
            value={`${fmtNum(estimate.totalArea)} sqft`}
            sub={`${fmtNum(sqftToM2(estimate.totalArea))} m²`}
          />
          <StatCard
            icon={ShieldCheck}
            label="IS Code Status"
            value={isCompliant ? "Pass" : "Review"}
            sub={`${errorCount} error · ${warnCount} warning`}
            tone={isCompliant ? "ok" : errorCount ? "error" : "warning"}
          />
          <StatCard
            icon={Sparkles}
            label="Embodied CO₂"
            value={`${fmtNum(estimate.carbonKg / 1000)} t`}
            sub="approx. cradle-to-gate"
          />
        </div>
      </div>
    </section>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  accent?: boolean
  tone?: "ok" | "error" | "warning"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 backdrop-blur-md",
        accent
          ? "border-cyan-400/40 bg-cyan-400/[0.06] neon-border"
          : "border-white/10 bg-white/[0.03]",
      )}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-xl font-semibold tracking-tight sm:text-2xl",
          tone === "ok" && "text-emerald-300",
          tone === "error" && "text-rose-300",
          tone === "warning" && "text-amber-300",
          accent && "neon-text",
        )}
      >
        {value}
      </div>
      {sub ? <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  )
}

/* ============================================================================
 *  INPUT PANEL
 * ==========================================================================*/

function InputPanel({
  inputs,
  unit,
  set,
  findings,
}: {
  inputs: Inputs
  unit: Unit
  set: <K extends keyof Inputs>(k: K, v: Inputs[K]) => void
  findings: ValidationFinding[]
}) {
  const findingFor = (field: keyof Inputs) => findings.find((f) => f.field === field)

  return (
    <div className="rounded-3xl glass p-1">
      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-slate-100/70 p-1 dark:bg-white/[0.03]">
          <TabsTrigger
            value="project"
            className="gap-1.5 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-700 dark:data-[state=active]:bg-cyan-400/15 dark:data-[state=active]:text-cyan-200"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Project</span>
          </TabsTrigger>
          <TabsTrigger
            value="structure"
            className="gap-1.5 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-700 dark:data-[state=active]:bg-cyan-400/15 dark:data-[state=active]:text-cyan-200"
          >
            <Layers3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Structure</span>
          </TabsTrigger>
          <TabsTrigger
            value="foundation"
            className="gap-1.5 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-700 dark:data-[state=active]:bg-cyan-400/15 dark:data-[state=active]:text-cyan-200"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Foundation</span>
          </TabsTrigger>
          <TabsTrigger
            value="rates"
            className="gap-1.5 data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-700 dark:data-[state=active]:bg-cyan-400/15 dark:data-[state=active]:text-cyan-200"
          >
            <Banknote className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Rates</span>
          </TabsTrigger>
        </TabsList>

        {/* PROJECT */}
        <TabsContent value="project" className="m-0 p-6">
          <SectionHeader
            title="Project Basics"
            desc="Plot footprint and built-up envelope."
            code="NBC 2016 — Part 3"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              label={`Plot Length (${unit === "sqft" ? "ft" : "m"})`}
              value={unit === "sqft" ? inputs.plotLength : +ftToM(inputs.plotLength).toFixed(2)}
              onChange={(v) => set("plotLength", unit === "sqft" ? v : v / 0.3048)}
              min={0}
              step={1}
              finding={findingFor("plotLength")}
              hint="Front-to-back dimension"
            />
            <NumberField
              label={`Plot Width (${unit === "sqft" ? "ft" : "m"})`}
              value={unit === "sqft" ? inputs.plotWidth : +ftToM(inputs.plotWidth).toFixed(2)}
              onChange={(v) => set("plotWidth", unit === "sqft" ? v : v / 0.3048)}
              min={0}
              step={1}
              finding={findingFor("plotWidth")}
              hint="Side-to-side dimension"
            />
            <NumberField
              label={`Built-up Area / floor (${unit === "sqft" ? "sqft" : "m²"})`}
              value={unit === "sqft" ? inputs.builtUpArea : +sqftToM2(inputs.builtUpArea).toFixed(1)}
              onChange={(v) => set("builtUpArea", unit === "sqft" ? v : v / 0.092903)}
              min={0}
              step={10}
              finding={findingFor("builtUpArea")}
              hint="Slab area per floor"
            />
            <NumberField
              label="Number of Floors"
              value={inputs.floors}
              onChange={(v) => set("floors", Math.round(v))}
              min={1}
              max={10}
              step={1}
              finding={findingFor("floors")}
              hint="G+0 → 1, G+1 → 2 …"
            />
            <SelectField
              label="Construction Quality"
              value={inputs.quality}
              onChange={(v) => set("quality", v as Quality)}
              options={[
                { value: "standard", label: "Standard — Builder-grade finishes" },
                { value: "premium", label: "Premium — Branded fittings, vitrified tiles" },
                { value: "luxury", label: "Luxury — Italian marble, smart-home" },
              ]}
              hint="Drives finishes & MEP cost"
            />
          </div>
        </TabsContent>

        {/* STRUCTURE */}
        <TabsContent value="structure" className="m-0 p-6">
          <SectionHeader
            title="Structural Parameters"
            desc="RCC member sizing and material grades."
            code="IS 456 : 2000"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              label="Slab Thickness (mm)"
              value={inputs.slabThickness}
              onChange={(v) => set("slabThickness", v)}
              min={50}
              max={300}
              step={5}
              finding={findingFor("slabThickness")}
              hint="IS 456 minimum: 100 mm"
            />
            <NumberField
              label="External Wall Thickness (mm)"
              value={inputs.wallThickness}
              onChange={(v) => set("wallThickness", v)}
              min={50}
              max={350}
              step={5}
              finding={findingFor("wallThickness")}
              hint="9-inch (230 mm) recommended"
            />
            <SelectField
              label="Concrete Grade"
              value={inputs.concreteGrade}
              onChange={(v) => set("concreteGrade", v as Inputs["concreteGrade"])}
              options={[
                { value: "M15", label: "M15 — PCC only (not for RCC)" },
                { value: "M20", label: "M20 — Min. for RCC, mild exposure" },
                { value: "M25", label: "M25 — Standard for residential RCC" },
                { value: "M30", label: "M30 — Severe / coastal exposure" },
                { value: "M35", label: "M35 — Marine / very severe" },
              ]}
              finding={findingFor("concreteGrade")}
            />
            <SelectField
              label="Steel Grade (TMT)"
              value={inputs.steelGrade}
              onChange={(v) => set("steelGrade", v as Inputs["steelGrade"])}
              options={[
                { value: "Fe415", label: "Fe415 — Legacy, low-rise only" },
                { value: "Fe500", label: "Fe500 — Modern standard" },
                { value: "Fe550", label: "Fe550 — High-strength, optimised qty" },
              ]}
              hint="Higher fy → lower steel weight"
            />
          </div>
        </TabsContent>

        {/* FOUNDATION */}
        <TabsContent value="foundation" className="m-0 p-6">
          <SectionHeader
            title="Foundation & Site"
            desc="Soil-bearing, foundation system, plinth detailing."
            code="IS 1904 / IS 1888"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Soil Type"
              value={inputs.soilType}
              onChange={(v) => set("soilType", v as Inputs["soilType"])}
              options={[
                { value: "hard", label: "Hard rock / hard murum (>250 kN/m²)" },
                { value: "medium", label: "Medium — typical alluvial (150–250)" },
                { value: "soft", label: "Soft clay / loose sand (<100 kN/m²)" },
                { value: "filled", label: "Filled / made-up ground" },
              ]}
              finding={findingFor("soilType")}
            />
            <SelectField
              label="Foundation Type"
              value={inputs.foundationType}
              onChange={(v) => set("foundationType", v as Inputs["foundationType"])}
              options={[
                { value: "isolated", label: "Isolated footings — column-wise" },
                { value: "combined", label: "Combined footings — two-column" },
                { value: "raft", label: "Raft / Mat — distributed loads" },
                { value: "pile", label: "Piled foundation — soft strata" },
              ]}
              finding={findingFor("foundationType")}
            />
            <NumberField
              label="Plinth Height (ft above GL)"
              value={inputs.plinthHeight}
              onChange={(v) => set("plinthHeight", v)}
              min={0}
              max={6}
              step={0.25}
              finding={findingFor("plinthHeight")}
              hint="NBC: ≥ 1.5 ft (450 mm)"
            />
          </div>
        </TabsContent>

        {/* RATES */}
        <TabsContent value="rates" className="m-0 p-6">
          <SectionHeader
            title="Material & Labor Rates"
            desc="Tune to current market or supplier quote."
            code="Local market — verify weekly"
          />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              label="Cement (₹ / 50-kg bag)"
              value={inputs.cementRate}
              onChange={(v) => set("cementRate", v)}
              min={0}
              step={5}
              finding={findingFor("cementRate")}
              hint="Typical ₹ 350–480"
            />
            <NumberField
              label="Steel (₹ / kg)"
              value={inputs.steelRate}
              onChange={(v) => set("steelRate", v)}
              min={0}
              step={1}
              finding={findingFor("steelRate")}
              hint="TMT Fe500 ₹ 65–95"
            />
            <NumberField
              label="Sand (₹ / cuft)"
              value={inputs.sandRate}
              onChange={(v) => set("sandRate", v)}
              min={0}
              step={1}
              hint="River ₹ 70–100, M-sand ₹ 50–70"
            />
            <NumberField
              label="Aggregate 20 mm (₹ / cuft)"
              value={inputs.aggregateRate}
              onChange={(v) => set("aggregateRate", v)}
              min={0}
              step={1}
              hint="Typical ₹ 55–80"
            />
            <NumberField
              label="Bricks (₹ / piece)"
              value={inputs.brickRate}
              onChange={(v) => set("brickRate", v)}
              min={0}
              step={0.5}
              hint="Burnt-clay ₹ 8–12, AAC ₹ 30–45"
            />
            <NumberField
              label="Labor bundle (₹ / sqft)"
              value={inputs.laborRate}
              onChange={(v) => set("laborRate", v)}
              min={0}
              step={10}
              hint="Mason + helper, civil + finishing"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SectionHeader({ title, desc, code }: { title: string; desc: string; code: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <Badge variant="outline" className="shrink-0 border-cyan-400/30 bg-cyan-400/[0.06] font-mono text-[10px] text-cyan-300">
        <BookOpen className="h-3 w-3" />
        {code}
      </Badge>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
  finding,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  hint?: string
  finding?: ValidationFinding
}) {
  const tone =
    finding?.severity === "error"
      ? "border-rose-500/50 bg-rose-500/[0.04]"
      : finding?.severity === "warning"
        ? "border-amber-400/50 bg-amber-400/[0.04]"
        : finding?.severity === "info"
          ? "border-sky-400/40 bg-sky-400/[0.04]"
          : "border-white/10 bg-white/[0.03] focus-within:border-cyan-400/50"

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleHelp className="h-3 w-3 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{hint}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className={cn("mt-1.5 flex items-center rounded-lg border transition", tone)}>
        <Input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="h-10 border-0 bg-transparent font-mono shadow-none focus-visible:ring-0"
        />
      </div>
      {finding ? <FindingInline finding={finding} /> : null}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  finding,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  hint?: string
  finding?: ValidationFinding
}) {
  const tone =
    finding?.severity === "error"
      ? "border-rose-500/50"
      : finding?.severity === "warning"
        ? "border-amber-400/50"
        : "border-white/10"

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleHelp className="h-3 w-3 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{hint}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("mt-1.5 h-10 border bg-white/[0.03]", tone)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {finding ? <FindingInline finding={finding} /> : null}
    </div>
  )
}

function FindingInline({ finding }: { finding: ValidationFinding }) {
  const Icon =
    finding.severity === "error"
      ? AlertCircle
      : finding.severity === "warning"
        ? AlertTriangle
        : finding.severity === "info"
          ? Info
          : CheckCircle2

  const tone =
    finding.severity === "error"
      ? "text-rose-300"
      : finding.severity === "warning"
        ? "text-amber-300"
        : finding.severity === "info"
          ? "text-sky-300"
          : "text-emerald-300"

  return (
    <div className={cn("mt-2 flex items-start gap-2 text-xs", tone)}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="space-y-0.5">
        <div className="font-semibold">{finding.title}</div>
        <div className="text-muted-foreground">{finding.reason}</div>
        <div className="font-mono text-[10px] uppercase tracking-wider opacity-70">{finding.code}</div>
      </div>
    </div>
  )
}

/* ============================================================================
 *  RESULTS PANEL  (right rail)
 * ==========================================================================*/

function ResultsPanel({
  estimate,
  findings,
  onExport,
}: {
  estimate: Estimate
  findings: ValidationFinding[]
  onExport: () => void
}) {
  const errCount = findings.filter((f) => f.severity === "error").length
  const warnCount = findings.filter((f) => f.severity === "warning").length

  const pieData = estimate.materials.map((m, idx) => ({
    name: m.label.length > 22 ? m.label.slice(0, 20) + "…" : m.label,
    value: Math.round(m.cost),
    fill: CHART_COLORS[idx % CHART_COLORS.length],
  }))

  return (
    <div className="sticky top-24 space-y-4">
      {/* TOTAL */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/[0.08] via-sky-500/[0.04] to-transparent p-6 neon-border">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Total Project Estimate</div>
        <div className="mt-2 text-4xl font-semibold tracking-tight neon-text sm:text-5xl">
          {fmtINR(estimate.total)}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {fmtINR(estimate.perSqft)} / sqft · {fmtNum(estimate.totalArea)} sqft total
        </div>

        <Separator className="my-4 bg-white/10" />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Materials</dt>
            <dd className="mt-0.5 font-semibold">{fmtINR(estimate.subTotal - estimate.laborCost)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Labor</dt>
            <dd className="mt-0.5 font-semibold">{fmtINR(estimate.laborCost)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Contingency (5%)</dt>
            <dd className="mt-0.5 font-semibold">{fmtINR(estimate.contingencyCost)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Embodied CO₂</dt>
            <dd className="mt-0.5 font-semibold">{fmtNum(estimate.carbonKg / 1000)} t</dd>
          </div>
        </dl>

        <Button onClick={onExport} className="mt-5 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">
          <Download className="h-4 w-4" />
          Download PDF Report
        </Button>
      </div>

      {/* COMPLIANCE */}
      <div className="rounded-3xl glass p-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold tracking-tight">IS Code Compliance</h4>
          <ShieldCheck
            className={cn(
              "h-4 w-4",
              errCount === 0 ? "text-emerald-400" : "text-rose-400",
            )}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <ComplianceBadge tone="error" count={errCount} label="Errors" />
          <ComplianceBadge tone="warning" count={warnCount} label="Warnings" />
          <ComplianceBadge
            tone="ok"
            count={findings.filter((f) => f.severity === "ok" || f.severity === "info").length}
            label="OK / Info"
          />
        </div>
        {errCount === 0 ? (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3 text-xs text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Inputs satisfy IS 456 / IS 875 / IS 1893 thumb-rule envelope. Proceed to detail design with a licensed engineer.</span>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.06] p-3 text-xs text-rose-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Resolve {errCount} blocking finding{errCount > 1 ? "s" : ""} before relying on this estimate. See Compliance Log below.</span>
          </div>
        )}
      </div>

      {/* CHART */}
      <div className="rounded-3xl glass p-5">
        <h4 className="text-sm font-semibold tracking-tight">Cost Composition</h4>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={2}
                stroke="rgba(2,6,23,0.6)"
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Pie>
              <RTooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(34,211,238,0.3)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => fmtINR(v)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-1.5">
          {pieData.slice(0, 4).map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <span className="font-mono">{fmtINR(d.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComplianceBadge({ tone, count, label }: { tone: Severity; count: number; label: string }) {
  const colors: Record<Severity, string> = {
    error: "border-rose-500/30 bg-rose-500/[0.06] text-rose-300",
    warning: "border-amber-400/30 bg-amber-400/[0.06] text-amber-300",
    info: "border-sky-400/30 bg-sky-400/[0.06] text-sky-300",
    ok: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300",
  }
  return (
    <div className={cn("rounded-xl border p-2.5", colors[tone])}>
      <div className="text-xl font-semibold">{count}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  )
}

/* ============================================================================
 *  DETAILED BREAKDOWN
 * ==========================================================================*/

function DetailedBreakdown({ estimate, unit }: { estimate: Estimate; unit: Unit }) {
  const barData = estimate.materials.map((m) => ({ name: m.label.split(" ")[0], cost: Math.round(m.cost) }))

  return (
    <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-3xl glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Material Quantities</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Computed for {fmtNum(estimate.totalArea)} sqft (
              {fmtNum(sqftToM2(estimate.totalArea))} m²) {unit === "m2" ? "metric" : "imperial"}.
            </p>
          </div>
          <Calculator className="h-5 w-5 text-cyan-300" />
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {estimate.materials.map((m) => {
                const Icon = m.icon
                return (
                  <tr key={m.key} className="border-t border-white/5 transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="leading-tight">
                          <div className="font-medium">{m.label}</div>
                          <div className="text-xs text-muted-foreground">per {m.unit.split(" ")[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {fmtNum(m.qty)} <span className="text-xs text-muted-foreground">{m.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{fmtINR(m.rate)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">{fmtINR(m.cost)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-white/[0.03]">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm text-muted-foreground">
                  Material Subtotal
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {fmtINR(estimate.subTotal - estimate.laborCost)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm text-muted-foreground">
                  Labor (skilled + unskilled bundle)
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{fmtINR(estimate.laborCost)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-sm text-muted-foreground">
                  Contingency (5%)
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{fmtINR(estimate.contingencyCost)}</td>
              </tr>
              <tr className="border-t border-cyan-400/30 bg-cyan-400/[0.04]">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-cyan-200">
                  TOTAL
                </td>
                <td className="px-4 py-3 text-right font-mono text-base font-bold text-cyan-200">
                  {fmtINR(estimate.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="rounded-3xl glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Cost Distribution</h3>
            <p className="mt-1 text-sm text-muted-foreground">Per-line-item contribution to project total.</p>
          </div>
          <Sparkles className="h-5 w-5 text-cyan-300" />
        </div>

        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                stroke="rgba(148,163,184,0.7)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(148,163,184,0.7)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${v / 1000}k`)}
              />
              <RTooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(34,211,238,0.3)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => fmtINR(v)}
                cursor={{ fill: "rgba(34,211,238,0.08)" }}
              />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <KV label="Cement / sqft" value={`${(estimate.materials[0].qty / estimate.totalArea).toFixed(2)} bag`} />
          <KV label="Steel / sqft" value={`${(estimate.materials[1].qty / estimate.totalArea).toFixed(1)} kg`} />
          <KV label="Bricks / sqft" value={`${(estimate.materials[4].qty / estimate.totalArea).toFixed(1)} pc`} />
          <KV label="Cost / sqft" value={fmtINR(estimate.perSqft)} />
          <KV label="Quality factor" value={`× ${estimate.qualityMult.toFixed(2)}`} />
          <KV label="Floor factor" value={`× ${estimate.floorMult.toFixed(2)}`} />
        </div>
      </div>
    </section>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold">{value}</div>
    </div>
  )
}

/* ============================================================================
 *  COMPLIANCE LOG
 * ==========================================================================*/

function ComplianceLog({ findings }: { findings: ValidationFinding[] }) {
  return (
    <section className="mt-12 rounded-3xl glass p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Intelligent Validation Log</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Every finding cites the IS Code clause that motivated it — read the <em>why</em> before adjusting inputs.
          </p>
        </div>
        <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/[0.06] text-cyan-300">
          IVE · {findings.length} entries
        </Badge>
      </div>

      <ul className="mt-5 space-y-3">
        {findings.map((f) => {
          const Icon =
            f.severity === "error"
              ? AlertCircle
              : f.severity === "warning"
                ? AlertTriangle
                : f.severity === "info"
                  ? Info
                  : CheckCircle2
          const tone =
            f.severity === "error"
              ? "border-rose-500/30 bg-rose-500/[0.05] text-rose-200"
              : f.severity === "warning"
                ? "border-amber-400/30 bg-amber-400/[0.05] text-amber-100"
                : f.severity === "info"
                  ? "border-sky-400/30 bg-sky-400/[0.04] text-sky-100"
                  : "border-emerald-500/30 bg-emerald-500/[0.05] text-emerald-100"

          return (
            <li key={f.id} className={cn("flex gap-3 rounded-xl border p-4", tone)}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-semibold">{f.title}</div>
                  <span className="font-mono text-[10px] uppercase tracking-wider opacity-70">{f.code}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.reason}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ============================================================================
 *  FOOTER
 * ==========================================================================*/

function Footer() {
  const linkClass =
    "group inline-flex items-center gap-2 rounded-lg px-2 py-1 -mx-2 text-sm transition hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300"
  return (
    <footer className="border-t border-slate-200 bg-white/50 py-10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950">
                <Building2 className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="font-mono text-sm font-semibold">
                BuildCalc <span className="neon-text">Pro</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Production-grade residential construction estimator with an embedded IS Code reasoning engine for the
              Indian market.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-cyan-700 dark:text-cyan-300">
              <Sparkles className="h-3 w-3" />
              <span className="font-mono uppercase tracking-[0.2em]">Created by Siddhu Pogula</span>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Standards Referenced</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                IS 456 : 2000 — Plain &amp; Reinforced Concrete
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                IS 875 (Part 3) : 2015 — Wind Loads
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                IS 1893 (Part 1) : 2016 — Seismic Design
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                IS 1904 / IS 4326 / NBC 2016
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Connect</div>
            <ul className="mt-3 space-y-1">
              <li>
                <a
                  href="https://github.com/P-Siddhu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                  aria-label="Siddhu Pogula on GitHub"
                >
                  <Github className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>github.com/P-Siddhu</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/siddhu-pogula"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                  aria-label="Siddhu Pogula on LinkedIn"
                >
                  <Linkedin className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>linkedin.com/in/siddhu-pogula</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:siddhupogula7@gmail.com"
                  className={linkClass}
                  aria-label="Email Siddhu Pogula"
                >
                  <Mail className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>siddhupogula7@gmail.com</span>
                </a>
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 text-[11px] leading-relaxed text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/[0.04] dark:text-amber-200/90">
              <strong className="text-amber-700 dark:text-amber-200">Disclaimer:</strong> Estimates are indicative,
              derived from residential thumb-rules. Final structural design must be certified by a licensed
              structural engineer before construction.
            </div>
          </div>
        </div>

        <div className="hairline mt-10" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span className="text-center sm:text-left">
            © {new Date().getFullYear()} BuildCalc Pro · Created by Siddhu Pogula · All rights reserved.
          </span>
          <span className="font-mono">v1.0 · IS-Code Engine 2026</span>
        </div>
      </div>
    </footer>
  )
}
