/**
 * HÀNH TRÌNH CÙNG THANH THỦY - CORE JAVASCRIPT
 * Xử lý: Đặt hàng nhanh qua Zalo, Xem trước mục lục, Lọc Ebook, Giỏ hàng, Responsive Nav
 */

// Danh mục dữ liệu Ebook
const EBOOKS_DATA = {
  eb1: {
    id: 'eb1',
    name: 'Bạn Có Quyền Lựa Chọn',
    shortName: 'Ebook: Bạn Có Quyền Lựa Chọn',
    price: 199000,
    pages: '7 Chương • Đọc Lật Trang Online'
  },
  eb2: {
    id: 'eb2',
    name: 'Phần Lớn Bạn Là Nước',
    shortName: 'Ebook: Phần Lớn Bạn Là Nước',
    price: 199000,
    pages: '5 Chương • Đọc Lật Trang Online'
  },
  eb3: {
    id: 'eb3',
    name: 'Bạn Được Làm Từ Bữa Ăn Của Mình',
    shortName: 'Ebook: Bạn Được Làm Từ Bữa Ăn',
    price: 199000,
    pages: '6 Chương • Đọc Lật Trang Online'
  },
  eb4: {
    id: 'eb4',
    name: 'Giữ Trọn Bữa Ăn Trong Tủ Lạnh',
    shortName: 'Ebook: Giữ Trọn Bữa Ăn Trong Tủ Lạnh',
    price: 199000,
    pages: '5 Chương • Đọc Lật Trang Online'
  },
  eb_combo: {
    id: 'eb_combo',
    name: 'Trọn Bộ 4 Cẩm Nang Dinh Dưỡng & Sống Chủ Động',
    shortName: 'Trọn Bộ 4 Cẩm Nang Ebook',
    price: 499000,
    pages: 'Trọn bộ 4 Ebook + Sổ tay 30 ngày lắng nghe cơ thể'
  }
};

// Biến trạng thái
let currentSelectedProduct = null;
let cart = [];
const SELLER_PHONE = '0978864099';
const ZALO_LINK = `https://zalo.me/${SELLER_PHONE}`;
const BANK_ACCOUNT = '107600795568';
const BANK_NAME = 'VietinBank';
const ACCOUNT_HOLDER = 'TRIỆU THỊ THANH THỦY';

// Format tiền tệ VNĐ
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFilters();
  initScrollTop();
  loadCartFromStorage();
});

/* --------------------------------------------------------------------------
   NAVIGATION & SCROLL
   -------------------------------------------------------------------------- */
function initNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      });
    });
  }

  // Active link khi cuộn trang
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

function initScrollTop() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   EBOOK FILTERING
   -------------------------------------------------------------------------- */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.ebook-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = card.classList.contains('combo-card') ? 'grid' : 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   MODAL CONTROLS
   -------------------------------------------------------------------------- */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Đóng modal khi bấm ra ngoài vùng dialog
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

/* --------------------------------------------------------------------------
   ORDER FLOW & ZALO CHECKOUT
   -------------------------------------------------------------------------- */

// Mở Modal liên hệ Zalo & xem mã QR
function openZaloModal() {
  switchZaloQrTab('zalo'); // reset về tab Zalo
  openModal('zaloModal');
}

// Chuyển đổi qua lại giữa Tab QR Zalo và QR Ngân Hàng VietinBank
function switchZaloQrTab(tabType) {
  const qrImg = document.getElementById('zaloModalQrImg');
  const qrHint = document.getElementById('zaloModalQrHint');
  const qrDirect = document.getElementById('zaloModalDirectLink');
  const tabZalo = document.getElementById('tabQrZalo');
  const tabBank = document.getElementById('tabQrBank');

  if (tabType === 'bank') {
    if (qrImg) qrImg.src = 'vietinbank-qr-chuan.jpg';
    if (qrHint) qrHint.innerHTML = '<i class="fa-solid fa-building-columns"></i> Quét bằng <strong>App Ngân Hàng</strong> để chuyển khoản nhanh 24/7';
    if (qrDirect) {
      qrDirect.href = 'javascript:void(0)';
      qrDirect.onclick = copyBankAccount;
      qrDirect.innerHTML = 'Bấm để sao chép số tài khoản VietinBank <i class="fa-regular fa-copy"></i>';
    }
    if (tabZalo) tabZalo.classList.remove('active');
    if (tabBank) tabBank.classList.add('active');
  } else {
    if (qrImg) qrImg.src = 'zalo-qr-code.png';
    if (qrHint) qrHint.innerHTML = '<i class="fa-solid fa-qrcode"></i> Mở Zalo, bấm <strong>quét QR</strong> để kết nối trên điện thoại';
    if (qrDirect) {
      qrDirect.href = 'https://zalo.me/0978864099';
      qrDirect.onclick = null;
      qrDirect.innerHTML = 'Hoặc bấm mở Zalo trên máy tính <i class="fa-solid fa-arrow-up-right-from-square"></i>';
    }
    if (tabZalo) tabZalo.classList.add('active');
    if (tabBank) tabBank.classList.remove('active');
  }
}

