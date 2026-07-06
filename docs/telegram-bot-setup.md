# Telegram Bot Setup

## 1. Tạo bot với BotFather
1. Mở Telegram, tìm `@BotFather`, gửi `/newbot`
2. Đặt tên bot (hiển thị) và username (phải kết thúc bằng `bot`, vd `minipc_deal_alert_bot`)
3. BotFather trả về một token dạng `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Copy token này vào `.env` → `TELEGRAM_BOT_TOKEN`

## 2. Lấy Chat ID
Chọn 1 trong 2 cách:

### Cách A — gửi tin nhắn trực tiếp cho bạn (đơn giản nhất)
1. Mở chat với bot vừa tạo, bấm Start, gửi bất kỳ tin nhắn nào (vd "hi")
2. Mở trình duyệt, truy cập: `https://api.telegram.org/bot<TOKEN>/getUpdates` (thay `<TOKEN>` bằng token thật)
3. Tìm field `"chat":{"id":...}` trong JSON trả về — số đó là chat id của bạn
4. Copy vào `.env` → `TELEGRAM_CHAT_ID`

### Cách B — gửi vào 1 channel/group riêng
1. Tạo channel/group, thêm bot vào làm admin
2. Gửi 1 tin nhắn bất kỳ vào channel/group đó
3. Lặp lại bước 2-3 ở Cách A, chat id của channel thường có dạng số âm (vd `-1001234567890`)

## 3. Kiểm tra
Sau khi điền `.env`, chạy thử gửi tin nhắn test (sẽ có script test trong phase 5) để xác nhận
bot gửi được tin vào đúng chat.
