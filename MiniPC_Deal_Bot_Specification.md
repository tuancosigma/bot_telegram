# Mini PC Deal Bot Specification

## Mục tiêu

Xây dựng một Telegram Bot chuyên săn Mini PC cũ trên Facebook.

Bot sẽ quét bài đăng định kỳ (khoảng 5 phút/lần), phân tích và chỉ gửi
những bài liên quan đến Mini PC.

AI đóng vai trò là một người có kinh nghiệm săn Mini PC tại thị trường
Việt Nam.

Mục tiêu cuối cùng là xác định:

-   Có đáng mua không.
-   Sau khi bán RAM/SSD thì giá vốn thân máy còn bao nhiêu.
-   So với mặt bằng thị trường thì đây có phải deal tốt hay không.

------------------------------------------------------------------------

# Nguồn dữ liệu

## Nguồn ưu tiên

Bot phải quét trước 2 group sau:

Group 1

https://www.facebook.com/groups/491146536247921

Priority: 100

Group 2

https://www.facebook.com/groups/610350386210787

Priority: 100

Trong tương lai có thể bổ sung thêm các group khác.

Các group ngoài 2 group trên sẽ có Priority thấp hơn.

------------------------------------------------------------------------

# Chu kỳ quét

-   Quét mỗi 5 phút.
-   Chỉ lấy bài mới.
-   Không gửi lại bài đã xử lý.
-   Nếu bài bị chỉnh sửa thì có thể cập nhật.

------------------------------------------------------------------------

# Điều kiện nhận diện

Chỉ xử lý bài đăng liên quan Mini PC.

Ví dụ:

-   Firebat
-   Beelink
-   Minisforum
-   GMKtec
-   Aoostar
-   Geekom
-   HP Mini
-   Lenovo Tiny
-   Dell Micro
-   Intel NUC

Nếu không phải Mini PC thì bỏ qua.

------------------------------------------------------------------------

# Thông tin cần lấy từ bài đăng

## Thông tin bài viết

-   Nội dung bài viết
-   Giá bán
-   Người bán
-   Địa điểm
-   Thời gian đăng
-   Link bài viết
-   Tên group
-   Toàn bộ ảnh
-   Số lượng ảnh

## Thông tin phần cứng

Ưu tiên lấy trực tiếp từ bài đăng:

-   Model
-   CPU
-   GPU
-   RAM
-   Dung lượng RAM
-   DDR4 / DDR5
-   Bus RAM
-   SSD
-   Dung lượng SSD

Nếu thiếu thì AI mới suy luận, không được tự bịa.

------------------------------------------------------------------------

# AI cần phân tích

## Xác định model

Nếu không chắc chắn phải ghi:

-   Cao
-   Trung bình
-   Thấp

## Phân tích cấu hình

RAM

-   DDR4 / DDR5
-   Dung lượng
-   Số thanh
-   Có thể tháo không

SSD

-   SATA / NVMe
-   Gen3 / Gen4

Các cổng nếu biết

-   USB4
-   OCuLink
-   Thunderbolt
-   LAN 2.5G

------------------------------------------------------------------------

# Khả năng tách linh kiện

Đánh giá:

-   Có bán riêng RAM được không
-   Có bán riêng SSD được không

Nếu là LPDDR hoặc RAM hàn phải ghi rõ không thể bán RAM.

------------------------------------------------------------------------

# Quy tắc định giá

## RAM DDR4

-   8GB: 600k--700k
-   16GB: 1.2m--1.5m

## RAM DDR5

-   8GB: 1.3m--1.5m
-   16GB: 2.6m--3m

Bus càng cao có thể cộng thêm.

## SSD NVMe

-   512GB: 1m--1.3m
-   1TB: 2m--2.5m

SSD Gen4 hoặc dòng cao cấp có thể cộng thêm.

------------------------------------------------------------------------

# Giá vốn Barebone

Giá mua - Giá RAM - Giá SSD = Giá vốn Barebone

Ví dụ:

-   Giá mua: 6.500.000
-   RAM: 2 × 8GB DDR5 ≈ 2.900.000
-   SSD: Không có

=\> Barebone ≈ 3.600.000

------------------------------------------------------------------------

# So sánh thị trường

Ước tính:

-   Giá thị trường
-   Chênh lệch

Đánh giá:

-   Rất rẻ
-   Rẻ
-   Hợp lý
-   Hơi cao
-   Quá cao

------------------------------------------------------------------------

# Kết luận

Đánh giá:

-   ★★★★★ Deal rất tốt
-   ★★★★☆ Nên mua
-   ★★★☆☆ Có thể cân nhắc
-   ★★☆☆☆ Không hấp dẫn
-   ★☆☆☆☆ Không nên mua

------------------------------------------------------------------------

# Telegram

Bot gửi:

-   Model
-   CPU
-   RAM
-   SSD
-   Giá bán
-   Địa điểm
-   Người bán
-   Tên group
-   Link bài viết
-   Ước tính bán RAM
-   Ước tính bán SSD
-   Giá vốn Barebone
-   Giá thị trường
-   Ưu điểm
-   Nhược điểm
-   Điểm đánh giá

Sau đó gửi toàn bộ ảnh của bài đăng.

------------------------------------------------------------------------

# Quy tắc

-   Không bịa dữ liệu.
-   Nếu thiếu thông tin phải ghi rõ.
-   Luôn ưu tiên kinh nghiệm thị trường Việt Nam.
-   Đánh giá dựa trên giá vốn Barebone sau khi bán linh kiện.
-   Không chỉ nhìn vào hiệu năng CPU.
-   Luôn ghi rõ địa điểm người bán.
-   Luôn đính kèm link bài viết và toàn bộ ảnh.