// Sao chép số tài khoản VietinBank
function copyBankAccount() {
  const acc = '107600795568';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(acc).then(() => {
      alert('Đã sao chép số tài khoản VietinBank: 107600795568! 🌿');
    }).catch(() => {
      prompt('Số tài khoản VietinBank của Thanh Thủy:', acc);
    });
  } else {
    prompt('Số tài khoản VietinBank của Thanh Thủy:', acc);
  }
}

// Sao chép số điện thoại Zalo
function copyZaloPhone() {
  const phone = '0978864099';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(phone).then(() => {
      alert('Đã sao chép số Zalo Thanh Thủy: 0978 864 099! 🌿');
    }).catch(() => {
      prompt('Số điện thoại Zalo của Thanh Thủy:', phone);
    });
  } else {
    prompt('Số điện thoại Zalo của Thanh Thủy:', phone);
  }
}

// Biến lưu thông tin đơn hàng hiện tại
let currentOrderData = {
  name: '',
  phone: '',
  email: '',
  note: '',
  memo: ''
};

// Bấm Đặt Mua Nhanh từ card Ebook
function quickOrder(ebookId) {
  const product = EBOOKS_DATA[ebookId] || EBOOKS_DATA.eb2;
  currentSelectedProduct = product;

  // Reset về Bước 1
  backToStep1(false);

  const modalNameEl = document.getElementById('modalProductName');
  const summaryTitleEl = document.getElementById('summaryTitle');
  const summaryPriceEl = document.getElementById('summaryPrice');

  if (modalNameEl) modalNameEl.innerText = product.name;
  if (summaryTitleEl) summaryTitleEl.innerText = product.shortName;
  if (summaryPriceEl) summaryPriceEl.innerText = formatMoney(product.price);

  openModal('orderModal');
}

// Bấm Đặt Mua từ Preview Modal
function orderFromPreview() {
  closeModal('previewModal');
  quickOrder(currentSelectedProduct.id);
}

