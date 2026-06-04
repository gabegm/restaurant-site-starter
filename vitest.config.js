import { defineConfig } from 'vitest/config';

// Simple YAML frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: '' };
  
  const yaml = match[1];
  const body = match[2];
  const data = {};
  const lines = yaml.split('\n');
  
  let currentKey = null;
  let isArray = false;
  let isObject = false;
  
  for (const line of lines) {
    if (line.startsWith('  ')) {
      if (isArray) {
        const item = line.trim().replace(/^- /, '');
        if (!data[currentKey]) data[currentKey] = [];
        data[currentKey].push(parseValue(item));
      } else if (isObject) {
        const [key, ...valueParts] = line.trim().split(':');
        if (key && valueParts.length > 0) {
          data[currentKey][key.trim()] = parseValue(valueParts.join(':').trim());
        }
      }
    } else if (line.startsWith('- ')) {
      if (isArray) {
        data[currentKey].push(parseValue(line.trim().replace(/^- /, '')));
      }
    } else if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (value === '' || value === '|' || value === '>') {
        currentKey = key.trim();
        isArray = false;
        isObject = false;
      } else if (value.startsWith('[') && value.endsWith(']')) {
        data[key.trim()] = parseValue(value);
        currentKey = null;
      } else {
        data[key.trim()] = parseValue(value);
        currentKey = null;
      }
    }
  }
  
  return { data, body };
}

function parseValue(value) {
  if (!value) return '';
  value = value.replace(/^["']|["']$/g, '');
  if (value === 'true') return true;
  if (value === 'false') return false;
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;
  return value;
}

// Parse markdown menu body into structured data
function parseMenuBody(body) {
  const categories = [];
  const lines = body.split('\n');
  let currentCategory = null;
  
  for (const line of lines) {
    const categoryMatch = line.match(/^##\s+(.+)$/);
    const itemMatch = line.match(/^\-\s+(.+?)\s+—\s+(.+?)\s+—\s+(.+?)(?:\s+—\s+(.+))?$/);
    
    if (categoryMatch) {
      currentCategory = { name: categoryMatch[1], items: [] };
      categories.push(currentCategory);
    } else if (itemMatch && currentCategory) {
      const item = {
        name: itemMatch[1].trim(),
        price: itemMatch[2].trim(),
        description: itemMatch[3].trim()
      };
      if (itemMatch[4]) {
        item.photo = itemMatch[4].trim();
      }
      currentCategory.items.push(item);
    }
  }
  
  return categories;
}

// Custom plugin to handle .md files
function frontmatterPlugin() {
  return {
    name: 'frontmatter',
    transform(code, id) {
      if (id.endsWith('.md')) {
        const { data, body } = parseFrontmatter(code);
        data.menu = parseMenuBody(body);
        return { code: `export default ${JSON.stringify(data)};` };
      }
    }
  };
}

export default defineConfig({
  test: {
    globals: true,
  },
  plugins: [frontmatterPlugin()],
});
