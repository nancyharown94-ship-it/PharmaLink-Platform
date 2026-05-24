const API_BASE_URL = 'http://localhost:3000/api';
const langData = { ar: { dir: 'rtl' }, en: { dir: 'ltr' } };
let currentLang = localStorage.getItem('appLang') || 'ar';

/* ── Language ── */
function applyLanguage(lang) {
    const isLtr = lang === 'en';

    // Direction on html element
    document.documentElement.lang = lang;
    document.documentElement.dir = isLtr ? 'ltr' : 'rtl';

    // Toggle body class for CSS sidebar/layout switching
    document.body.classList.toggle('ltr', isLtr);
    document.body.dir = isLtr ? 'ltr' : 'rtl';

    // Update all text elements
    document.querySelectorAll('.lang-text').forEach(el => {
        const val = el.getAttribute('data-' + lang);
        if (!val) return;
        if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.hasAttribute('placeholder')) {
            el.placeholder = val;
        } else {
            el.textContent = val;
        }
    });

    // Currency
    const sym = lang === 'ar' ? 'جنيه' : 'EGP';
    document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = sym);

    // Toggle button label
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'عربي';

    // Update topbar user-profile alignment
    const up = document.querySelector('.user-profile');
    if (up) up.style.marginInlineStart = isLtr ? 'auto' : '';

    updateCartTotals();
}