// Chuyển sang Bước 2: Thanh toán VietQR & Kích hoạt
function goToStep2Payment() {
  const nameInput = document.getElementById('custName');
  const phoneInput = document.getElementById('custPhone');
  const emailInput = document.getElementById('custEmail');
  const noteInput = document.getElementById('custNote');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const note = noteInput ? noteInput.value.trim() : '';

  if (!name) {
    alert('Dạ bạn vui lòng nhập Họ Tên để Thủy tiện xưng hô và gửi sách nhé ạ!');
    if (nameInput) nameInput.focus();
    return;
  }

  // Kiểm tra số điện thoại cơ bản
  const phoneClean = phone.replace(/[^0-9]/g, '');
  if (!phone || phoneClean.length < 9) {
    alert('Dạ bạn vui lòng nhập Số Điện Thoại / Zalo hợp lệ để Thủy gửi link nhận Ebook nhé ạ!');
    if (phoneInput) phoneInput.focus();
    return;
  }

  const price = currentSelectedProduct ? currentSelectedProduct.price : 199000;
  const productName = currentSelectedProduct ? currentSelectedProduct.name : 'Ebook Dinh Dưỡng';

  // Tạo mã nội dung chuyển khoản gọn gàng, chuẩn ngân hàng: EB + SĐT + Tên
  const shortName = name.split(' ').pop().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '');
  const cleanMemo = `EB ${phoneClean.slice(-9)} ${shortName}`.trim();

  currentOrderData = {
    name: name,
    phone: phone,
    email: email,
    note: note,
    memo: cleanMemo
  };

  // 1. TỰ ĐỘNG LƯU NGAY THÔNG TIN KHÁCH HÀNG VÀO DATA (Đảm bảo không bao giờ rơi rụng data)
  saveCustomerToBackend({
    name: name,
    phone: phone,
    email: email,
    note: note,
    product: productName,
    price: price,
    memo: cleanMemo,
    type: 'Đặt Ebook'
  });

  // 2. Cập nhật thông tin hiển thị ở Bước 2
  const step2CustName = document.getElementById('step2CustName');
  const step2BookName = document.getElementById('step2BookName');
  const step2PriceVal = document.getElementById('step2PriceVal');
  const step2MemoVal = document.getElementById('step2MemoVal');
  const step2QrImg = document.getElementById('step2QrImage');

  if (step2CustName) step2CustName.innerText = name;
  if (step2BookName) step2BookName.innerText = productName;
  if (step2PriceVal) step2PriceVal.innerText = formatMoney(price);
  if (step2MemoVal) step2MemoVal.innerText = cleanMemo;

  // 3. Tạo mã VietQR trực tuyến sắc nét kèm đúng số tiền và nội dung chuyển khoản
  if (step2QrImg) {
    const encodedMemo = encodeURIComponent(cleanMemo);
    const dynamicQrUrl = `https://api.vietqr.io/image/970415-107600795568-compact2.jpg?amount=${price}&addInfo=${encodedMemo}&accountName=TRIEU%20THI%20THANH%20THUY`;
    step2QrImg.src = dynamicQrUrl;
    step2QrImg.onerror = function() {
      // Nếu thiết bị không có internet hoặc API chậm thì fallback về mã QR cục bộ
      this.src = 'vietinbank-qr-chuan.jpg';
    };
  }

  // 4. Chuyển đổi giao diện sang Bước 2
  const step1El = document.getElementById('orderStep1');
  const step2El = document.getElementById('orderStep2');
  const pill1 = document.getElementById('stepIndicator1');
  const pill2 = document.getElementById('stepIndicator2');
  const badgeEl = document.getElementById('modalStepBadge');

  if (step1El) step1El.style.display = 'none';
  if (step2El) step2El.style.display = 'block';
  if (pill1) pill1.classList.remove('active');
  if (pill2) pill2.classList.add('active');
  if (badgeEl) badgeEl.innerHTML = '✨ Bước 2/2: Quét Mã & Kích Hoạt Ebook';

  // Cuộn nhẹ lên đầu modal để khách nhìn trọn vẹn mã QR
  const modalDialog = document.querySelector('#orderModal .modal-dialog');
  if (modalDialog) modalDialog.scrollTop = 0;
}

// Quay lại Bước 1 sửa thông tin
function backToStep1(scroll = true) {
  const step1El = document.getElementById('orderStep1');
  const step2El = document.getElementById('orderStep2');
  const pill1 = document.getElementById('stepIndicator1');
  const pill2 = document.getElementById('stepIndicator2');
  const badgeEl = document.getElementById('modalStepBadge');

  if (step1El) step1El.style.display = 'block';
  if (step2El) step2El.style.display = 'none';
  if (pill1) pill1.classList.add('active');
  if (pill2) pill2.classList.remove('active');
  if (badgeEl) badgeEl.innerHTML = '🌿 Bước 1/2: Đăng Ký Nhận Ebook';

  if (scroll) {
    const modalDialog = document.querySelector('#orderModal .modal-dialog');
    if (modalDialog) modalDialog.scrollTop = 0;
  }
}

// Sao chép nội dung chuyển khoản ở Bước 2
function copyStep2Memo() {
  const memo = currentOrderData.memo || 'Mua Ebook';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(memo).then(() => {
      alert(`Đã sao chép nội dung chuyển khoản: "${memo}"! 🌿\nBạn chỉ cần dán vào mục Lời nhắn/Nội dung trong App Ngân Hàng nhé.`);
    }).catch(() => {
      prompt('Nội dung chuyển khoản:', memo);
    });
  } else {
    prompt('Nội dung chuyển khoản:', memo);
  }
}

