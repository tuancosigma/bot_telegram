import { callDeepseekJson } from "./deepseek-client";
import type { DealEvaluation, PostSpec, PricingResult } from "./types";

const SYSTEM_PROMPT = `Bạn là người có kinh nghiệm săn Mini PC cũ tại thị trường Việt Nam.
Bạn được cung cấp thông số máy và giá vốn Barebone ĐÃ ĐƯỢC TÍNH SẴN (sau khi trừ giá bán lại RAM/SSD).
Nhiệm vụ: đánh giá deal này có đáng mua không, dựa trên giá vốn Barebone — KHÔNG tự tính toán lại số học.

QUY TẮC:
- So sánh giá vốn Barebone với mặt bằng thị trường Việt Nam cho cấu hình tương đương.
- Không chỉ nhìn hiệu năng CPU, xét cả tổng thể (cổng kết nối, độ mới, tình trạng máy).
- Nếu "model" là null nhưng có "modelTier" (Cao/Trung bình/Thấp), dùng tier đó để ước lượng giá thị trường
  thay vì bỏ qua — ghi rõ trong nhược điểm là chưa xác định được model cụ thể.
- Nếu thiếu thông tin quan trọng, ghi rõ trong nhược điểm thay vì bịa.
- Trả về đúng JSON schema, không giải thích thêm.

JSON schema:
{
  "marketPriceEstimateVnd": number | null,
  "marketComparison": "Rất rẻ" | "Rẻ" | "Hợp lý" | "Hơi cao" | "Quá cao",
  "pros": string[],
  "cons": string[],
  "starRating": 1 | 2 | 3 | 4 | 5
}`;

export async function evaluateDeal(spec: PostSpec, pricing: PricingResult, postText: string): Promise<DealEvaluation> {
  const userContent = JSON.stringify({ postText, spec, pricing }, null, 2);

  return callDeepseekJson<DealEvaluation>([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ]);
}
