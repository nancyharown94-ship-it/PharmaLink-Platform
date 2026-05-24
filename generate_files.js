const fs = require('fs');

const cssPath = 'assets/css/style.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('[dir="ltr"]')) {
    css += `
/* LTR support */
[dir="ltr"] .sidebar { right: auto; left: 0; border-left: none; border-right: 1px solid var(--border-color); }
[dir="ltr"] .main-content { margin-right: 0; margin-left: var(--sidebar-width); }
[dir="ltr"] .user-profile { margin-right: 0; margin-left: auto; }
[dir="ltr"] .price-main { direction: ltr; flex-direction: row-reverse; justify-content: flex-end; }
@media (max-width: 768px) {
  [dir="ltr"] .sidebar { transform: translateX(-100%); }
  [dir="ltr"] .sidebar.active { transform: translateX(0); }
  [dir="ltr"] .main-content { margin-left: 0; }
}
`;
    fs.writeFileSync(cssPath, css, 'utf8');
}

const scriptJs = `
const langData = {
    "ar": { dir: "rtl" },
    "en": { dir: "ltr" }
};

let currentLang = localStorage.getItem('appLang') || 'ar';

function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = langData[lang].dir;
    
    document.querySelectorAll('.lang-text').forEach(el => {
        if (el.getAttribute('data-' + lang)) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = el.getAttribute('data-' + lang);
            } else {
                el.innerText = el.getAttribute('data-' + lang);
            }
        }
    });

    const currencySymbol = lang === 'ar' ? 'جنيه' : 'EGP';
    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.innerText = currencySymbol;
    });

    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
        langToggleBtn.innerText = lang === 'ar' ? 'EN' : 'عربي';
    }

    updateCartTotals();
}

function updateCartTotals() {
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;
    const currencySymbol = currentLang === 'ar' ? 'جنيه' : 'EGP';

    cartItems.forEach(item => {
        const qtySpan = item.querySelector('.qty-value');
        if (!qtySpan) return;
        const qty = parseInt(qtySpan.innerText) || 1;

        const priceSub = item.querySelector('.price-sub');
        if (priceSub) {
            const unitPrice = parseFloat(priceSub.getAttribute('data-price')) || 0;
            const itemTotal = qty * unitPrice;
            subtotal += itemTotal;

            const priceMain = item.querySelector('.price-main');
            if (priceMain) {
                priceMain.innerHTML = \`\${itemTotal} <span class="currency-symbol" style="font-size:14px; font-weight:normal; margin-top:5px;">\${currencySymbol}</span>\`;
            }
        }
    });

    const summaryRows = document.querySelectorAll('.summary-row');
    if (summaryRows.length >= 2) {
        const subtotalSpan = summaryRows[0].querySelectorAll('span')[1];
        if (subtotalSpan) subtotalSpan.innerHTML = \`\${subtotal} <span class="currency-symbol">\${currencySymbol}</span>\`;

        const deliverySpan = summaryRows[1].querySelectorAll('span')[1];
        const deliveryFee = deliverySpan ? (parseFloat(deliverySpan.getAttribute('data-price')) || 0) : 0;

        const totalSpan = document.querySelector('.total-price');
        if (totalSpan) totalSpan.innerHTML = \`\${subtotal + deliveryFee} <span class="currency-symbol">\${currencySymbol}</span>\`;
    }
}

function updateQty(btn, change) {
    const qtySpan = btn.parentElement.querySelector('.qty-value');
    if (qtySpan) {
        let currentQty = parseInt(qtySpan.innerText) || 1;
        currentQty += change;
        if (currentQty < 1) currentQty = 1;
        qtySpan.innerText = currentQty;
        updateCartTotals();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);

    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('appLang', currentLang);
            applyLanguage(currentLang);
        });
    }

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && mobileMenuBtn) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.cart-item');
            if(item) {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                item.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    item.remove();
                    updateCartTotals();
                }, 300);
            }
        });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('ph-shopping-cart');
                icon.classList.add('ph-check-circle');
                btn.style.background = 'var(--success-color)';
                setTimeout(() => {
                    icon.classList.remove('ph-check-circle');
                    icon.classList.add('ph-shopping-cart');
                    btn.style.background = '';
                }, 1500);
            }
        });
    });
});
`;
fs.writeFileSync('assets/js/script.js', scriptJs, 'utf8');