// Tự động lưu thông tin khách hàng vào hệ thống
function saveCustomerToBackend(customerData) {
  try {
    // 1. Lưu dự phòng vào LocalStorage
    let list = [];
    try {
      const saved = localStorage.getItem('thuy_customers_cache');
      if (saved) list = JSON.parse(saved);
    } catch (e) { list = []; }
    
    const now = new Date();
    const dateStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    const item = {
      id: Date.now().toString(),
      createdAt: dateStr,
      ...customerData,
      status: 'Chưa liên hệ'
    };

    list.unshift(item);
    localStorage.setItem('thuy_customers_cache', JSON.stringify(list));

    // 2. Gửi API lên máy chủ nội bộ
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).catch(() => {});
  } catch (err) {
    console.warn('Lưu data khách hàng:', err);
  }
}

// Hoàn tất đơn hàng và mở Zalo kết nối với Xếp Thủy
function finishOrderAndOpenZalo() {
  const name = currentOrderData.name || (document.getElementById('custName') ? document.getElementById('custName').value.trim() : 'Bạn');
  const phone = currentOrderData.phone || (document.getElementById('custPhone') ? document.getElementById('custPhone').value.trim() : '');
  const email = currentOrderData.email || (document.getElementById('custEmail') ? document.getElementById('custEmail').value.trim() : '');
  const note = currentOrderData.note || (document.getElementById('custNote') ? document.getElementById('custNote').value.trim() : '');
  const memo = currentOrderData.memo || 'Mua Ebook';

  const productName = currentSelectedProduct ? currentSelectedProduct.name : 'Ebook Dinh Dưỡng';
  const price = currentSelectedProduct ? currentSelectedProduct.price : 199000;

  // Soạn nội dung tin nhắn gửi qua Zalo chuẩn chỉn, ấm áp
  const message = `🌿 ĐƠN ĐẶT EBOOK - HÀNH TRÌNH CÙNG THANH THỦY\n` +
    `--------------------------------\n` +
    `• Cuốn cẩm nang: ${productName}\n` +
    `• Giá ưu đãi: ${formatMoney(price)}\n` +
    `• Chuyển khoản VietinBank: STK 107600795568 (Triệu Thị Thanh Thủy)\n` +
    `• Nội dung CK: ${memo}\n` +
    `--------------------------------\n` +
    `• Người nhận: ${name}\n` +
    `• Số điện thoại/Zalo: ${phone}\n` +
    (email ? `• Email nhận sách: ${email}\n` : '') +
    (note ? `• Chia sẻ của bạn: ${note}\n` : '') +
    `--------------------------------\n` +
    `Chào Thủy, mình vừa chuyển khoản đặt cuốn "${productName}". Nhờ Thủy kiểm tra và gửi link đọc Ebook + quà tặng cho mình nhé! 🌿`;

  // Sao chép tin nhắn vào clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message).catch(() => {});
  }

  alert(`Cảm ơn bạn ${name}! Hệ thống sẽ mở Zalo của Thanh Thủy (0978 864 099) ngay bây giờ. Bạn chỉ cần gửi tin nhắn để Thủy gửi link đọc Ebook cho bạn ngay nhé! 🌿`);
  
  window.open(ZALO_LINK, '_blank');
  closeModal('orderModal');
}

function handleFormSubmit(e) {
  e.preventDefault();
  sendOrderViaZalo();
}

/* --------------------------------------------------------------------------
   PREVIEW MODAL (XEM MỤC LỤC)
   -------------------------------------------------------------------------- */
