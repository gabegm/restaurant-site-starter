const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt({ html: true, linkify: true });

module.exports = function (eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  
  // Add markdown filter
  eleventyConfig.addFilter("markdown", (text) => {
    if (!text) return "";
    return md.render(text);
  });

  // Copy assets
  eleventyConfig.addPassthroughCopy({
    "assets/css": "css",
    "js": "js",
    "assets/logo.jpg": "logo.jpg",
    "assets/hero.jpg": "hero.jpg",
    "assets/menu": "assets/menu"
  });

  // Filter for formatting currency
  eleventyConfig.addFilter("currency", (value) => {
    if (typeof value === "number") {
      return `$${value.toFixed(2)}`;
    }
    return value;
  });

  // Filter for generating OSM iframe URL from coordinates
  eleventyConfig.addFilter("osmEmbedUrl", (coords) => {
    if (!coords) return "";
    const [lat, lon] = coords.split(",").map(c => parseFloat(c.trim()));
    if (isNaN(lat) || isNaN(lon)) return "";
    
    const span = 0.01;
    const bbox = `${lon - span},${lat - span},${lon + span},${lat + span}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lon}`;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      data: "_data",
      includes: "_includes",
      layouts: "_layouts"
    }
  };
};
