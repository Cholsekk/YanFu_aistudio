const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'services/apiService.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences of '/console/api' with '' except for the API_PREFIX definition
content = content.replace(/const API_PREFIX = '\/console\/api';/g, '___API_PREFIX_TEMP___');
content = content.replace(/'\/console\/api/g, "'");
content = content.replace(/`\/console\/api/g, "`");
content = content.replace(/"\/console\/api/g, '"');
content = content.replace(/___API_PREFIX_TEMP___/g, "const API_PREFIX = '/console/api';");

// Also replace the mock endpoint match
content = content.replace(/endpoint\.match\(\/\\\/console\\\/api\\\/apps\\\/\[\^\\\/\]\+\\\/export\/\)/g, "endpoint.match(/\\/apps\\/\\[^\\/]+\\/export/)");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced successfully');
