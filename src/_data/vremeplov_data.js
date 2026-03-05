const core = require("./timelines/vremeplov.core.json");
const hr = require("./timelines/vremeplov.hr.json");
const en = require("./timelines/vremeplov.en.json");
const it = require("./timelines/vremeplov.it.json");

const defaultLocale = "hr";

function asMap(items, keyField) {
  return (items || []).reduce((acc, item) => {
    if (item && item[keyField]) {
      acc[item[keyField]] = item;
    }
    return acc;
  }, {});
}

function mergeLocale(baseLocaleData, localeData) {
  const baseSegments = asMap(baseLocaleData.segments, "key");
  const localeSegments = asMap(localeData.segments, "key");
  const baseEvents = asMap(baseLocaleData.events, "id");
  const localeEvents = asMap(localeData.events, "id");

  const segments = core.segments.map((segment) => ({
    ...segment,
    ...(baseSegments[segment.key] || {}),
    ...(localeSegments[segment.key] || {}),
  }));

  const events = core.events.map((event) => ({
    ...event,
    ...(baseEvents[event.id] || {}),
    ...(localeEvents[event.id] || {}),
  }));

  return {
    config: {
      ...core.config,
      ...baseLocaleData.config,
      ...localeData.config,
      segments,
    },
    segments,
    events,
    ui: {
      ...(baseLocaleData.ui || {}),
      ...(localeData.ui || {}),
    },
  };
}

module.exports = {
  defaultLocale,
  byLocale: {
    hr: mergeLocale(hr, {}),
    en: mergeLocale(hr, en),
    it: mergeLocale(hr, it),
  },
};
