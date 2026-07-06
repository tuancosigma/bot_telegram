export type Confidence = "high" | "medium" | "low";

// Performance tier used when the exact model can't be pinned down — per spec:
// "Nếu không chắc chắn phải ghi: Cao / Trung bình / Thấp". Independent of `confidence`,
// which reflects extraction certainty rather than the device's performance tier.
export type ModelTier = "Cao" | "Trung bình" | "Thấp";

export interface PostSpec {
  model: string | null;
  modelTier: ModelTier | null;
  cpu: string | null;
  gpu: string | null;
  ramType: "DDR4" | "DDR5" | "LPDDR" | null;
  ramSizeGb: number | null;
  ramSticks: number | null;
  ramBusMhz: number | null;
  ramRemovable: boolean | null;
  ssdType: "SATA" | "NVMe" | null;
  ssdSizeGb: number | null;
  ssdRemovable: boolean | null;
  ssdGen: "Gen3" | "Gen4" | null;
  ports: string[];
  purchasePrice: number | null;
  confidence: Confidence;
}

export interface PricingResult {
  ramResaleVnd: number;
  ssdResaleVnd: number;
  barebonePriceVnd: number | null;
}

export type MarketComparison = "Rất rẻ" | "Rẻ" | "Hợp lý" | "Hơi cao" | "Quá cao";

export interface DealEvaluation {
  marketPriceEstimateVnd: number | null;
  marketComparison: MarketComparison;
  pros: string[];
  cons: string[];
  starRating: 1 | 2 | 3 | 4 | 5;
}
