const fs = require('fs');

const files = [
    'pharmacy-dashboard.html',
    'pharmacy-add-medicine.html',
    'pharmacy-analytics.html',
    'pharmacy-inventory.html',
    'pharmacy-orders.html'
];

const newNavItem = `
                <a href="pharmacy-profile.html" class="nav-item ">
                    <i class="ph ph-user"></i>
                    <span class="lang-text" data-ar="الملف الشخصي" data-en="Profile">الملف الشخصي</span>
                </a>
                <a href="#" class="nav-item logout-nav">`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add Profile to sidebar
    if (!content.includes('pharmacy-profile.html')) {
        content = content.replace(
            /(\s*)<a href="#" class="nav-item logout-nav">/,
            newNavItem
        );
    }
    
    // Convert hardcoded placeholders to translatable inputs in pharmacy files
    // E.g., <input ... placeholder="ابحث..."> -> <input ... class="lang-text" data-ar="ابحث..." data-en="Search..." placeholder="ابحث...">
    // Find all inputs with placeholder but no lang-text class, wait, it's safer to just do it manually or via targeted regex.
    // Or let's just write to the files using simple targeted replaces for inputs and selects.

    fs.writeFileSync(file, content, 'utf8');
});

console.log('Done modifying sidebars!');
