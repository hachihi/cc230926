# Chấm Công — Hệ thống quản lý chấm công nhân viên

Ứng dụng Next.js (App Router, TypeScript) quản lý chấm công nhân viên:

- **Đăng nhập / phân quyền**: NextAuth — Credentials (email/mật khẩu, dùng cho admin/quản lý) **và** Google OAuth (dùng cho nhân viên chấm công GPS, chỉ Gmail có trong danh sách nhân viên mới đăng nhập được). Vai trò `ADMIN`, `MANAGER`, `EMPLOYEE`.
- **Quản lý người dùng đăng nhập**: tạo tài khoản, gán vai trò, liên kết với hồ sơ nhân viên.
- **Hai kênh chấm công song song**:
  1. **Máy chấm công vật lý** (ZKTeco, máy vân tay/thẻ...) — máy đẩy dữ liệu về `/api/attendance` bằng API key riêng của từng máy.
  2. **Chấm công GPS qua điện thoại** — nhân viên đăng nhập Google, bấm CHECK IN/OUT tại trang `/checkin`, hệ thống lấy toạ độ GPS, đối chiếu với địa điểm/geofence đã cấu hình.
- **Quản lý địa điểm chấm công (geofence)**: đặt toạ độ + bán kính cho phép, chấm công ngoài phạm vi vẫn được ghi nhận nhưng đánh dấu `OUT_OF_RANGE` để quản lý xem lại.
- **Đồng bộ nhân viên từ Odoo**: gọi JSON-RPC tới `hr.employee`, chuẩn hoá email về chữ thường.
- **Lịch sử cá nhân**: nhân viên chỉ xem được chấm công của chính mình.
- **Giờ làm việc**: định nghĩa ca làm việc (giờ bắt đầu/kết thúc, ngày trong tuần, số giờ chuẩn/ngày) và gán cho từng nhân viên.
- **Xuất/nhập Excel** ở 3 trang: Nhân viên, Giờ làm việc, Báo cáo (chi tiết ở mục 3c bên dưới).
- **Nhật ký hệ thống (audit log)**: ghi lại đăng nhập, từ chối đăng nhập, các lượt chấm công GPS kèm khoảng cách/trạng thái — chỉ ADMIN xem được.
- **Báo cáo**: tổng hợp số giờ làm việc theo nhân viên / theo ngày, trong một khoảng thời gian tuỳ chọn.

## Kiến trúc

```
                 ┌──────────────┐
                 │ Google OAuth │──── nhân viên (điện thoại)
                 └──────┬───────┘
                        │
┌──────────────┐  ┌─────▼────────┐        ┌─────────────┐
│  Máy chấm     │─▶│    VERCEL    │◀───────│  Odoo (HR)  │
│  công vật lý  │  │ Next.js App  │  sync  │  hr.employee│
└──────────────┘  └──────┬───────┘        └─────────────┘
                         │
                   ┌─────▼──────┐
                   │  Postgres  │ (Prisma) — Employee, Device,
                   │            │   AttendanceLocation, AttendanceRecord,
                   │            │   User, AuditLog
                   └────────────┘
```

```
src/
  app/
    login/                     trang đăng nhập (email/mật khẩu + Google)
    (dashboard)/                khu vực sau đăng nhập (có sidebar)
      checkin/                  chấm công GPS (mobile-first) — trang chính của nhân viên
      history/                  lịch sử chấm công của chính mình
      dashboard/                tổng quan (ADMIN/MANAGER)
      employees/                danh sách + đồng bộ Odoo
      devices/                  quản lý máy chấm công vật lý
      locations/                quản lý địa điểm/geofence
      users/                    quản lý người dùng đăng nhập
      reports/                  báo cáo giờ công
      logs/                     nhật ký hệ thống (ADMIN)
    api/
      auth/[...nextauth]/       NextAuth (Credentials + Google)
      employees/sync/           đồng bộ từ Odoo (POST)
      employees/                danh sách nhân viên (GET)
      devices/                  CRUD máy chấm công
      locations/                CRUD địa điểm/geofence
      users/                    CRUD người dùng
      attendance/               nhận dữ liệu từ máy chấm công + nhập tay (API key máy)
      checkin/                  chấm công GPS từ điện thoại (session người dùng)
      reports/                  tính giờ công
      logs/                     xem nhật ký hệ thống
  lib/
    auth.ts                     cấu hình NextAuth, whitelist Google theo Employee
    odoo.ts                     client JSON-RPC gọi Odoo
    prisma.ts                   Prisma client singleton
    geo.ts                      tính khoảng cách GPS (Haversine)
    log.ts                      ghi audit log
prisma/
  schema.prisma                 User, Employee, Device, AttendanceLocation,
                                 AttendanceRecord, AuditLog
  seed.ts                       tạo tài khoản admin mặc định
```