/* ── Cart ── */
function renderCart() {
    const list = document.querySelector('.cart-items-list');
    if (!list) return;
    
    let cart = JSON.parse(localStorage.getItem('patientCart')) || [];
    list.innerHTML = '';
    
    if (cart.length === 0) {
        list.innerHTML = `<p style="text-align:center; padding: 20px;">${currentLang === 'ar' ? 'السلة فارغة' : 'Cart is empty'}</p>`;
        updateCartTotals();
        return;
    }
    
    cart.forEach((item, index) => {
        const sym = currentLang === 'ar' ? 'جنيه' : 'EGP';
        const pharmacyTxt = currentLang === 'ar' ? 'صيدلية عامة' : 'General Pharmacy';
        const unitPriceTxt = currentLang === 'ar' ? `${item.price} ${sym} / حبة` : `${item.price} ${sym} / pill`;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.dataset.index = index;
        div.innerHTML = `
            <button class="delete-btn" onclick="removeFromCart(${index})"><i class="ph ph-trash"></i></button>
            <img src="${item.image || 'assets/images/panadol.png'}" alt="${item.name}" class="item-image">
            <div class="item-details">
                <div class="item-title">${item.name}</div>
                <div class="item-subtitle">${pharmacyTxt}</div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="updateQty(this, -1, ${index})"><i class="ph ph-minus"></i></button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(this, 1, ${index})"><i class="ph ph-plus"></i></button>
                </div>
            </div>
            <div class="item-price-area">
                <div class="price-main">
                    ${item.price * item.qty} <span class="currency-symbol" style="font-size:14px; font-weight:normal; margin-top:5px;">${sym}</span>
                </div>
                <div class="price-sub" data-price="${item.price}">
                    <span>${unitPriceTxt}</span>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
    
    updateCartTotals();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('patientCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('patientCart', JSON.stringify(cart));
    renderCart();
}

function updateCartTotals() {
    const sym = currentLang === 'ar' ? 'جنيه' : 'EGP';
    let subtotal = 0;
    document.querySelectorAll('.cart-item').forEach(item => {
        const qty = parseInt(item.querySelector('.qty-value')?.innerText) || 1;
        const price = parseFloat(item.querySelector('.price-sub')?.getAttribute('data-price')) || 0;
        subtotal += qty * price;
        const pm = item.querySelector('.price-main');
        if (pm) pm.innerHTML = `${qty * price} <span class="currency-symbol" style="font-size:14px;font-weight:normal;">${sym}</span>`;
    });
    const rows = document.querySelectorAll('.summary-row');
    if (rows.length >= 2) {
        const s = rows[0].querySelectorAll('span')[1];
        if (s) s.innerHTML = `${subtotal} <span class="currency-symbol">${sym}</span>`;
        const d = parseFloat(rows[1].querySelectorAll('span')[1]?.getAttribute('data-price')) || 0;
        const tot = document.querySelector('.total-price');
        if (tot) tot.innerHTML = `${subtotal + d} <span class="currency-symbol">${sym}</span>`;
    }
}

function updateQty(btn, change, index) {
    const span = btn.parentElement.querySelector('.qty-value');
    if (!span) return;
    
    let newQty = Math.max(1, parseInt(span.innerText || 1) + change);
    span.innerText = newQty;
    
    if (index !== undefined) {
        let cart = JSON.parse(localStorage.getItem('patientCart')) || [];
        if (cart[index]) {
            cart[index].qty = newQty;
            localStorage.setItem('patientCart', JSON.stringify(cart));
            
            // update local DOM for price-main
            const item = btn.closest('.cart-item');
            if (item) {
                const sym = currentLang === 'ar' ? 'جنيه' : 'EGP';
                const price = cart[index].price;
                const pm = item.querySelector('.price-main');
                if (pm) pm.innerHTML = `${newQty * price} <span class="currency-symbol" style="font-size:14px;font-weight:normal;">${sym}</span>`;
            }
        }
    }
    
    updateCartTotals();
}

/* ── Toast ── */
function showToast(message, type = 'success') {
    const t = document.createElement('div');
    t.className = `modern-toast ${type}`;
    t.innerHTML = `<i class="ph ph-${type === 'success' ? 'check-circle' : 'x-circle'}"></i> ${message}`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

/* ── Search ── */
function initSearch() {
    // Topbar search → navigate to search.html & show suggestions
    const topInput = document.querySelector('.search-bar-top input');
    if (topInput) {
        const parent = topInput.parentElement;
        parent.style.position = 'relative'; // Ensure dropdown positions correctly
        
        const suggestionsBox = document.createElement('div');
        suggestionsBox.className = 'search-suggestions';
        suggestionsBox.style.cssText = 'position:absolute; top:100%; left:0; right:0; background:var(--bg-card); border-radius:12px; box-shadow:var(--shadow-md); z-index:100; max-height:300px; overflow-y:auto; display:none; margin-top:8px;';
        parent.appendChild(suggestionsBox);

        let debounceTimer;
        topInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = topInput.value.trim();
            if (!query) {
                suggestionsBox.style.display = 'none';
                return;
            }
            
            debounceTimer = setTimeout(async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/medicines/search?keyword=${encodeURIComponent(query)}`);
                    if (!response.ok) throw new Error('Failed to fetch suggestions');
                    let medicines = await response.json();
                    
                    // Filter out items not in stock (not added by pharmacy to inventory)
                    medicines = medicines.filter(med => med.stock > 0);
                    
                    suggestionsBox.innerHTML = '';
                    if (medicines.length === 0) {
                        suggestionsBox.innerHTML = `<div style="padding:12px; text-align:center; color:var(--text-muted);">${currentLang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</div>`;
                    } else {
                        medicines.slice(0, 5).forEach(med => {
                            const isAvailable = med.stock > 0;
                            const item = document.createElement('div');
                            item.style.cssText = 'padding:12px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; gap:12px; cursor:pointer;';
                            
                            const imgSrc = (med.images && med.images.length > 0) ? med.images[0] : '';
                            const imgHtml = imgSrc 
                                ? `<img src="${imgSrc}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;">`
                                : `<div style="width:40px; height:40px; border-radius:8px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; color:#aaa;"><i class="ph ph-pill"></i></div>`;
                                
                            item.innerHTML = `
                                ${imgHtml}
                                <div style="flex-grow:1;">
                                    <div style="font-weight:600; color:var(--text-main); font-size:14px;">${med.name}</div>
                                </div>
                                <div style="font-weight:700; color:var(--primary-color); font-size:14px;">${med.price} <span class="currency-symbol" style="font-size:10px;">${currentLang === 'ar' ? 'جنيه' : 'EGP'}</span></div>
                            `;
                            
                            item.addEventListener('click', () => {
                                window.location.href = `search.html?q=${encodeURIComponent(med.name)}`;
                            });
                            
                            suggestionsBox.appendChild(item);
                        });
                    }
                    suggestionsBox.style.display = 'block';
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            }, 300);
        });

        topInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && topInput.value.trim()) {
                window.location.href = `search.html?q=${encodeURIComponent(topInput.value.trim())}`;
            }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', e => {
            if (!parent.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    }

    // Search page main box
    const mainInput = document.querySelector('.top-search-box input');
    if (mainInput) {
        const q = new URLSearchParams(window.location.search).get('q');
        if (q) { mainInput.value = q; filterProducts(q); } else { filterProducts(''); }
        
        let debounceTimer;
        mainInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => filterProducts(mainInput.value), 300);
        });
        mainInput.addEventListener('keydown', e => { if (e.key === 'Enter') filterProducts(mainInput.value); });
    }
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) searchBtn.addEventListener('click', () => filterProducts(document.querySelector('.top-search-box input')?.value || ''));

    // Pharmacy pages: filter table rows
    if (document.querySelector('.custom-table')) {
        const pharmInput = document.querySelector('.topbar .search-bar-top input, .header-actions-flex .search-bar-top input');
        if (pharmInput) {
            pharmInput.addEventListener('input', () => {
                const val = pharmInput.value.toLowerCase();
                document.querySelectorAll('.custom-table tbody tr').forEach(row => {
                    row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
                });
            });
        }
    }
}

