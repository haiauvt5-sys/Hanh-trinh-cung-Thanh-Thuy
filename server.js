const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data-khach-hang.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

function readCustomers() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Lỗi đọc data-khach-hang.json:', err);
    return [];
  }
}

function writeCustomers(customers) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(customers, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Lỗi ghi data-khach-hang.json:', err);
    return false;
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = req.url.split('?')[0];

  // API: Lấy danh sách khách hàng
  if (req.method === 'GET' && parsedUrl === '/api/customers') {
    const customers = readCustomers();
    sendJson(res, 200, { success: true, total: customers.length, data: customers });
    return;
  }

  // API: Thêm khách hàng mới
  if (req.method === 'POST' && parsedUrl === '/api/customers') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const item = JSON.parse(body || '{}');
        if (!item.name && !item.phone) {
          sendJson(res, 400, { success: false, message: 'Thiếu tên hoặc số điện thoại' });
          return;
        }

        const customers = readCustomers();
        const now = new Date();
        const dateStr = now.getFullYear() + '-' +
          String(now.getMonth() + 1).padStart(2, '0') + '-' +
          String(now.getDate()).padStart(2, '0') + ' ' +
          String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0') + ':' +
          String(now.getSeconds()).padStart(2, '0');

        const newCustomer = {
          id: item.id || Date.now().toString(),
          createdAt: item.createdAt || dateStr,
          name: item.name || 'Khách ghé thăm',
          phone: item.phone || '',
          email: item.email || '',
          product: item.product || 'Tư vấn chung',
          price: item.price || 0,
          note: item.note || '',
          type: item.type || 'Đăng ký',
          status: item.status || 'Chưa liên hệ'
        };

        // Thêm vào đầu danh sách (mới nhất lên trên)
        customers.unshift(newCustomer);
        writeCustomers(customers);

        console.log(`[DATA MỚI] Khách hàng: ${newCustomer.name} (${newCustomer.phone}) - ${newCustomer.product}`);
        sendJson(res, 200, { success: true, message: 'Đã lưu thông tin khách hàng', data: newCustomer });
      } catch (e) {
        sendJson(res, 500, { success: false, message: 'Lỗi parse dữ liệu JSON' });
      }
    });
    return;
  }

  // API: Cập nhật trạng thái khách hàng
  if (req.method === 'POST' && parsedUrl === '/api/customers/update') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const customers = readCustomers();
        const idx = customers.findIndex(c => c.id === payload.id);
        if (idx !== -1) {
          if (payload.status) customers[idx].status = payload.status;
          if (payload.note !== undefined) customers[idx].note = payload.note;
          writeCustomers(customers);
          sendJson(res, 200, { success: true, data: customers[idx] });
        } else {
          sendJson(res, 404, { success: false, message: 'Không tìm thấy khách hàng' });
        }
      } catch (e) {
        sendJson(res, 500, { success: false, message: 'Lỗi xử lý yêu cầu' });
      }
    });
    return;
  }

  // API: Xóa khách hàng
  if (req.method === 'POST' && parsedUrl === '/api/customers/delete') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        let customers = readCustomers();
        customers = customers.filter(c => c.id !== payload.id);
        writeCustomers(customers);
        sendJson(res, 200, { success: true, message: 'Đã xóa' });
      } catch (e) {
        sendJson(res, 500, { success: false, message: 'Lỗi xử lý yêu cầu' });
      }
    });
    return;
  }

  // Phục vụ Static Files
  let reqUrl = decodeURI(parsedUrl);
  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  const filePath = path.join(ROOT, reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server Hành Trình Cùng Thanh Thủy đang chạy tại http://localhost:${PORT}`);
  console.log(`Trang Quản Trị Data Khách Hàng: http://localhost:${PORT}/quan-tri-data.html`);
});
