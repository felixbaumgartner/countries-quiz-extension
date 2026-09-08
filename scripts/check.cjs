const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ['storage']);
for (const directory of ['', 'js', 'data']) {
  for (const name of fs.readdirSync(path.join(root, directory))) {
    if (name.endsWith('.js')) {
      const filename = path.join(directory, name);
      new vm.Script(fs.readFileSync(path.join(root, filename), 'utf8'), { filename });
    }
  }
}
for (const filename of ['popup.html', 'settings.html', 'stats.html']) {
  const html = fs.readFileSync(path.join(root, filename), 'utf8');
  assert(!/<[^>]+\son\w+\s*=/i.test(html), `${filename}: inline event handler violates CSP`);
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    assert.equal(match[2].trim(), '', `${filename}: inline script violates CSP`);
    const src = match[1].match(/\bsrc="([^"]+)"/);
    assert(src && !src[1].includes(':'), `${filename}: scripts must be local`);
    assert(fs.existsSync(path.join(root, src[1])), `${filename}: missing ${src[1]}`);
  }
}
assert.equal(manifest.version, require('../package.json').version);
console.log('JavaScript syntax, runtime page CSP, script paths, permissions and version checks passed.');
