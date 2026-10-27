/**
 * ==============================================================================
 * HÀNH TRÌNH CÙNG THANH THỦY - GOOGLE APPS SCRIPT LƯU DATA KHÁCH HÀNG TỰ ĐỘNG
 * ==============================================================================
 * 
 * Mã nguồn này dùng để gắn vào Google Sheets (Google Trang Tính).
 * Tác dụng:
 * 1. Tự động nhận thông tin khách hàng từ Website (kể cả khi chạy trên GitHub Pages).
 * 2. Tự động thêm dòng mới vào Google Sheet: Thời gian, Tên, SĐT, Email, Ebook, Số tiền, Mã CK...
 * 3. Tự động cập nhật nếu khách bấm xác nhận chuyển khoản.
 * 4. Cho phép trang quản trị tải trực tiếp danh sách khách để xem trên máy tính/điện thoại.
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH (MẤT 2 PHÚT): Xem chi tiết trong file HUONG_DAN_KET_NOI_GOOGLE_SHEET.md
 */

// ĐIỀN EMAIL CỦA XẾP NẾU MUỐN NHẬN THÔNG BÁO VỀ GMAIL MỖI KHI CÓ KHÁCH MUA (Tùy chọn)
var NOTIFY_EMAIL = ""; // Ví dụ: "thuythuy@gmail.com" (để trống nếu không cần nhận email)

/**
 * Xử lý khi có khách đặt Ebook / Đăng ký từ Website gửi về (POST request)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Khóa tránh xung đột nếu nhiều khách gửi cùng lúc

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 1. Nếu Sheet mới tinh chưa có tiêu đề thì tự tạo hàng tiêu đề chuẩn đẹp
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời Gian",
        "Họ Và Tên",
        "Số Điện Thoại",
        "Email",
        "Ebook / Sản Phẩm",
        "Số Tiền (VNĐ)",
        "Nội Dung Chuyển Khoản",
        "Chia Sẻ / Nhu Cầu Của Khách",
        "Loại Đăng Ký",
        "Trạng Thái Xử Lý"
      ]);
      
      // Định dạng giao diện hàng tiêu đề (Tone Xanh Thảo Mộc sang trọng)
      var headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setBackground("#1e4d3b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
      sheet.setRowHeight(1, 35);
    }

    // 2. Phân tích dữ liệu gửi lên từ Website
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var time = data.createdAt || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var name = (data.name || "Khách ghé thăm").trim();
    var cleanPhone = (data.phone || "").replace(/[^0-9]/g, '');
    var phone = cleanPhone ? "'" + cleanPhone : ""; // Thêm dấu nháy đơn để Google Sheet không làm mất số 0 đầu
    var email = (data.email || "").trim();
    var product = (data.product || "Ebook").trim();
    var price = data.price || 0;
    var memo = (data.memo || "").trim();
    var note = (data.note || "").trim();
    var type = (data.type || "Đặt Ebook").trim();
    var status = (data.status || "Chưa liên hệ").trim();

    // 3. Kiểm tra xem khách này vừa điền trước đó ít phút hay không (tránh trùng lặp dòng)
    var lastRow = sheet.getLastRow();
    var updated = false;

    if (lastRow > 1 && cleanPhone) {
      var startRow = Math.max(2, lastRow - 15);
      var numRows = lastRow - startRow + 1;
      var range = sheet.getRange(startRow, 1, numRows, 10);
      var values = range.getValues();

      for (var i = values.length - 1; i >= 0; i--) {
        var existingPhone = String(values[i][2]).replace(/[^0-9]/g, '');
        if (existingPhone === cleanPhone) {
          // Trùng số điện thoại vừa gửi: cập nhật trạng thái mới nhất
          var targetRow = startRow + i;
          if (status) sheet.getRange(targetRow, 10).setValue(status);
          if (memo) sheet.getRange(targetRow, 7).setValue(memo);
          if (note && !values[i][7]) sheet.getRange(targetRow, 8).setValue(note);
          updated = true;
          break;
        }
      }
    }

    // 4. Nếu là khách mới thì thêm dòng mới vào cuối bảng
    if (!updated) {
      sheet.appendRow([
        time,
        name,
        phone,
        email,
        product,
        price,
        memo,
        note,
        type,
        status
      ]);

      // Canh lề cột số điện thoại và thời gian cho đẹp
      var newRowIdx = sheet.getLastRow();
      sheet.getRange(newRowIdx, 1).setHorizontalAlignment("center");
      sheet.getRange(newRowIdx, 3).setHorizontalAlignment("center");
      sheet.getRange(newRowIdx, 6).setNumberFormat("#,##0").setHorizontalAlignment("right");
      sheet.getRange(newRowIdx, 10).setHorizontalAlignment("center");
    }

    // 5. Gửi Email thông báo tới Xếp (nếu có cài đặt NOTIFY_EMAIL)
    if (NOTIFY_EMAIL && NOTIFY_EMAIL.indexOf("@") !== -1 && !updated) {
      try {
        var subject = "🌿 [Đơn Mới] " + name + " vừa đặt: " + product;
        var body = "Chào Xếp Thanh Thủy,\n\n" +
          "Hệ thống vừa ghi nhận một khách hàng mới từ Website:\n" +
          "-----------------------------------------\n" +
          "• Khách hàng: " + name + "\n" +
          "• Số điện thoại / Zalo: " + (data.phone || "") + "\n" +
          (email ? "• Email: " + email + "\n" : "") +
          "• Cuốn Ebook: " + product + "\n" +
          "• Số tiền: " + (price ? Number(price).toLocaleString('vi-VN') + " đ" : "0 đ") + "\n" +
          "• Nội dung chuyển khoản: " + memo + "\n" +
          (note ? "• Lời nhắn / Nhu cầu: " + note + "\n" : "") +
          "• Thời gian: " + time + "\n" +
          "-----------------------------------------\n" +
          "Xếp có thể mở Zalo để kết nối và gửi sách cho khách ngay nhé!\n\n" +
          "Chúc Xếp ngày mới an lành và tràn đầy năng lượng! 🌿";
        MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
      } catch (mailErr) {
        // Bỏ qua lỗi gửi mail nếu vượt quota
      }
    }

    // Trả về kết quả JSON thành công
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Đã lưu thông tin khách hàng vào Google Sheet thành công",
      updated: updated
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Xử lý khi Trang Quản Trị tải danh sách khách hàng về xem (GET request)
 */
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        total: 0,
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var values = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    var list = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var rawDate = row[0];
      var dateStr = (rawDate instanceof Date) 
        ? Utilities.formatDate(rawDate, "GMT+7", "yyyy-MM-dd HH:mm:ss") 
        : String(rawDate);

      list.push({
        id: "gs_" + (i + 1),
        createdAt: dateStr,
        name: String(row[1] || ""),
        phone: String(row[2] || "").replace(/^'/, ''),
        email: String(row[3] || ""),
        product: String(row[4] || ""),
        price: Number(row[5]) || 0,
        memo: String(row[6] || ""),
        note: String(row[7] || ""),
        type: String(row[8] || "Đặt Ebook"),
        status: String(row[9] || "Chưa liên hệ")
      });
    }

    // Đảo ngược danh sách để khách mới nhất lên đầu bảng
    list.reverse();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      total: list.length,
      data: list
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: err.toString(),
      data: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
