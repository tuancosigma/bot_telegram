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
  const esc = (val: any) => {
    if (val == null) return "N/A";
    return String(val).replace(/[_*`[\]]/g, "\\$&");
  };

  const pros = evaluation.pros.length > 0 
    ? evaluation.pros.map((p) => `  - ${esc(p)}`).join("\n") 
    : "  - N/A";
  const cons = evaluation.cons.length > 0 
    ? evaluation.cons.map((c) => `  - ${esc(c)}`).join("\n") 
    : "  - N/A";

  const modelLine = spec.model
    ? esc(spec.model)
    : `Mini PC (chưa xác định model${spec.modelTier ? `, tier: ${esc(spec.modelTier)}` : ""})`;

  const ramBusSuffix = spec.ramBusMhz ? ` bus ${spec.ramBusMhz}MHz` : "";
  const ramTypeStr = spec.ramType ? ` ${spec.ramType}` : "";
  const ramStr = spec.ramSizeGb ? `${spec.ramSizeGb}GB${ramTypeStr}${ramBusSuffix}` : "N/A";
  const ssdTypeStr = spec.ssdType ? ` ${spec.ssdType}` : "";
  const ssdStr = spec.ssdSizeGb ? `${spec.ssdSizeGb}GB${ssdTypeStr}` : "N/A";

  return [
    `*${modelLine}*`,
    "",
    `CPU: ${esc(spec.cpu)}`,
    `RAM: ${esc(ramStr)}`,
    `SSD: ${esc(ssdStr)}`,
    `Giá bán: ${esc(formatVnd(spec.purchasePrice))}`,
    `Địa điểm: ${esc(post.location)}`,
    `Người bán: ${esc(post.authorName)}`,
    `Tên group: ${esc(post.groupName)}`,
    `Link: [Xem bài viết](${post.url})`,
    "",
    `Ước tính bán RAM: ${esc(formatVnd(pricing.ramResaleVnd))}`,
    `Ước tính bán SSD: ${esc(formatVnd(pricing.ssdResaleVnd))}`,
    `Giá vốn Barebone: ${esc(formatVnd(pricing.barebonePriceVnd))}`,
    `Giá thị trường: ${esc(formatVnd(evaluation.marketPriceEstimateVnd))} (${esc(evaluation.marketComparison)})`,
    "",
    `Ưu điểm:`,
    pros,
    `Nhược điểm:`,
    cons,
    "",
    `Điểm đánh giá: ${stars(evaluation.starRating)}`,
  ].join("\n");
}
