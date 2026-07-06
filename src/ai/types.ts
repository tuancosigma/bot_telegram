export type Confidence = "high" | "medium" | "low";

export interface PostSpec {
  model: string | null;
  cpu: string | null;
  gpu: string | null;
  ramType: "DDR4" | "DDR5" | "LPDDR" | null;
  ramSizeGb: number | null;
  ramSticks: number | null;
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