function openPreviewModal(ebookId) {
  const product = EBOOKS_DATA[ebookId];
  if (!product) return;

  currentSelectedProduct = product;
  document.getElementById('previewTitle').innerText = product.name;

  let html = `
    <div style="margin-bottom: 20px; padding: 12px 16px; background: #eaf5ef; border-radius: 8px; color: #1e4d3b; font-size: 0.9rem;">
      <strong><i class="fa-solid fa-circle-info"></i> Định dạng:</strong> ${product.pages} • Tải về đọc vĩnh viễn trên Điện thoại, Máy tính, Ipad.
    </div>
  `;

  product.chapters.forEach(chap => {
    html += `
      <div class="preview-chapter">
        <h4><i class="fa-solid fa-bookmark text-accent"></i> ${chap.title}</h4>
        <ul>
          ${chap.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  });

  document.getElementById('previewContent').innerHTML = html;
  openModal('previewModal');
}

/* --------------------------------------------------------------------------
   WAITLIST MODAL (KHÓA HỌC SẮP RA MẮT)
   -------------------------------------------------------------------------- */
function openRegisterWaitlist(courseName) {
  const promptPhone = prompt(`Dạ bạn muốn nhận thông tin lịch khai giảng cho "${courseName}"? Vui lòng nhập Số Zalo của bạn:`);
  if (promptPhone) {
    const promptName = prompt(`Cho Thủy xin Họ Tên của bạn để tiện xưng hô nhé:`) || 'Bạn đọc yêu mến';
    
    // Lưu data vào hệ thống quản trị
    saveCustomerToBackend({
      name: promptName,
      phone: promptPhone,
      email: '',
      note: `Đăng ký nhận thông tin lịch khai giảng`,
      product: courseName,
      price: 0,
      type: 'Đăng ký khóa học dự kiến'
    });

    alert(`Cảm ơn bạn! Thủy đã ghi nhận số ${promptPhone}. Khi khóa học có lịch khai giảng chính thức, Thủy sẽ ưu tiên nhắn bạn trước nhé! 🌿`);
    window.open(`https://zalo.me/${SELLER_PHONE}?text=${encodeURIComponent(`Chào Thủy, mình muốn nhận thông tin lịch khai giảng cho ${courseName} (SĐT Zalo của mình là: ${promptPhone})`)}`, '_blank');
  }
}

/* --------------------------------------------------------------------------
   CART LOGIC (MINI CART)
   -------------------------------------------------------------------------- */
const openCartBtn = document.getElementById('openCartBtn');
if (openCartBtn) {
  openCartBtn.addEventListener('click', () => {
    renderCart();
    openModal('cartModal');
  });
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('thuy_cart');
    if (saved) cart = JSON.parse(saved);
  } catch (e) {
    cart = [];
  }
  updateCartBadge();
}

function saveCartToStorage() {
  try {
    localStorage.setItem('thuy_cart', JSON.stringify(cart));
  } catch (e) {}
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.innerText = cart.length;
  }
}

function renderCart() {
  const container = document.getElementById('cartItemsList');
  const totalEl = document.getElementById('cartTotalPrice');

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #666;">
        <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color: #ccc; margin-bottom: 12px;"></i>
        <p>Giỏ hàng của bạn đang trống.</p>
        <a href="#ebooks" onclick="closeModal('cartModal')" style="color: #1e4d3b; font-weight: 600; text-decoration: underline;">Khám phá các cuốn Ebook ngay</a>
      </div>
    `;
    totalEl.innerText = '0đ';
    return;
  }

  let total = 0;
  let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';

  cart.forEach((item, index) => {
    total += item.price;
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fbf9f5; border-radius: 8px; border: 1px solid rgba(45,106,79,0.1);">
        <div>
          <strong style="display: block; font-size: 0.95rem; color: #1e4d3b;">${item.name}</strong>
          <span style="color: #c67d22; font-weight: 700; font-size: 0.9rem;">${formatMoney(item.price)}</span>
        </div>
        <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #dc2626; cursor: pointer; padding: 6px;" title="Xóa món này">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
  totalEl.innerText = formatMoney(total);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCartToStorage();
  renderCart();
}

function clearCart() {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
    cart = [];
    saveCartToStorage();
    renderCart();
  }
}

function checkoutFromCart() {
  if (cart.length === 0) {
    alert('Giỏ hàng chưa có sản phẩm nào ạ!');
    return;
  }
  closeModal('cartModal');
  // Mở modal order với tên tổng hợp
  currentSelectedProduct = {
    id: 'cart_custom',
    name: cart.map(i => i.name).join(' + '),
    shortName: `Giỏ hàng (${cart.length} món)`,
    price: cart.reduce((sum, i) => sum + i.price, 0)
  };
  quickOrder(currentSelectedProduct.id);
}
