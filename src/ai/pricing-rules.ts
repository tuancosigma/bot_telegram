import type { PostSpec, PricingResult } from "./types";

// Price ranges (VND) from MiniPC_Deal_Bot_Specification.md — using midpoint of each range.
const RAM_DDR4_PER_STICK: Record<number, number> = {
  8: 650_000, // 600k-700k
  16: 1_350_000, // 1.2m-1.5m
};

const RAM_DDR5_PER_STICK: Record<number, number> = {
  8: 1_400_000, // 1.3m-1.5m
  16: 2_800_000, // 2.6m-3m
};

const SSD_NVME_PRICE: Record<number, number> = {
  512: 1_150_000, // 1m-1.3m
  1024: 2_250_000, // 2m-2.5m
};

// Baseline bus speed per RAM type — bus above baseline commands a premium per spec's
// "Bus càng cao có thể cộng thêm" note. Step size chosen to match common bin sizes
// (DDR4: 2933/3200/3600..., DDR5: 4800/5200/5600...).
const RAM_BUS_BASELINE_MHZ: Record<"DDR4" | "DDR5", number> = { DDR4: 3200, DDR5: 4800 };
const RAM_BUS_STEP_MHZ: Record<"DDR4" | "DDR5", number> = { DDR4: 400, DDR5: 800 };
const RAM_BUS_PREMIUM_PER_STEP = 0.05;
const RAM_BUS_PREMIUM_CAP = 0.2;

function applyBusPremium(basePrice: number, ramType: "DDR4" | "DDR5", ramBusMhz: number | null): number {
  if (!ramBusMhz) return basePrice;

  const baseline = RAM_BUS_BASELINE_MHZ[ramType];
  const step = RAM_BUS_STEP_MHZ[ramType];
  if (ramBusMhz <= baseline) return basePrice;

  const steps = Math.floor((ramBusMhz - baseline) / step);
  const premium = Math.min(steps * RAM_BUS_PREMIUM_PER_STEP, RAM_BUS_PREMIUM_CAP);
  return Math.round(basePrice * (1 + premium));
}

function estimateRamResale(spec: PostSpec): number {
  if (spec.ramRemovable === false || spec.ramType === "LPDDR" || !spec.ramType || !spec.ramSizeGb) {
    return 0;
  }

  const sticks = spec.ramSticks ?? 1;
  const sizePerStick = sticks > 0 ? spec.ramSizeGb / sticks : spec.ramSizeGb;
  const table = spec.ramType === "DDR5" ? RAM_DDR5_PER_STICK : RAM_DDR4_PER_STICK;
  const pricePerStick = table[sizePerStick];

  if (pricePerStick === undefined) return 0;
  const totalBeforeBusPremium = pricePerStick * sticks;
  return applyBusPremium(totalBeforeBusPremium, spec.ramType, spec.ramBusMhz);
}

function estimateSsdResale(spec: PostSpec): number {
  if (spec.ssdRemovable === false || spec.ssdType !== "NVMe" || !spec.ssdSizeGb) {
    return 0;
  }

  const price = SSD_NVME_PRICE[spec.ssdSizeGb];
  if (price === undefined) return 0;

  // Gen4/high-end variants can fetch more — apply a modest premium per spec's note.
  return spec.ssdGen === "Gen4" ? Math.round(price * 1.15) : price;
}

export function computePricing(spec: PostSpec): PricingResult {
  const ramResaleVnd = estimateRamResale(spec);
  const ssdResaleVnd = estimateSsdResale(spec);

  const barebonePriceVnd =
    spec.purchasePrice != null ? spec.purchasePrice - ramResaleVnd - ssdResaleVnd : null;

  return { ramResaleVnd, ssdResaleVnd, barebonePriceVnd };
}
