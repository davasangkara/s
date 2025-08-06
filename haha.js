const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/images/payments');

if (!fs.existsSync(dir)) {
  console.log('❌ Folder tidak ditemukan:', dir);
} else {
  const files = fs.readdirSync(dir);
  console.log('✅ File ditemukan:', files);
}