const sidebarHtml = `
        <aside class="sidebar">
            <div class="logo-container">
                <div class="logo-icon">
                    <img src="assets/images/pharmacy_logo.png" alt="PharmaLink Logo" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div class="logo-text">
                    <span class="logo-title">PharmaLink</span>
                    <span class="logo-subtitle lang-text" data-ar="صيدلية رقمية" data-en="Digital Pharmacy">Digital Pharmacy</span>
                </div>
            </div>
            <nav class="nav-menu">
                <a href="index.html" class="nav-item {{nav_index}}">
                    <i class="ph ph-house"></i>
                    <span class="lang-text" data-ar="الرئيسية" data-en="Home">الرئيسية</span>
                </a>
                <a href="search.html" class="nav-item {{nav_search}}">
                    <i class="ph ph-magnifying-glass"></i>
                    <span class="lang-text" data-ar="بحث" data-en="Search">بحث</span>
                </a>
                <a href="cart.html" class="nav-item {{nav_cart}}">
                    <i class="ph ph-shopping-cart"></i>
                    <span class="lang-text" data-ar="السلة" data-en="Cart">السلة</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="ph ph-package"></i>
                    <span class="lang-text" data-ar="طلباتي" data-en="Orders">طلباتي</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="ph ph-user"></i>
                    <span class="lang-text" data-ar="الملف الشخصي" data-en="Profile">الملف الشخصي</span>
                </a>
                <a href="#" class="nav-item logout-nav">
                    <i class="ph ph-sign-out"></i>
                    <span class="lang-text" data-ar="تسجيل خروج" data-en="Logout">تسجيل خروج</span>
                </a>
            </nav>
        </aside>
`;

const cartHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PharmaLink - Cart</title>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="app-container">
        <div class="mobile-navbar">
            <div class="logo-text" style="flex-direction:row; align-items:center; gap: 8px;">
                <img src="assets/images/pharmacy_logo.png" alt="Logo" style="width:30px; height:30px; object-fit:cover;">
                <span class="logo-title" style="font-size:16px;">PharmaLink</span>
            </div>
            <button class="mobile-menu-btn"><i class="ph ph-list"></i></button>
        </div>
        ${sidebarHtml.replace('{{nav_cart}}', 'active').replace('{{nav_index}}', '').replace('{{nav_search}}', '')}
        <main class="main-content">
            <header class="topbar">
                <h1 class="page-title lang-text" data-ar="سلة التسوق" data-en="Shopping Cart">سلة التسوق</h1>
                <div class="user-profile">
                    <button id="lang-toggle" style="background:var(--bg-color); border:1px solid var(--border-color); padding: 8px 12px; border-radius: 8px; cursor:pointer; font-weight:bold; font-family:inherit;">EN</button>
                    <div class="notification-icon">
                        <i class="ph ph-bell"></i>
                        <span class="notification-badge"></span>
                    </div>
                    <div class="user-info-area">
                        <div class="user-texts">
                            <div class="user-name lang-text" data-ar="أحمد محمد" data-en="Ahmed Mohamed">أحمد محمد</div>
                            <div class="user-role lang-text" data-ar="مريض" data-en="Patient">Patient</div>
                        </div>
                        <div class="user-avatar">أ</div>
                    </div>
                </div>
            </header>
            <div class="cart-layout">
                <div class="cart-items-list">
                    <div class="cart-item">
                        <button class="delete-btn"><i class="ph ph-trash"></i></button>
                        <img src="assets/images/panadol.png" alt="Panadol Extra" class="item-image">
                        <div class="item-details">
                            <div class="item-title">Panadol Extra</div>
                            <div class="item-subtitle lang-text" data-ar="صيدلية النهدي" data-en="Nahdi Pharmacy">صيدلية النهدي</div>
                            <div class="item-quantity">
                                <button class="qty-btn" onclick="updateQty(this, -1)"><i class="ph ph-minus"></i></button>
                                <span class="qty-value">2</span>
                                <button class="qty-btn" onclick="updateQty(this, 1)"><i class="ph ph-plus"></i></button>
                            </div>
                        </div>
                        <div class="item-price-area">
                            <div class="price-main">
                                50 <span class="currency-symbol" style="font-size:14px; font-weight:normal; margin-top:5px;">جنيه</span>
                            </div>
                            <div class="price-sub" data-price="25">
                                <span class="lang-text" data-ar="25 جنيه / حبة" data-en="25 EGP / pill">25 جنيه / حبة</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="summary-widgets">
                    <div class="widget-card">
                        <h3 class="widget-title lang-text" data-ar="ملخص الطلب" data-en="Order Summary">ملخص الطلب</h3>
                        <div class="summary-row">
                            <span class="lang-text" data-ar="المجموع الفرعي" data-en="Subtotal">المجموع الفرعي</span>
                            <span style="font-weight: 600; color:var(--text-main); direction: ltr;">100 <span class="currency-symbol">جنيه</span></span>
                        </div>
                        <div class="summary-row">
                            <span class="lang-text" data-ar="رسوم التوصيل" data-en="Delivery Fee">رسوم التوصيل</span>
                            <span style="font-weight: 600; color:var(--text-main); direction: ltr;" data-price="15">15 <span class="currency-symbol">جنيه</span></span>
                        </div>
                        <div class="summary-divider"></div>
                        <div class="summary-total">
                            <span class="lang-text" data-ar="الإجمالي" data-en="Total">الإجمالي</span>
                            <span class="total-price" style="direction: ltr;">115 <span class="currency-symbol">جنيه</span></span>
                        </div>
                        <button class="btn-checkout lang-text" data-ar="إتمام الطلب" data-en="Checkout">إتمام الطلب</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <script src="assets/js/script.js"></script>
