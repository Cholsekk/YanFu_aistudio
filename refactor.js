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
// We need to be careful not to replace the implementation of this.request itself
// The implementation is: private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T>
// We only want to replace calls.
// Calls are usually return this.request(...) or await this.request(...)
content = content.replace(/return this\.request\(([^,]+)\);/g, 'return this.get($1);');
content = content.replace(/await this\.request\(([^,]+)\);/g, 'await this.get($1);');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');