## 1. Chạy thử ở máy local

```bash
npm install
cp .env.example .env
# điền DATABASE_URL, NEXTAUTH_SECRET, thông tin ODOO_*
npx prisma db push
npm run db:seed        # tạo tài khoản admin@company.com / Admin@123
npm run dev
```

Mở http://localhost:3000 → đăng nhập bằng tài khoản vừa seed → **đổi mật khẩu ngay** (tạo user mới ở trang Người dùng rồi xoá user mẫu, vì hệ thống hiện chưa có màn đổi mật khẩu tự phục vụ).

## 2. Kết nối Odoo

Trong Odoo: **Settings → Users & Companies → Users** → chọn user API → tab **Account Security** → **New API Key**. Điền vào `.env`:

```
ODOO_URL=https://ten-cong-ty.odoo.com
ODOO_DB=ten-database
ODOO_USERNAME=api-user@congty.com
ODOO_API_KEY=<api key vừa tạo>
```

Vào trang **Nhân viên** trong ứng dụng, nhấn **"Đồng bộ từ Odoo"**. Hệ thống gọi `hr.employee` (`search_read`) và upsert vào bảng `Employee` theo `odooId`.

## 3. Đăng nhập Google cho nhân viên (chấm công GPS)

1. Vào https://console.cloud.google.com/apis/credentials → **Create OAuth client ID** → loại **Web application**.
2. **Authorized redirect URI**: `https://ten-app.vercel.app/api/auth/callback/google` (và `http://localhost:3000/api/auth/callback/google` khi chạy local).
3. Điền `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` vào biến môi trường.
4. Đồng bộ nhân viên từ Odoo trước (bước 2) — hệ thống **chỉ cho phép đăng nhập Google nếu email trùng với một nhân viên đang hoạt động** trong bảng `Employee`. Gmail không có trong danh sách sẽ bị từ chối và được ghi vào Nhật ký hệ thống (`LOGIN_DENIED`).
5. Lần đăng nhập Google đầu tiên của một nhân viên sẽ tự động tạo tài khoản `User` vai trò `EMPLOYEE`, liên kết với hồ sơ nhân viên tương ứng — không cần admin tạo tay.

## 3b. Cấu hình địa điểm chấm công (geofence)

Vào trang **Địa điểm**, thêm địa điểm với toạ độ (lấy từ Google Maps: bấm giữ vị trí → copy toạ độ) và bán kính cho phép (mặc định 100m). Khi nhân viên bấm CHECK IN/OUT tại trang **Chấm công**:

- Trình duyệt lấy toạ độ GPS (`navigator.geolocation`) và gửi lên `/api/checkin`.
- Server tính khoảng cách tới địa điểm gần nhất (Haversine).
- Nếu trong bán kính → `VALID`. Nếu ngoài bán kính → vẫn ghi nhận nhưng đánh dấu `OUT_OF_RANGE` để quản lý xem lại trong Báo cáo/Lịch sử/Nhật ký (không chặn cứng, vì GPS điện thoại có thể lệch tạm thời — tránh nhân viên bị kẹt không chấm công được).
- Nếu độ chính xác GPS (`accuracy`) vượt quá 200m → đánh dấu `LOW_ACCURACY` (ngưỡng chỉnh trong `src/lib/geo.ts`).
- Mọi lượt chấm công GPS đều lưu kèm IP, user-agent, khoảng cách, độ chính xác — phục vụ chống gian lận.

## 3c. Xuất / Nhập Excel

Cả 3 trang đều có nút **"Xuất Excel"** (tải file `.xlsx`) và **"Nhập từ Excel"** (upload file, hệ thống tự đọc và ghi vào CSDL).