</body>
</html>`;
fs.writeFileSync('cart.html', cartHtml, 'utf8');

const indexHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PharmaLink - Home</title>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="app-container">
        <div class="mobile-navbar">
            <div class="logo-text" style="flex-direction:row; align-items:center; gap: 8px;">
                <img src="assets/images/pharmacy_logo.png" alt="Logo" style="width:30px; height:30px; object-fit:cover;">
                <span class="logo-title" style="font-size:16px;">PharmaLink</span>
            </div>
            <button class="mobile-menu-btn"><i class="ph ph-list"></i></button>
        </div>
        ${sidebarHtml.replace('{{nav_index}}', 'active').replace('{{nav_cart}}', '').replace('{{nav_search}}', '')}
        <main class="main-content">
            <header class="topbar">
                <div class="search-bar-top">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" class="lang-text" data-ar="ابحث عن دواء أو صيدلية..." data-en="Search for medicine or pharmacy..." placeholder="ابحث عن دواء أو صيدلية...">
                </div>
                <div class="user-profile">
                    <button id="lang-toggle" style="background:var(--bg-color); border:1px solid var(--border-color); padding: 8px 12px; border-radius: 8px; cursor:pointer; font-weight:bold; font-family:inherit;">EN</button>
                    <div class="notification-icon">
                        <i class="ph ph-bell"></i>
                        <span class="notification-badge"></span>
                    </div>
                    <div class="user-info-area">
                        <div class="user-texts">
                            <div class="user-name lang-text" data-ar="أحمد محمد" data-en="Ahmed Mohamed">أحمد محمد</div>
                            <div class="user-role lang-text" data-ar="مريض" data-en="Patient">Patient</div>
                        </div>
                        <div class="user-avatar">أ</div>
                    </div>
                </div>
            </header>
            
            <section class="hero-banner">
                <div class="hero-decor"></div>
                <div class="hero-content">
                    <h2 class="hero-title lang-text" data-ar="صحتك تهمنا، اطلب أدويتك الآن" data-en="Your health matters, order your medicine now">صحتك تهمنا، اطلب أدويتك الآن</h2>
                    <p class="hero-subtitle lang-text" data-ar="احصل على الأدوية ومنتجات العناية الشخصية من أقرب الصيدليات مع توصيل سريع وآمن إلى باب بيتك." data-en="Get medicines and personal care products from the nearest pharmacies with fast and safe delivery to your door.">احصل على الأدوية ومنتجات العناية الشخصية من أقرب الصيدليات مع توصيل سريع وآمن إلى باب بيتك.</p>
                    <button class="btn-shop-now lang-text" data-ar="تسوق الآن" data-en="Shop Now">تسوق الآن</button>
                </div>
            </section>

            <div class="section-header">
                <h3 class="section-title lang-text" data-ar="الأدوية الشائعة" data-en="Popular Medicines">الأدوية الشائعة</h3>
                <a href="search.html" class="view-all lang-text" data-ar="عرض الكل" data-en="View All">عرض الكل</a>
            </div>
            <div class="products-grid">
                <div class="product-card">
                    <img src="assets/images/panadol.png" alt="Panadol Extra" class="product-img">
                    <div class="product-title">Panadol Extra</div>
                    <div class="product-pharmacy">
                        <span class="lang-text" data-ar="متوفر في: صيدلية النهدي" data-en="Available in: Nahdi Pharmacy">متوفر في: صيدلية النهدي</span>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">50 <span class="currency-symbol">جنيه</span></span>
                        <button class="add-to-cart-btn"><i class="ph ph-shopping-cart"></i></button>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <script src="assets/js/script.js"></script>
</body>
</html>`;
fs.writeFileSync('index.html', indexHtml, 'utf8');

const searchHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PharmaLink - Search</title>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="app-container">
        <div class="mobile-navbar">
            <div class="logo-text" style="flex-direction:row; align-items:center; gap: 8px;">
                <img src="assets/images/pharmacy_logo.png" alt="Logo" style="width:30px; height:30px; object-fit:cover;">
                <span class="logo-title" style="font-size:16px;">PharmaLink</span>
            </div>
            <button class="mobile-menu-btn"><i class="ph ph-list"></i></button>
        </div>
        ${sidebarHtml.replace('{{nav_search}}', 'active').replace('{{nav_cart}}', '').replace('{{nav_index}}', '')}
        <main class="main-content">
            <header class="topbar">
                <div class="user-profile" style="margin-right: auto; margin-left: 0;">
                    <button id="lang-toggle" style="background:var(--bg-color); border:1px solid var(--border-color); padding: 8px 12px; border-radius: 8px; cursor:pointer; font-weight:bold; font-family:inherit;">EN</button>
                    <div class="notification-icon">
                        <i class="ph ph-bell"></i>
                        <span class="notification-badge"></span>
                    </div>
                    <div class="user-info-area">
                        <div class="user-texts">
                            <div class="user-name lang-text" data-ar="أحمد محمد" data-en="Ahmed Mohamed">أحمد محمد</div>
                            <div class="user-role lang-text" data-ar="مريض" data-en="Patient">Patient</div>
                        </div>
                        <div class="user-avatar">أ</div>
                    </div>
                </div>
            </header>
            
            <div class="top-search-box">
                <i class="ph ph-magnifying-glass"></i>
                <input type="text" class="lang-text" data-ar="ابحث عن دواء..." data-en="Search for medicine..." placeholder="ابحث عن دواء...">
                <button class="btn-search lang-text" data-ar="بحث" data-en="Search">بحث</button>
            </div>

            <div class="search-container">
                <aside class="filters-sidebar">
                    <div class="filter-section">
                        <h4 class="filter-title lang-text" data-ar="الفئات" data-en="Categories">الفئات</h4>
                        <div class="filter-options">
                            <label class="checkbox-label">
                                <input type="checkbox" checked>
                                <span class="lang-text" data-ar="الكل" data-en="All">الكل</span>
                            </label>
                        </div>
                    </div>
                </aside>

                <div class="search-results-area">
                    <div class="search-page-header">
                        <div class="results-count lang-text" data-ar="النتائج: 12" data-en="Results: 12">النتائج: 12</div>
                    </div>
                    <div class="products-grid">
                        <div class="product-card">
                            <img src="assets/images/panadol.png" alt="Panadol Extra" class="product-img">
                            <div class="product-title">Panadol Extra</div>
                            <div class="product-pharmacy">
                                <span class="lang-text" data-ar="متوفر في: صيدلية النهدي" data-en="Available in: Nahdi Pharmacy">متوفر في: صيدلية النهدي</span>
                            </div>
                            <div class="product-footer">
                                <span class="product-price">50 <span class="currency-symbol">جنيه</span></span>
                                <button class="add-to-cart-btn"><i class="ph ph-shopping-cart"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <script src="assets/js/script.js"></script>
</body>
</html>`;
fs.writeFileSync('search.html', searchHtml, 'utf8');
