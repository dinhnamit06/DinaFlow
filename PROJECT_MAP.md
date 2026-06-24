# PROJECT MAP

## Architecture
- React (Vite) frontend application.
- Uses `lucide-react` for icons.
- Single-file MVP architecture (`src/App.jsx`).
- Custom CSS (`src/styles.css`) for UI layout matching Dribbble mockup.
- Backend Express.js Server (`server/src/index.js`).
- Prisma ORM with SQLite database for persisting Tasks, Rewards, User Stats, and Logs.

## Commands
- `npm run dev`: Start Vite dev server.
- `npm run dev:all`: Start frontend and backend mock.

## Important Files
- `src/App.jsx`: Main application logic and UI views (Dashboard, Tasks, Timer, Rewards, Logs, Mechanism).
- `src/styles.css`: Core design system and layout.
- `server/prisma/schema.prisma`: Database Schema.
- `public/`: Contains mascot images and UI assets.

## Future Roadmap (Phase 2)
### Chế độ Couple Study (Gamification Mở rộng)
- **Database Architecture**: 
  - Update `User` model with `partner_id` to link accounts.
  - Create a `SharedWallet` or `CoupleReward` table.
- **Tính năng dự kiến**:
  1. **Đồng bộ trạng thái (Status Sync)**: Dùng Socket.IO để hiển thị trạng thái realtime khi người kia đang trong phiên Flow hoặc đang bị Cortisol quá tải.
  2. **Quỹ Xu Tình Yêu (Shared Wallet)**: Nhiệm vụ hoàn thành bởi cả 2 sẽ cộng dồn xu vào quỹ chung. Mua các phần thưởng "Couple" (VD: Đi xem phim, Bao ăn một bữa).
  3. **Giải cứu Kiệt sức (Cortisol Rescue)**: Cho phép chuyển điểm Phục hồi (Serotonin/Oxytocin) từ tài khoản này sang tài khoản kia để "cứu" partner khi họ bị khóa tính năng do quá tải công việc.
  4. **Body Doubling / Parasocial Interaction**: Các câu thoại tương tác từ nhân vật ảo (Haibara/Conan) khi partner vắng mặt.