async function filterProducts(query) {
    if (!document.querySelector('.products-grid')) return;
    
    try {
        const url = query ? `${API_BASE_URL}/medicines/search?keyword=${encodeURIComponent(query)}` : `${API_BASE_URL}/medicines/available`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch medicines');
        let medicines = await response.json();
        
        // Filter out items not in stock
        medicines = medicines.filter(med => med.stock > 0);
        
        const grid = document.querySelector('.products-grid');
        grid.innerHTML = '';
        
        const cnt = document.querySelector('.results-count');
        if (cnt) cnt.textContent = (currentLang === 'ar' ? 'النتائج: ' : 'Results: ') + medicines.length;
        
        if (medicines.length === 0) {
            grid.innerHTML = `<p style="text-align:center; width:100%; grid-column: 1 / -1; color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</p>`;
            return;
        }

        medicines.forEach(med => {
            const sym = currentLang === 'ar' ? 'جنيه' : 'EGP';
            const availableTxt = med.pharmacy && med.pharmacy.name 
                ? (currentLang === 'ar' ? `متوفر في: ${med.pharmacy.name}` : `Available in: ${med.pharmacy.name}`)
                : (currentLang === 'ar' ? 'متوفر' : 'Available');
            
            const imgHtml = (med.images && med.images.length > 0) 
                ? `<img src="${med.images[0]}" alt="${med.name}" class="product-img" style="cursor:pointer;" onclick="window.location.href='product-details.html?id=${med._id}'">`
                : `<div class="product-img" style="display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#aaa;cursor:pointer;" onclick="window.location.href='product-details.html?id=${med._id}'"><i class="ph ph-pill" style="font-size:32px;"></i></div>`;
            
            const pharmacyId = med.pharmacy && med.pharmacy._id ? med.pharmacy._id : '';
            const btnHtml = `<button class="add-to-cart-btn" onclick="addToCart('${med._id}', '${med.name}', ${med.price}, '${(med.images && med.images.length > 0) ? med.images[0] : ''}', '${pharmacyId}')"><i class="ph ph-shopping-cart"></i></button>`;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.position = 'relative';
            card.innerHTML = `
                ${imgHtml}
                <div class="product-title" style="cursor:pointer;" onclick="window.location.href='product-details.html?id=${med._id}'">${med.name}</div>
                <div class="product-pharmacy">
                    <span class="lang-text" style="color: var(--success-color);">${availableTxt}</span>
                </div>
                <div class="product-footer">
                    <span class="product-price">${med.price} <span class="currency-symbol">${sym}</span></span>
                    ${btnHtml}
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error searching medicines:', error);
    }
}

/* ── Image Upload ── */
function initImageUpload() {
    const area = document.querySelector('.image-upload-area');
    const input = document.getElementById('med-img');
    if (!area || !input) return;

    area.addEventListener('click', () => input.click());
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', e => {
        e.preventDefault(); area.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) previewImage(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', () => { if (input.files[0]) previewImage(input.files[0]); });
}

function previewImage(file) {
    if (!file.type.startsWith('image/')) {
        showToast(currentLang === 'ar' ? 'الملف يجب أن يكون صورة' : 'File must be an image', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        const area = document.querySelector('.image-upload-area');
        if (!area) return;
        area.innerHTML = `
            <img src="${e.target.result}" style="max-height:160px;border-radius:12px;object-fit:cover;margin-bottom:8px;display:block;margin-inline:auto;">
            <p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">${file.name}</p>
            <button type="button" id="changeImgBtn" style="padding:6px 16px;border:1px solid var(--border-color);border-radius:8px;cursor:pointer;background:none;font-family:inherit;font-size:13px;">
                ${currentLang === 'ar' ? 'تغيير الصورة' : 'Change Image'}
            </button>
            <input type="file" id="med-img" accept="image/*" style="display:none;">
        `;
        const newInput = area.querySelector('#med-img');
        area.querySelector('#changeImgBtn').addEventListener('click', e => { e.stopPropagation(); newInput.click(); });
        newInput.addEventListener('change', () => { if (newInput.files[0]) previewImage(newInput.files[0]); });
        showToast(currentLang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    };
    reader.readAsDataURL(file);
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);

    // Fetch popular medicines if on Home page
    if (document.querySelector('.products-grid') && !window.location.pathname.includes('search.html')) {
        fetchMedicines();
    }
    
    // Render cart if on Cart page
    if (document.querySelector('.cart-items-list')) {
        renderCart();
    }
    
    // Init checkout if on Checkout page
    if (document.querySelector('.checkout-container')) {
        initCheckout();
    }

    // Lang toggle
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'ar' ? 'en' : 'ar';
            localStorage.setItem('appLang', currentLang);
            applyLanguage(currentLang);
        });
    }



    // Mobile menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
        document.addEventListener('click', e => {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuBtn.contains(e.target))
                sidebar.classList.remove('active');
        });
    }

    // Logout
    document.querySelectorAll('.logout-nav').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('selectedRole');
            localStorage.removeItem('userToken');
            window.location.href = 'auth.html';
        });
    });


    // Cart delete
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const item = e.target.closest('.cart-item');
            if (!item) return;
            item.style.cssText = 'opacity:0;transform:scale(0.9);transition:all 0.3s;';
            setTimeout(() => { item.remove(); updateCartTotals(); }, 300);
        });
    });

    // Add to cart
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'ph ph-check-circle';
                btn.style.background = 'var(--success-color)';
                showToast(currentLang === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
                setTimeout(() => { icon.className = 'ph ph-shopping-cart'; btn.style.background = ''; }, 1500);
            }
        });
    });

    // Orders tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Inventory qty
    document.querySelectorAll('.stock-update .qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const inp = btn.parentElement.querySelector('.qty-input');
            if (!inp) return;
            inp.value = Math.max(0, parseInt(inp.value || 0) + (btn.textContent.trim() === '+' ? 1 : -1));
            showToast(currentLang === 'ar' ? 'تم تحديث الكمية' : 'Stock updated');
        });
    });

    // Order Accept
    document.querySelectorAll('.btn-accept').forEach(btn => {
        btn.addEventListener('click', () => {
            const badge = btn.closest('tr')?.querySelector('.status-badge');
            if (badge) { badge.className = 'status-badge status-processing'; badge.textContent = currentLang === 'ar' ? 'جاري التجهيز' : 'Processing'; }
            btn.closest('.action-buttons').innerHTML = `<button class="btn-action btn-ready" style="width:auto;padding:0 12px;font-weight:700;" onclick="markReady(this)">${currentLang === 'ar' ? 'جاهز' : 'Ready'}</button>`;
            showToast(currentLang === 'ar' ? 'تم قبول الطلب' : 'Order accepted');
        });
    });

    // Order Reject
    document.querySelectorAll('.action-buttons .btn-reject').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('tr');
            if (row) { row.style.opacity = '0.4'; row.style.transition = 'opacity 0.3s'; }
            showToast(currentLang === 'ar' ? 'تم رفض الطلب' : 'Order rejected', 'error');
        });
    });

    // Search
    initSearch();

    // Image upload
    initImageUpload();

    // Medicine form
    const medForm = document.querySelector('.medicine-form');
    if (medForm) {
        medForm.addEventListener('submit', e => {
            e.preventDefault();
            showToast(currentLang === 'ar' ? 'تم حفظ الدواء بنجاح' : 'Medicine saved successfully');
        });
    }
});

function markReady(btn) {
    const badge = btn.closest('tr')?.querySelector('.status-badge');
    if (badge) { badge.className = 'status-badge status-ready'; badge.textContent = currentLang === 'ar' ? 'جاهز للاستلام' : 'Ready'; }
    btn.closest('.action-buttons').innerHTML = `<button class="btn-action btn-view"><i class="ph ph-eye"></i></button>`;
    showToast(currentLang === 'ar' ? 'تم تحديد الطلب كجاهز' : 'Order marked as ready');
}

/* ── Checkout ── */
async function initCheckout() {
    let cart = JSON.parse(localStorage.getItem('patientCart')) || [];
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.qty;
    });
    
    // Assume delivery fee is 15
    const deliveryFee = 15;
    const total = subtotal + deliveryFee;
    
    const summaryTotalEl = document.querySelector('.checkout-container .summary-total');
    if (summaryTotalEl) {
        summaryTotalEl.textContent = total;
    }

    // Dynamic prefill from user profile
    const token = localStorage.getItem('userToken');
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const user = await response.json();
                const nameInput = document.getElementById('checkout-name');
                const phoneInput = document.getElementById('checkout-phone');
                const streetInput = document.getElementById('checkout-street');
                
                if (nameInput && user.name) nameInput.value = user.name;
                if (phoneInput && user.phone) phoneInput.value = user.phone;
                
                // If user has a structured address, or simple address
                if (streetInput && user.address) {
                    streetInput.value = user.address;
                }
            }
        } catch (error) {
            console.error('Failed to prefill checkout profile:', error);
        }
    }
}

async function confirmOrder() {
    let cart = JSON.parse(localStorage.getItem('patientCart')) || [];
    if (cart.length === 0) {
        showToast(currentLang === 'ar' ? 'السلة فارغة' : 'Cart is empty', 'error');
        return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
        showToast(currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please log in first', 'error');
        window.location.href = 'auth.html';
        return;
    }

    const parseJwt = (t) => {
        try { return JSON.parse(atob(t.split('.')[1])); } catch (e) { return null; }
    };
    const decoded = parseJwt(token);
    const userId = decoded ? decoded.id : null;

    if (!userId) {
        showToast(currentLang === 'ar' ? 'بيانات المستخدم غير صالحة' : 'Invalid user data', 'error');
        return;
    }

    // Get real values from input fields
    const streetInput = document.getElementById('checkout-street');
    const cityInput = document.getElementById('checkout-city');
    const govInput = document.getElementById('checkout-governorate');
    const phoneInput = document.getElementById('checkout-phone');
    const notesInput = document.getElementById('checkout-notes');

    const street = streetInput ? streetInput.value.trim() : 'شارع 9، عمارة 12، شقة 5';
    const city = cityInput ? cityInput.value.trim() : 'المعادي';
    const governorate = govInput ? govInput.value.trim() : 'القاهرة';
    const phone = phoneInput ? phoneInput.value.trim() : '01012345678';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!street || !city || !governorate) {
        showToast(currentLang === 'ar' ? 'برجاء ملء جميع خانات العنوان' : 'Please fill all address fields', 'error');
        return;
    }

    try {
        let subtotal = 0;
        cart.forEach(item => subtotal += item.price * item.qty);
        const deliveryFee = 15;

        const items = cart.map(item => ({
            medicine: item.id,
            quantity: item.qty,
            unitPrice: item.price,
            medicineSnapshot: {
                name: item.name,
                image: item.image || ''
            }
        }));

        // Retrieve pharmacyId from cart, or use a default valid pharmacyId if not set
        const pharmacyId = cart[0].pharmacyId || "65d3ec4b34b68427f8de6461"; // Valid default fallback

        const orderPayload = {
            user: userId,
            pharmacy: pharmacyId,
            items: items,
            deliveryAddress: {
                street,
                city,
                governorate,
                phone
            },
            paymentMethod: 'cash_on_delivery',
            deliveryFee: deliveryFee,
            discount: 0,
            notes: notes
        };

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Order creation failed:', errData);
            showToast(currentLang === 'ar' ? `فشل إنشاء الطلب: ${errData.message || ''}` : `Order failed: ${errData.message || ''}`, 'error');
            return;
        }

        localStorage.removeItem('patientCart');
        showToast(currentLang === 'ar' ? 'تم تأكيد الطلب بنجاح! 🎉' : 'Order confirmed successfully! 🎉');
        setTimeout(() => {
            window.location.href = 'Orders Tracking Page.html';
        }, 1500);

    } catch (error) {
        console.error('Order creation error:', error);
        showToast(currentLang === 'ar' ? 'حدث خطأ في الاتصال بالسيرفر' : 'Server connection error', 'error');
    }
}

/* ── Backend API Integration ── */
async function fetchMedicines() {
    try {
        const response = await fetch(`${API_BASE_URL}/medicines/available`);
        if (!response.ok) throw new Error('Failed to fetch medicines');
        let medicines = await response.json();
        
        // Only show in stock medicines on Home page
        medicines = medicines.filter(med => med.stock > 0);
        
        const grid = document.querySelector('.products-grid');
        if (!grid) return;
        
        grid.innerHTML = ''; // Clear hardcoded
        
        if (medicines.length === 0) {
            grid.innerHTML = `<p style="text-align:center; width:100%; grid-column: 1 / -1; color: var(--text-muted);">${currentLang === 'ar' ? 'لا توجد أدوية متوفرة حالياً' : 'No medicines available currently'}</p>`;
            return;
        }

        medicines.forEach(med => {
            const sym = currentLang === 'ar' ? 'جنيه' : 'EGP';
            const availableTxt = med.pharmacy && med.pharmacy.name 
                ? (currentLang === 'ar' ? `متوفر في: ${med.pharmacy.name}` : `Available in: ${med.pharmacy.name}`)
                : (currentLang === 'ar' ? 'متوفر' : 'Available');
            
            const imgHtml = (med.images && med.images.length > 0) 
                ? `<img src="${med.images[0]}" alt="${med.name}" class="product-img" style="cursor:pointer;" onclick="window.location.href='product-details.html?id=${med._id}'">`
                : `<div class="product-img" style="display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#aaa;cursor:pointer;" onclick="window.location.href='product-details.html?id=${med._id}'"><i class="ph ph-pill" style="font-size:32px;"></i></div>`;
            
            const pharmacyId = med.pharmacy && med.pharmacy._id ? med.pharmacy._id : '';
            const btnHtml = `<button class="add-to-cart-btn" onclick="addToCart('${med._id}', '${med.name}', ${med.price}, '${(med.images && med.images.length > 0) ? med.images[0] : ''}', '${pharmacyId}')"><i class="ph ph-shopping-cart"></i></button>`;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.position = 'relative';
            card.innerHTML = `
                ${imgHtml}
                <div class="product-title" style="cursor:pointer;" onclick="window.location.href='product-details.html?id=${med._id}'">${med.name}</div>
                <div class="product-pharmacy">
                    <span class="lang-text" style="color: var(--success-color);">${availableTxt}</span>
                </div>
                <div class="product-footer">
                    <span class="product-price">${med.price} <span class="currency-symbol">${sym}</span></span>
                    ${btnHtml}
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching medicines:', error);
        showToast(currentLang === 'ar' ? 'حدث خطأ أثناء جلب الأدوية' : 'Error fetching medicines', 'error');
    }
}

function addToCart(id, name, price, image, pharmacyId) {
    let cart = JSON.parse(localStorage.getItem('patientCart')) || [];
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id, name, price, image, qty: 1, pharmacyId });
    }
    
    localStorage.setItem('patientCart', JSON.stringify(cart));
    showToast(currentLang === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
}

