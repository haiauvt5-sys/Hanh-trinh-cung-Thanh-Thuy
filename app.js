/**
 * HÀNH TRÌNH CÙNG THANH THỦY - CORE JAVASCRIPT
 * Xử lý: Đặt hàng nhanh qua Zalo, Xem trước mục lục, Lọc Ebook, Giỏ hàng, Responsive Nav
 */

// Danh mục dữ liệu Ebook (Sẵn sàng để Xếp cập nhật Ebook thật)
const EBOOKS_DATA = {};

// Biến trạng thái
let currentSelectedProduct = null;
let cart = [];
const SELLER_PHONE = '0978864099';
const ZALO_LINK = `https://zalo.me/${SELLER_PHONE}`;

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

// Bấm Đặt Mua Nhanh từ card Ebook
function quickOrder(ebookId) {
  const product = EBOOKS_DATA[ebookId] || EBOOKS_DATA.eb4;
  currentSelectedProduct = product;

  document.getElementById('modalProductName').innerText = product.name;
  document.getElementById('summaryTitle').innerText = product.shortName;
  document.getElementById('summaryPrice').innerText = formatMoney(product.price);

  openModal('orderModal');
}

// Bấm Đặt Mua từ Preview Modal
function orderFromPreview() {
  closeModal('previewModal');
  quickOrder(currentSelectedProduct.id);
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

// Xử lý gửi đơn hàng trực tiếp qua Zalo của Xếp Thủy
function sendOrderViaZalo() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const note = document.getElementById('custNote').value.trim();

  if (!name) {
    alert('Dạ bạn vui lòng nhập Họ Tên để Thủy tiện xưng hô và hỗ trợ nhé ạ!');
    document.getElementById('custName').focus();
    return;
  }

  if (!phone) {
    alert('Dạ bạn vui lòng nhập Số Điện Thoại / Zalo để nhận Ebook nhé ạ!');
    document.getElementById('custPhone').focus();
    return;
  }

  // Tự động ghi nhận Data khách hàng vào hệ thống quản trị
  saveCustomerToBackend({
    name: name,
    phone: phone,
    email: email,
    note: note,
    product: currentSelectedProduct ? currentSelectedProduct.name : 'Ebook Dinh Dưỡng',
    price: currentSelectedProduct ? currentSelectedProduct.price : 0,
    type: 'Đặt Ebook'
  });

  // Soạn nội dung tin nhắn gửi qua Zalo chuẩn chỉn
  const message = `🌿 ĐƠN ĐẶT EBOOK - HÀNH TRÌNH CÙNG THANH THỦY\n` +
    `--------------------------------\n` +
    `• Sản phẩm: ${currentSelectedProduct.name}\n` +
    `• Giá ưu đãi: ${formatMoney(currentSelectedProduct.price)}\n` +
    `--------------------------------\n` +
    `• Người nhận: ${name}\n` +
    `• Số điện thoại/Zalo: ${phone}\n` +
    (email ? `• Email nhận sách: ${email}\n` : '') +
    (note ? `• Chia sẻ của bạn: ${note}\n` : '') +
    `--------------------------------\n` +
    `Chào Thủy, mình vừa đặt đơn trên website. Nhờ Thủy hướng dẫn mình thanh toán và gửi cẩm nang Ebook cho mình nhé!`;

  // Sao chép tin nhắn vào clipboard để người dùng có thể dán nếu cần
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).catch(() => {});
  }

  // Mở Zalo kết nối trực tiếp tới số điện thoại của Xếp
  alert(`Cảm ơn bạn ${name}! Hệ thống sẽ mở Zalo của Thanh Thủy (0978 864 099) ngay bây giờ. Bạn chỉ cần bấm "Gửi" để Thủy gửi Ebook cho bạn nhé! 🌿`);
  
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
