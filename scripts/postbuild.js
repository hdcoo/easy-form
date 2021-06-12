const fs = require('fs');
const path = require('path');

function replaceRcFormPath(filePath, newPath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, fileContent.replace(/rc-field-form\/es/g, newPath));
}

replaceRcFormPath(path.join(__dirname, '../dist/lib/helper/rcForm.js'), 'rc-field-form/lib');
