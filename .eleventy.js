const MarkdownIt = require("markdown-it");
const md = new MarkdownIt({ html: true, linkify: true });

module.exports = function (eleventyConfig) {
  
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
