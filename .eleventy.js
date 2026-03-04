module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/hr": "hr" });
  eleventyConfig.addPassthroughCopy("src/index.html");

  return {
    dir: {
      input: "src",
      output: "dist"
    },
    templateFormats: ["njk", "md"]
  };
};
