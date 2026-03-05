function normalizePathPrefix(value) {
  if (!value || value === "/") {
    return "/";
  }

  const trimmed = String(value).trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}/` : "/";
}

function prefixRootPath(pathValue, pathPrefix) {
  if (!pathValue || pathPrefix === "/" || !pathValue.startsWith("/") || pathValue.startsWith("//")) {
    return pathValue;
  }

  if (pathValue.startsWith(pathPrefix)) {
    return pathValue;
  }

  return `${pathPrefix}${pathValue.slice(1)}`;
}

function prefixSrcsetValue(srcsetValue, pathPrefix) {
  return srcsetValue
    .split(",")
    .map((candidate) => {
      const part = candidate.trim();
      if (!part) {
        return candidate;
      }

      const [url, descriptor] = part.split(/\s+/, 2);
      const prefixed = prefixRootPath(url, pathPrefix);
      return descriptor ? `${prefixed} ${descriptor}` : prefixed;
    })
    .join(", ");
}

module.exports = function (eleventyConfig) {
  const isServeMode = process.argv.includes("--serve");
  const pathPrefix = isServeMode
    ? "/"
    : normalizePathPrefix(process.env.ELEVENTY_PATH_PREFIX);

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/hr": "hr" });

  if (pathPrefix !== "/") {
    eleventyConfig.addTransform("prefix-root-urls", (content, outputPath) => {
      if (!outputPath || !outputPath.endsWith(".html")) {
        return content;
      }

      let transformed = content;

      transformed = transformed.replace(
        /(href|src|poster|data-src|data-lb-image)\s*=\s*(['"])(\/(?!\/)[^'"]*)\2/gi,
        (_, attr, quote, value) => `${attr}=${quote}${prefixRootPath(value, pathPrefix)}${quote}`
      );

      transformed = transformed.replace(
        /(srcset|data-srcset)\s*=\s*(['"])([^'"]*)\2/gi,
        (_, attr, quote, value) => `${attr}=${quote}${prefixSrcsetValue(value, pathPrefix)}${quote}`
      );

      transformed = transformed.replace(
        /(content\s*=\s*['"][^'"]*url=)(\/(?!\/)[^'"]*)/gi,
        (_, start, value) => `${start}${prefixRootPath(value, pathPrefix)}`
      );

      return transformed;
    });
  }

  return {
    pathPrefix,
    dir: {
      input: "src",
      output: "dist"
    },
    templateFormats: ["njk", "md"]
  };
};
