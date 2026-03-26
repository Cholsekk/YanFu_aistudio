const fs = require('fs');

const filePath = 'services/apiService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace this.request(..., { method: 'POST', body: ... })
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'POST',\s*body:\s*([^}]+)\s*\}\)/g, 'this.post($1, $2)');

// Replace this.request(..., { method: 'POST' })
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'POST'\s*\}\)/g, 'this.post($1)');

// Replace this.request(..., { method: 'PUT', body: ... })
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'PUT',\s*body:\s*([^}]+)\s*\}\)/g, 'this.put($1, $2)');

// Replace this.request(..., { method: 'PUT' })
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'PUT'\s*\}\)/g, 'this.put($1)');

// Replace this.request(..., { method: 'DELETE', body: ... })
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'DELETE',\s*body:\s*([^}]+)\s*\}\)/g, 'this.del($1, $2)');

// Replace this.request(..., { method: 'DELETE' })
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'DELETE'\s*\}\)/g, 'this.del($1)');

// Replace this.request(url) -> this.get(url)
content = content.replace(/return this\.request\(([^,]+)\);/g, 'return this.get($1);');
content = content.replace(/await this\.request\(([^,]+)\);/g, 'await this.get($1);');

// Handle multiline this.request(url, { method: 'POST', body: ... })
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'POST',\s*body:\s*([^}]+)\s*\}\)/gm, 'this.post($1, $2)');

// Let's just use a more robust regex for multiline
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'POST',\s*body:\s*([\s\S]*?)\s*\}\)/g, 'this.post($1, $2)');
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'POST'\s*\}\)/g, 'this.post($1)');
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'PUT',\s*body:\s*([\s\S]*?)\s*\}\)/g, 'this.put($1, $2)');
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'PUT'\s*\}\)/g, 'this.put($1)');
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'DELETE',\s*body:\s*([\s\S]*?)\s*\}\)/g, 'this.del($1, $2)');
content = content.replace(/this\.request\(([^,]+),\s*\{\s*method:\s*'DELETE'\s*\}\)/g, 'this.del($1)');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');