/* ── Orders Tracking Integration ── */
async function fetchUserOrders() {
    const pageHeader = document.querySelector('.page-header');
    if (!pageHeader || (!pageHeader.textContent.includes('تتبع الطلب') && !pageHeader.textContent.includes('Order Tracking'))) return;
    
    const token = localStorage.getItem('userToken');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    
    const parseJwt = (t) => {
        try { return JSON.parse(atob(t.split('.')[1])); } catch (e) { return null; }
    };
    const decoded = parseJwt(token);
    const userId = decoded ? decoded.id : null;
    if (!userId) return;

    try {
        const res = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const orders = await res.json();
        
        const mainContent = document.querySelector('.main-content');
        
        // Remove existing hardcoded order blocks
        const oldBlocks = document.querySelectorAll('.order-block');
        oldBlocks.forEach(b => b.remove());
        
        // Find where to append. The layout uses a few top elements then the order details.
        // We will just clear the container below the page-header, but there's a div with box-shadow first in the hardcoded one.
        // We should clear everything after page-header and build our own blocks.
        
        let currentNode = pageHeader.nextElementSibling;
        while (currentNode) {
            const next = currentNode.nextElementSibling;
            currentNode.remove();
            currentNode = next;
        }

        if (orders.length === 0) {
            const noOrders = document.createElement('div');
            noOrders.className = 'order-block';
            noOrders.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:50px;">${currentLang === 'ar' ? 'لا توجد طلبات سابقة' : 'No previous orders'}</p>`;
            pageHeader.after(noOrders);
            return;
        }

        let insertAfterNode = pageHeader;

        orders.forEach(order => {
            const dateStr = new Date(order.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            const sym = currentLang === 'ar' ? 'جنيه' : 'EGP';
            const orderIdStr = order._id.slice(-6).toUpperCase();
            
            const statusMap = {
                'pending': { ar: 'تم استلام الطلب', en: 'Order Received', step: 1 },
                'confirmed': { ar: 'تم التأكيد', en: 'Confirmed', step: 1 },
                'preparing': { ar: 'جاري التجهيز', en: 'Processing', step: 2 },
                'out_for_delivery': { ar: 'في الطريق إليك', en: 'On the way', step: 3 },
                'delivered': { ar: 'تم التوصيل', en: 'Delivered', step: 4 },
                'cancelled': { ar: 'تم الإلغاء', en: 'Cancelled', step: 0 },
                'rejected': { ar: 'تم الرفض', en: 'Rejected', step: 0 }
            };
            const currentStatus = order.status || 'pending';
            const stepIndex = statusMap[currentStatus] ? statusMap[currentStatus].step : 1;

            let itemsHtml = '';
            order.items.forEach(item => {
                const medName = item.medicine ? item.medicine.name : 'Unknown';
                const medPrice = item.medicine ? item.medicine.price : item.unitPrice;
                const medImg = (item.medicine && item.medicine.images && item.medicine.images.length > 0) ? item.medicine.images[0] : 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png';
                itemsHtml += `
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                        <img src="${medImg}" alt="Med" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2966/2966327.png'">
                        <div style="flex-grow: 1;">
                            <h4 style="font-size: 15px; margin-bottom: 4px;">${medName}</h4>
                            <span style="font-size: 13px; color: var(--text-muted);"><span class="lang-text">${currentLang === 'ar' ? 'الكمية: ' : 'Qty: '}${item.quantity}</span></span>
                        </div>
                        <div style="font-weight: 700; color: var(--primary-color);">${medPrice} <span class="currency-symbol">${sym}</span></div>
                    </div>
                `;
            });

            // Delivery address and notes display
            const addr = order.deliveryAddress;
            const addressString = addr ? `${addr.governorate}، ${addr.city}، ${addr.street}` : (currentLang === 'ar' ? 'العنوان الافتراضي' : 'Default Address');
            const phoneString = addr && addr.phone ? addr.phone : 'N/A';
            const notesString = order.notes ? order.notes : (currentLang === 'ar' ? 'لا توجد ملاحظات' : 'No notes');

            let receivedBtnHtml = '';
            if (currentStatus === 'out_for_delivery') {
                receivedBtnHtml = `
                    <button class="lang-text" onclick="confirmOrderDelivery('${order._id}')" style="padding: 10px 20px; border-radius: 12px; border: none; background: var(--success-color); color: white; font-weight: 700; font-family: inherit; cursor: pointer; margin-inline-end: 10px;">
                        <i class="ph ph-check-circle"></i> ${currentLang === 'ar' ? 'تم الاستلام' : 'Mark Received'}
                    </button>
                `;
            }

            const block = document.createElement('div');
            block.className = 'order-block';
            block.style.cssText = 'margin-bottom: 40px;';
            block.innerHTML = `
                <div style="background: var(--bg-card); padding: 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 16px;">
                    <div>
                        <span class="lang-text" style="color: var(--text-muted); font-size: 13px;">${currentLang === 'ar' ? 'رقم الطلب' : 'Order ID'}</span>
                        <h3 style="font-weight: 700; color: var(--primary-color); margin-top: 4px;">#ORD-${orderIdStr}</h3>
                    </div>
                    <div>
                        <span class="lang-text" style="color: var(--text-muted); font-size: 13px;">${currentLang === 'ar' ? 'تاريخ الطلب' : 'Order Date'}</span>
                        <h3 class="lang-text" style="font-weight: 600; color: var(--text-main); margin-top: 4px;">${dateStr}</h3>
                    </div>
                    <div>
                        <span class="lang-text" style="color: var(--text-muted); font-size: 13px;">${currentLang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                        <h3 style="font-weight: 700; color: var(--text-main); margin-top: 4px;">${order.totalPrice} <span class="currency-symbol">${sym}</span></h3>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${receivedBtnHtml}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                    <!-- Timeline -->
                    <div style="background: var(--bg-card); padding: 24px; border-radius: 16px; box-shadow: var(--shadow-sm);">
                        <h3 class="lang-text" style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                            ${currentLang === 'ar' ? 'حالة الطلب' : 'Order Status'} - <span style="color:var(--primary-color)">${statusMap[currentStatus] ? statusMap[currentStatus][currentLang] : currentStatus}</span>
                        </h3>
                        <div class="timeline">
                            <div class="timeline-step ${stepIndex >= 1 ? (stepIndex === 1 ? 'active' : 'completed') : ''}">
                                <div class="timeline-icon"><i class="ph ph-receipt"></i></div>
                                <div class="timeline-content">
                                    <h4 class="lang-text">${currentLang === 'ar' ? 'تم استلام الطلب' : 'Order Received'}</h4>
                                </div>
                            </div>
                            <div class="timeline-step ${stepIndex >= 2 ? (stepIndex === 2 ? 'active' : 'completed') : ''}">
                                <div class="timeline-icon"><i class="ph ph-package"></i></div>
                                <div class="timeline-content">
                                    <h4 class="lang-text">${currentLang === 'ar' ? 'جاري التجهيز' : 'Processing'}</h4>
                                </div>
                            </div>
                            <div class="timeline-step ${stepIndex >= 3 ? (stepIndex === 3 ? 'active' : 'completed') : ''}">
                                <div class="timeline-icon"><i class="ph ph-moped"></i></div>
                                <div class="timeline-content">
                                    <h4 class="lang-text">${currentLang === 'ar' ? 'في الطريق إليك' : 'On the way'}</h4>
                                </div>
                            </div>
                            <div class="timeline-step ${stepIndex >= 4 ? (stepIndex === 4 ? 'active' : 'completed') : ''}">
                                <div class="timeline-icon"><i class="ph ph-check-circle"></i></div>
                                <div class="timeline-content">
                                    <h4 class="lang-text">${currentLang === 'ar' ? 'تم التوصيل' : 'Delivered'}</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Elements -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div style="background: var(--bg-card); padding: 24px; border-radius: 16px; box-shadow: var(--shadow-sm);">
                            <h3 class="lang-text" style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                                ${currentLang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                            </h3>
                            ${itemsHtml}
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 50px; height: 50px; border-radius: 8px; background: var(--bg-color); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--text-muted);">
                                    <i class="ph ph-moped"></i>
                                </div>
                                <div style="flex-grow: 1;">
                                    <h4 class="lang-text" style="font-size: 15px; margin-bottom: 4px;">${currentLang === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}</h4>
                                </div>
                                <div style="font-weight: 700; color: var(--text-main);">${order.deliveryFee || 0} <span class="currency-symbol">${sym}</span></div>
                            </div>

                            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; font-weight: 700; font-size: 18px;">
                                <span class="lang-text">${currentLang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                                <span>${order.totalPrice} <span class="currency-symbol">${sym}</span></span>
                            </div>

                            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 13px; color: var(--text-muted); display:flex; flex-direction:column; gap:8px;">
                                <div><i class="ph ph-map-pin" style="color:var(--primary-color); vertical-align: middle; margin-inline-end: 4px;"></i> <strong>${currentLang === 'ar' ? 'العنوان:' : 'Address:'}</strong> ${addressString}</div>
                                <div><i class="ph ph-phone" style="color:var(--primary-color); vertical-align: middle; margin-inline-end: 4px;"></i> <strong>${currentLang === 'ar' ? 'الهاتف:' : 'Phone:'}</strong> ${phoneString}</div>
                                <div><i class="ph ph-note" style="color:var(--primary-color); vertical-align: middle; margin-inline-end: 4px;"></i> <strong>${currentLang === 'ar' ? 'الملاحظات:' : 'Notes:'}</strong> ${notesString}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            insertAfterNode.after(block);
            insertAfterNode = block;
        });
        
    } catch (err) {
        console.error('Error fetching orders:', err);
    }
}

window.confirmOrderDelivery = async function(orderId) {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'delivered' })
        });

        if (response.ok) {
            showToast(currentLang === 'ar' ? 'تم تأكيد استلام الطلب! 🎉' : 'Delivery confirmed successfully! 🎉');
            fetchUserOrders();
        } else {
            showToast(currentLang === 'ar' ? 'فشل تأكيد الاستلام' : 'Failed to confirm delivery', 'error');
        }
    } catch (error) {
        console.error('Error confirming delivery:', error);
        showToast(currentLang === 'ar' ? 'خطأ في الاتصال بالسيرفر' : 'Server connection error', 'error');
    }
};

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    fetchUserOrders();
});


