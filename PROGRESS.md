# PROGRESS

## Current Step
**Status:** PASS
**Step:** Phát triển tính năng "Đường Đua" (Race Mode) có thanh năng lượng.

## History
- **Step:** Build exact static UI clone of the mockup. (PASS)
- **Step:** Re-integrate dynamic data into the TasksPanel. (PASS)
- **Step:** Re-integrate dynamic data into the FocusPanel (Timer) and Right Column panels. (PASS)
- **Step:** Re-integrate dynamic data into the Right Column (Reward Vault and Recovery Logs). (PASS)
- **Step:** Fix Reward Vault backend data, API error handling, and automated notification sound checks. (PASS)
- **Step:** Optimize mobile layout. (PASS)
- **Step:** Implement full interactions for the Rewards tab. (PASS)
- **Step:** Wire Quick Actions to navigate to Bio Logs tab. (PASS)
- **Step:** Dịch toàn bộ giao diện sang tiếng Việt. (PASS)
- **Step:** Tái cơ cấu giao diện theo style Thám tử Conan (Dark Theme). (PASS)
- **Step:** Điều chỉnh thiết kế GenZ (đổi tông màu trắng hồng, nhiều nhân vật, xoá sọc chi tiết caro). (REVERTED)
- **Step:** Revert giao diện về lại phong cách Thám tử Conan vì nền hồng chữ khó đọc. (PASS)
- **Step:** CSS lại giao diện trang Bạn Bè (Friends tab) theo chuẩn Dark Theme hiện đại. (PASS)
- **Step:** Sửa lỗi API gửi kết bạn và phản hồi kết bạn bị fail do thiếu Content-Type header. (PASS)
- **Step:** Thêm tính năng gửi lời mời bạn bè vào Phòng Thi đua (Realtime qua Socket.IO). (PASS)
- **Step:** Thêm thông báo pop-up toàn hệ thống (kèm âm thanh) khi nhận được lời mời vào phòng. (PASS)
- **Step:** Thêm nút "Hẹn hò" để gửi yêu cầu ghép đôi (Partner) thời gian thực. (PASS)
- **Step:** Cập nhật "Cuộc đua": Thanh tiến trình di chuyển mượt mà (real-time) theo đồng hồ đếm ngược thay vì nhảy vọt sau khi xong task, thêm icon Trái tim ở vạch đích. (PASS)
- **Step:** Sửa lỗi không thấy nút chat/gửi lời nhắn do điều kiện sai của phòng couple, và làm cho thông báo nổi bật hơn. (PASS)
- **Step:** Nâng cấp Cuộc Đua thành tính năng Thách Đấu với việc thiết lập Phần Thưởng & Hình Phạt tùy chọn, phải đợi đối phương Đồng ý, và có nút Đầu hàng. (PASS)
- **Step:** Xóa nút Đăng xuất góc trên để tránh bấm nhầm; Thêm tính năng "Theo dõi sự tập trung" (báo động khi Partner chuyển tab/rời app). (PASS)
- **Step:** Thêm tính năng "Hồ Sơ Năng Suất": Click vào Avatar của bạn bè hoặc Partner để xem Thống kê và Lịch sử làm việc. (PASS)
- **Step:** Thêm trang Cơ chế sinh học (Biological Mechanisms). (PASS)
- **Step:** Nâng cấp Endorphin: Combo trạng thái Flow (Gia tốc). (PASS)
- **Step:** Nâng cấp kiểm soát Cortisol: "Chế độ phạt" khi cố chấp. (PASS)
- **Step:** Triển khai Phase 2: Couple Study Mode (Real-time Socket.IO, Shared Wallet, Partner Status). (PASS)
- **Step:** Triển khai Phase 3 (Part 1): Romantic Couple UI (Giao diện Tình yêu). (PASS)
- **Step:** Triển khai Phase 3 (Part 2): Arena Rooms (Phòng Thi Đua & Bảng Xếp Hạng). (PASS)
- **Step:** Xây dựng hệ thống Đăng nhập / Đăng ký bằng JWT Authentication. (PASS)
- **Step:** Fix lỗi "Task not found", thay đổi tên "Quỹ Dopa" thành "Xu", tự động nạp quà mẫu khi đăng ký. (PASS)
- **Step:** Nâng cấp kiến thức khoa học trên trang Cơ chế sinh học. (PASS)

## Thay đổi bước hiện tại
- Cập nhật Database (Thêm `target_score` cho Phòng và `room_progress` cho User).
- Viết API `POST /api/rooms/race/start` để đặt mục tiêu Số phút học.
- Viết lại UI của Arena: Có Form thiết lập Mục tiêu và vẽ đường đua `race-lane`.
- Thay đổi logic tính điểm: Thanh năng lượng sẽ chạy dựa trên **Số phút làm việc/học tập (duration)** của nhiệm vụ thay vì số Xu, đảm bảo công bằng cho tất cả các loại nhiệm vụ.

## User Test Instructions
1. Hãy reload lại tab trình duyệt.
2. Bạn vào phần "Phòng Thi Đua" (Đảm bảo đã tham gia phòng).
3. Sẽ có nút yêu cầu bạn đặt Mục Tiêu (VD: 50 Xu).
4. Bạn có thể mở 1 tab ẩn danh để làm 2 tài khoản đấu với nhau, tick 1 task xong quay lại nhìn Đường đua để thấy xe Avatar nhích lên nhé!
