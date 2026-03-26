const fs = require('fs');

const filePath = 'services/apiService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// We need to replace this.request(url, { method: 'POST', body: data }) with this.post(url, data)
// We need to replace this.request(url, { method: 'POST' }) with this.post(url)
// We need to replace this.request(url, { method: 'PUT', body: data }) with this.put(url, data)
// We need to replace this.request(url, { method: 'PUT' }) with this.put(url)
// We need to replace this.request(url, { method: 'DELETE', body: data }) with this.del(url, data)
// We need to replace this.request(url, { method: 'DELETE' }) with this.del(url)
// We need to replace this.request(url) with this.get(url)

// First, let's fix the broken ones like `this.request('/apps/import', data as any`
// Wait, if it's `this.request(url, data as any)`, it's broken because `data as any` is not options.
// Let's just write a script to log all `this.request` calls to see what they look like.

const matches = content.match(/this\.request\([^)]*\)/g);
if (matches) {
  matches.forEach(m => console.log(m));
}