**Trang Nhân viên** — `/api/employees/export`, `/api/employees/import`
Dùng để bổ sung nhân viên **không có trong Odoo** (cộng tác viên, thuê ngoài) hoặc sửa hàng loạt phòng ban/chức danh. Cột nhận diện khi nhập: `Mã Odoo` (tuỳ chọn), `Họ tên`, `Email`, `Phòng ban`, `Chức danh`, `Trạng thái`. Khớp dòng theo `Mã Odoo` nếu có, không thì theo `Email`.

**Trang Giờ làm việc** — `/api/schedules/export`, `/api/schedules/import`
Xuất ra danh sách nhân viên kèm ca đang gán. Nhập vào để gán ca hàng loạt: cột `Email`, `Ca làm việc` (tên ca — nếu đã tồn tại thì gán, nếu chưa có thì tự tạo mới khi kèm đủ `Giờ bắt đầu`, `Giờ kết thúc`, `Ngày làm việc`, `Số giờ chuẩn/ngày`).

**Trang Báo cáo** — `/api/reports/export`, `/api/attendance/import`
Xuất báo cáo giờ công theo khoảng ngày đang xem. Nhập để bổ sung/hiệu chỉnh chấm công hàng loạt (nhân viên quên chấm công, nạp dữ liệu cũ): cột `Email`, `Loại` (`CHECK_IN`/`CHECK_OUT` hoặc `Vào`/`Ra`), `Thời gian`, `Ghi chú` (tuỳ chọn). Bản ghi tạo ra có `source = MANUAL`.

