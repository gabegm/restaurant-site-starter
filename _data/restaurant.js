const fs = require("fs");
const path = require("path");

module.exports = function () {
  const dataPath = path.join(__dirname, "restaurant.md");
  const content = fs.readFileSync(dataPath, "utf-8");
  
  // Parse YAML frontmatter
  const frontmatterEnd = content.indexOf("---", 1);
  if (frontmatterEnd === -1) {
    console.error("No frontmatter found in restaurant.md");
    return {};
  }
  
  const frontmatterStr = content.substring(3, frontmatterEnd).trim();
  const body = content.substring(frontmatterEnd + 3).trim();
  
  // Simple YAML parser for our use case
  const data = {};
  const lines = frontmatterStr.split("\n");
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      data[key] = value;
    }
  }
  
  // Parse hours
  const hoursMatch = content.match(/hours:\s*\{([^}]+)\}/s);
  if (hoursMatch) {
    const hoursStr = hoursMatch[1];
    const hours = {};
    const dayMatches = hoursStr.matchAll(/(\w+):\s*"([^"]+)"/g);
    for (const dayMatch of dayMatches) {
      hours[dayMatch[1]] = dayMatch[2];
    }
    data.hours = hours;
  }
  
  // Parse social
  const socialMatch = content.match(/social:\s*\{([^}]+)\}/s);
  if (socialMatch) {
    const socialStr = socialMatch[1];
    const social = {};
    const socialMatches = socialStr.matchAll(/(\w+):\s*"([^"]+)"/g);
    for (const socialMatch of socialMatches) {
      social[socialMatch[1]] = socialMatch[2];
    }
    data.social = social;
  }
  
  // Parse boolean fields
  data.booking = data.booking === "true";
  data.delivery = data.delivery === "true";
  
  // Parse menu from body
  const categories = [];
  let currentCategory = null;
  const menuLines = body.split("\n");
  
  for (const line of menuLines) {
    const categoryMatch = line.match(/^##\s+(.+)$/);
    if (categoryMatch) {
      currentCategory = { name: categoryMatch[1].trim(), items: [] };
      categories.push(currentCategory);
      continue;
    }
    
    const itemMatch = line.match(/^-\s+(.+?)\s+—\s+(.+?)\s+—\s+(.+?)\s+—\s+(.+)$/);
    if (itemMatch) {
      if (currentCategory) {
        currentCategory.items.push({
          name: itemMatch[1].trim(),
          price: itemMatch[2].trim(),
          description: itemMatch[3].trim(),
          photo: itemMatch[4].trim()
        });
      }
      continue;
    }
    
    const itemMatchNoPhoto = line.match(/^-\s+(.+?)\s+—\s+(.+?)\s+—\s+(.+)$/);
    if (itemMatchNoPhoto) {
      if (currentCategory) {
        currentCategory.items.push({
          name: itemMatchNoPhoto[1].trim(),
          price: itemMatchNoPhoto[2].trim(),
          description: itemMatchNoPhoto[3].trim(),
          photo: null
        });
      }
    }
  }
  
  data.menu = categories;
  
  return data;
};
