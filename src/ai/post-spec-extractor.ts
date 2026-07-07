import { callDeepseekJson } from "./deepseek-client";
import type { PostSpec } from "./types";

const SYSTEM_PROMPT = `Bạn là chuyên gia phần cứng Mini PC tại thị trường Việt Nam.
Nhiệm vụ: đọc bài đăng rao bán Mini PC cũ và trích xuất thông số kỹ thuật thành JSON.

QUY TẮC BẮT BUỘC:
- Chỉ lấy thông tin có trong bài đăng. Nếu bài không ghi rõ, để null.
- Nếu phải suy luận (vd biết model thì suy ra CPU/RAM thường đi kèm), vẫn điền nhưng hạ "confidence" xuống "medium" hoặc "low".
- KHÔNG được bịa số liệu không có căn cứ.
- ramType: "LPDDR" nếu RAM hàn chết (không tháo được).
- modelTier: nếu KHÔNG xác định được model cụ thể, ước lượng tier hiệu năng tổng thể là "Cao" | "Trung bình" | "Thấp"
  dựa trên CPU/RAM/thế hệ máy nếu có manh mối, còn không thì để null. Nếu model đã xác định rõ, để modelTier null.
- ramBusMhz: bus RAM (MHz, vd 3200, 4800) nếu bài có ghi, không suy đoán nếu không có căn cứ.
- isQuestionOrDiscussion: trả về true nếu nội dung bài đăng/bình luận chủ yếu là đặt câu hỏi, xin tư vấn, thảo luận lỗi, hỏi đáp hoặc tán gẫu (vd: hỏi nên mua con nào, hỏi lỗi driver, hỏi giá...). Trả về false nếu là bài rao bán, thanh lý, tìm mua, hoặc bình luận chào bán/giới thiệu sản phẩm.
- Trả về đúng JSON schema, không thêm giải thích.

JSON schema:
{
  "model": string | null,
  "modelTier": "Cao" | "Trung bình" | "Thấp" | null,
  "cpu": string | null,
  "gpu": string | null,
  "ramType": "DDR4" | "DDR5" | "LPDDR" | null,
  "ramSizeGb": number | null,
  "ramSticks": number | null,
  "ramBusMhz": number | null,
  "ramRemovable": boolean | null,
  "ssdType": "SATA" | "NVMe" | null,
  "ssdSizeGb": number | null,
  "ssdRemovable": boolean | null,
  "ssdGen": "Gen3" | "Gen4" | null,
  "ports": string[],
  "purchasePrice": number | null,
  "confidence": "high" | "medium" | "low",
  "isQuestionOrDiscussion": boolean | null
}`;

export async function extractPostSpec(postText: string): Promise<PostSpec> {
  return callDeepseekJson<PostSpec>([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: postText },
  ]);
}
