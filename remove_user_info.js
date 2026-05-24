const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

const removeUserInfo = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Regex to match <div class="user-info-area"> ... </div>
            // Assuming it doesn't contain nested </div> that break the regex, 
            // but let's be more precise with matching the exact known structure or using a simple state machine / lazy matching.
            
            // This regex matches <div class="user-info-area"> and everything until the third </div> since it contains exactly two nested divs (user-texts, user-avatar).
            // Actually, a simpler way is to replace the whole block since it's very consistent.
            
            const regex = /<div class="user-info-area">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
            // Wait, let's use a safer replace:
            // Match from <div class="user-info-area"> up to the </div> that closes it.
            // Since we know the exact inner structure: 
            // <div class="user-info-area"> ... <div class="user-texts">...</div> ... <div class="user-avatar"...>...</div> ... </div>
            
            const regex2 = /[ \t]*<div class="user-info-area">[\s\S]*?<div class="user-texts">[\s\S]*?<\/div>[\s\S]*?<div class="user-avatar"[\s\S]*?<\/div>[\s\S]*?<\/div>\r?\n?/g;
            
            if (regex2.test(content)) {
                content = content.replace(regex2, '');
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${file}`);
            }
        }
    });
};

removeUserInfo(directoryPath);
