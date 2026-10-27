# 🌿 HƯỚNG DẪN KẾT NỐI TỰ ĐỘNG LƯU DATA VÀO GOOGLE SHEETS (GOOGLE TRANG TÍNH)

Chào **Xếp Thủy**! 
Sau khi hoàn thành 5 bước đơn giản này (chỉ mất khoảng **2 phút**), mỗi khi có bất kỳ ai bấm Đặt Ebook trên Website (dù ở điện thoại hay máy tính), dữ liệu sẽ **ngay lập tức tự động nhảy vào Google Sheet** của Xếp!

---

### 📌 BƯỚC 1: TẠO MỘT TRANG TÍNH GOOGLE MỚI
1. Mở trình duyệt Web (Chrome, Edge hoặc Cốc Cốc).
2. Truy cập vào trang: [sheet.new](https://sheet.new) (hoặc vào Google Drive -> Bấm **Mới** -> Chọn **Google Trang tính**).
3. Đổi tên trang tính ở góc trên bên trái thành: **Data Khách Hàng - Thanh Thủy** (hoặc tên gì Xếp thích).

---

### 📌 BƯỚC 2: MỞ BỘ LẬP TRÌNH APPS SCRIPT
1. Trên thanh menu trên cùng của Google Sheet, Xếp bấm vào mục **Tiện ích mở rộng** (tiếng Anh là *Extensions*).
2. Chọn **Apps Script**.
3. Một tab trình duyệt mới sẽ mở ra với giao diện lập trình.

---

### 📌 BƯỚC 3: DÁN MÃ TỰ ĐỘNG HÓA
1. Trong cửa sổ Apps Script, Xếp xóa hết các chữ cũ có sẵn (ví dụ chữ `function myFunction() { ... }`).
2. Mở file [google-sheets-script.js](google-sheets-script.js) (nằm ngay trong thư mục này), copy toàn bộ nội dung trong đó và **Dán vào ô soạn thảo Apps Script**.
3. *(Tùy chọn)*: Ở dòng số 17, Xếp có thể điền Gmail của mình vào `var NOTIFY_EMAIL = "email_cua_xep@gmail.com";` nếu muốn điện thoại tự rung chuông báo mỗi khi có khách mua!
4. Bấm vào biểu tượng **Lưu** (hình chiếc đĩa mềm 💾 hoặc ấn `Ctrl + S`).

---

### 📌 BƯỚC 4: TRIỂN KHAI THÀNH WEB APP
1. Ở góc trên bên phải màn hình Apps Script, bấm vào nút màu xanh: **Triển khai** (*Deploy*) -> Chọn **Tùy chọn triển khai mới** (*New deployment*).
2. Tại bánh răng **Chọn loại** (*Select type*), chọn: **Ứng dụng web** (*Web app*).
3. Điền các ô như sau:
   - **Mô tả** (*Description*): `Lưu data website Thanh Thủy`
   - **Thực thi dưới dạng** (*Execute as*): Chọn **Tôi** (*Me - email của Xếp*)
   - **Ai có quyền truy cập** (*Who has access*): Chọn **Bất kỳ ai** (*Anyone*) ⚠️ *(Quan trọng: phải chọn "Bất kỳ ai" thì khách hàng trên web mới gửi data vào được)*
4. Bấm nút **Triển khai** (*Deploy*).
5. Nếu Google hiện bảng yêu cầu cấp quyền:
   - Bấm **Ủy quyền truy cập** (*Authorize access*) -> Chọn tài khoản Google của Xếp.
   - Bấm vào dòng chữ nhỏ: **Nâng cao** (*Advanced*) -> Bấm tiếp vào **Đi tới [Dự án không có tiêu đề] (không an toàn)**.
   - Bấm **Cho phép** (*Allow*).
6. Sau khi hoàn tất, Google sẽ cấp cho Xếp một dòng link dạng:
   👉 `https://script.google.com/macros/s/AKfycb.../exec`
7. Bấm nút **Sao chép** (*Copy*) đường link đó!

---

### 📌 BƯỚC 5: GẮN LINK VÀO WEBSITE & ĐẨY LÊN GITHUB
1. Mở file [config.js](config.js) trong thư mục này.
2. Dán đường link vừa copy vào ô `GOOGLE_SHEET_URL`:
   ```javascript
   window.APP_CONFIG = {
     GOOGLE_SHEET_URL: "https://script.google.com/macros/s/AKfycb.../exec",
     ...
   ```
   *(Hoặc Xếp gửi thẳng đường link đó vào đây cho em, em dán hộ Xếp luôn ạ!)*
3. Nhấp đúp chuột vào file **`Day_Len_GitHub.bat`** để đưa trang web mới cập nhật lên mạng!

---

🎉 **THÀNH CÔNG RỰC RỠ:**
Từ giây phút này, bất kể lúc nào khách điền thông tin mua sách, Google Sheet trên điện thoại của Xếp sẽ tự động ghi nhận ngay lập tức, không bao giờ lo bị trôi hay mất dữ liệu nữa!