Thư viện dùng: [`xlsx` (SheetJS)](https://www.npmjs.com/package/xlsx) — đọc/ghi trực tiếp trong API route, không cần dịch vụ ngoài.

## 4. Kết nối máy chấm công

Ở trang **Máy chấm công**, thêm máy để lấy `apiKey`. Cấu hình máy (hoặc middleware trung gian nếu máy không hỗ trợ HTTP trực tiếp, ví dụ dùng driver ZKTeco/SDK đẩy qua một script Python/Node nhỏ) gửi:

```
POST https://ten-mien-cua-ban.vercel.app/api/attendance
Header: x-device-api-key: <api key của máy>
Content-Type: application/json

{
  "odooId": 123,
  "type": "CHECK_IN",
  "checkTime": "2026-09-13T08:02:00Z"
}
```

`type` là `CHECK_IN` hoặc `CHECK_OUT`. Có thể dùng `employeeId` (id nội bộ) thay cho `odooId` nếu tiện hơn.

## 5. Đưa code lên GitHub

```bash
git init
git add .
git commit -m "Khởi tạo hệ thống chấm công"
git branch -M main
git remote add origin https://github.com/<ten-user>/<ten-repo>.git
git push -u origin main
```

## 6. Triển khai lên Vercel

1. Tạo database Postgres (Vercel Postgres, Neon, hoặc Supabase đều được) — lấy `DATABASE_URL`.
2. Vào https://vercel.com/new → **Import** repo GitHub vừa tạo.
3. Trong **Environment Variables**, thêm toàn bộ biến trong `.env.example`:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (chạy `openssl rand -base64 32` để tạo)
   - `NEXTAUTH_URL` = URL production, ví dụ `https://ten-app.vercel.app`
   - `ODOO_URL`, `ODOO_DB`, `ODOO_USERNAME`, `ODOO_API_KEY`
   - `DEVICE_WEBHOOK_SECRET` (tuỳ chọn, dùng nếu bạn muốn thêm lớp bảo vệ chung ngoài API key riêng từng máy)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (bỏ trống nếu chưa dùng chấm công GPS — nút "Đăng nhập bằng Google" tự ẩn tính năng ở backend khi thiếu 2 biến này)
4. Deploy. Sau khi deploy lần đầu, chạy migrate + seed một lần bằng cách kết nối `DATABASE_URL` từ máy local:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
5. Truy cập domain Vercel, đăng nhập, đổi/roll tài khoản admin mẫu.

## Ghi chú bảo mật trước khi dùng thật

- Xoá hoặc đổi ngay tài khoản seed `admin@company.com`.
- Thêm chức năng đổi mật khẩu tự phục vụ nếu cần (hiện chỉ ADMIN mới tạo/sửa được user).
- Cân nhắc giới hạn IP hoặc dùng mạng nội bộ/VPN cho endpoint `/api/attendance` nếu máy chấm công đặt tại nhiều chi nhánh có IP cố định.
- Bản báo cáo hiện tính giờ công đơn giản bằng cách ghép cặp CHECK_IN/CHECK_OUT theo thứ tự thời gian; nếu cần xử lý ca đêm, nhiều lần ra/vào trong ngày phức tạp hơn, hãy điều chỉnh logic trong `src/app/api/reports/route.ts`.
- Chấm công GPS `OUT_OF_RANGE`/`LOW_ACCURACY` hiện **không bị chặn**, chỉ đánh dấu để quản lý xem lại (chủ động đánh đổi giữa chống gian lận và tránh nhân viên bị kẹt vì GPS lệch). Nếu muốn chặn cứng khi ngoài phạm vi, sửa điều kiện trong `src/app/api/checkin/route.ts`.

## Những phần trong tài liệu tham khảo (Google OAuth/Supabase/GPS) chưa/không triển khai như bản gốc

- Dùng **Prisma + Postgres** thay vì Supabase client trực tiếp — nghĩa là phân quyền được kiểm tra ở tầng API (Node), **không dùng Row Level Security (RLS) ở tầng database**. Vẫn chạy tốt trên Postgres của Supabase nếu bạn chọn Supabase làm nơi lưu trữ, chỉ là không tận dụng RLS của Supabase.
- **RBAC dạng permission theo checkbox** (Settings → Permissions) chưa có — hiện chỉ có 3 role cố định (ADMIN/MANAGER/EMPLOYEE) kiểm tra trực tiếp trong code. Có thể bổ sung bảng `Permission`/`RolePermission` nếu cần phân quyền chi tiết hơn.
- **Xuất CSV/PDF** chưa có — hiện chỉ có Excel (.xlsx) cho Nhân viên/Giờ làm việc/Báo cáo.
- **Trang Cài đặt kết nối** (test Odoo/Google ngay trong UI) chưa có — hiện cấu hình hoàn toàn qua biến môi trường.
- Bottom navigation cho mobile chưa tách riêng — sidebar hiện dùng chung, tự thu gọn theo màn hình nhưng chưa có thanh điều hướng dưới kiểu app di động.

Nếu cần bổ sung phần nào ở trên, cứ nói cụ thể để tôi làm tiếp.

## Khắc phục lỗi thường gặp khi deploy

### `Error: Could not find Prisma Schema that is required for this command`

Prisma không tìm thấy `prisma/schema.prisma` lúc build trên Vercel. Kiểm tra theo thứ tự:

1. **Mở repo trên GitHub (giao diện web)**, kiểm tra `package.json` có nằm ngay ở thư mục gốc repo không, và có tồn tại đường dẫn `prisma/schema.prisma` không. Lỗi phổ biến nhất: khi giải nén file zip rồi kéo cả thư mục vào Git, cấu trúc bị lồng thêm một cấp, ví dụ `attendance-app/attendance-app/package.json` thay vì `attendance-app/package.json`. Nếu bị vậy: vào đúng thư mục chứa `package.json`, `git add .` lại từ đó, hoặc xoá cấp thư mục thừa rồi push lại.
2. **Vercel → Project → Settings → General → Root Directory**: nếu repo có `package.json` ngay ở gốc, để trống (hoặc `.`). Nếu code nằm trong thư mục con (VD `attendance-app/`), phải điền đúng tên thư mục đó vào Root Directory.
3. Đảm bảo `prisma/schema.prisma` **đã thực sự được commit** — chạy `git status` / `git ls-files prisma/` ở máy local để chắc chắn file không bị bỏ sót.
4. Sau khi sửa, `package.json` trong bản này đã chỉ định rõ đường dẫn schema (`prisma generate --schema=./prisma/schema.prisma`) và thêm bước `postinstall` để Prisma Client luôn được tạo lại đúng cách theo khuyến nghị chính thức của Vercel — không cần sửa gì thêm, chỉ cần cấu trúc thư mục ở bước 1–2 đúng.
