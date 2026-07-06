import type { RawPost } from "../scraper/types";
import type { DealEvaluation, PostSpec, PricingResult } from "../ai/types";

function formatVnd(amount: number | null): string {
  if (amount == null) return "N/A";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function formatDealMessage(
  post: RawPost,
  spec: PostSpec,
  pricing: PricingResult,
  evaluation: DealEvaluation
): string {
  const pros = evaluation.pros.length > 0 ? evaluation.pros.map((p) => `  - ${p}`).join("\n") : "  - N/A";
  const cons = evaluation.cons.length > 0 ? evaluation.cons.map((c) => `  - ${c}`).join("\n") : "  - N/A";

  const modelLine = spec.model
    ? spec.model
    : `Mini PC (chưa xác định model${spec.modelTier ? `, tier: ${spec.modelTier}` : ""})`;

  const ramBusSuffix = spec.ramBusMhz ? ` bus ${spec.ramBusMhz}MHz` : "";

  return [
    `*${modelLine}*`,
    "",
    `CPU: ${spec.cpu ?? "N/A"}`,
    `RAM: ${spec.ramSizeGb ? `${spec.ramSizeGb}GB ${spec.ramType ?? ""}${ramBusSuffix}`.trim() : "N/A"}`,
    `SSD: ${spec.ssdSizeGb ? `${spec.ssdSizeGb}GB ${spec.ssdType ?? ""}`.trim() : "N/A"}`,
    `Giá bán: ${formatVnd(spec.purchasePrice)}`,
    `Địa điểm: ${post.location ?? "N/A"}`,
    `Người bán: ${post.authorName}`,
    `Tên group: ${post.groupName}`,
    `Link: ${post.url}`,
    "",
    `Ước tính bán RAM: ${formatVnd(pricing.ramResaleVnd)}`,
    `Ước tính bán SSD: ${formatVnd(pricing.ssdResaleVnd)}`,
    `Giá vốn Barebone: ${formatVnd(pricing.barebonePriceVnd)}`,
    `Giá thị trường: ${formatVnd(evaluation.marketPriceEstimateVnd)} (${evaluation.marketComparison})`,
    "",
    `Ưu điểm:`,
    pros,
    `Nhược điểm:`,
    cons,
    "",
    `Điểm đánh giá: ${stars(evaluation.starRating)}`,
  ].join("\n");
}
