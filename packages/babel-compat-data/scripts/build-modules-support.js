const path = require("path");

const compatData = require("@mdn/browser-compat-data").javascript;
const { addElectronSupportFromChromium } = require("./chromium-to-electron");
const { writeFile, babel7Only } = require("./utils-build-data");

// Map mdn-browser-compat-data to browserslist browser names
const browserNameMap = {
  chrome_android: "and_chr",
  firefox_android: "and_ff",
  safari_ios: "ios",
  nodejs: "node",
  webview_android: "android",
  opera_android: "op_mob",
  samsunginternet_android: "samsung",
};

const browserSupportMap = {
  android: "chrome_android", // map to chrome here as Android WebView 61 is Chromium-based
};

function browserVersion(browser, version_added) {
  if (browser === "samsunginternet_android" && version_added === "8.0") {
    return "8.2"; // samsung 8.0 is not defined in browserslist
  }
  // fixme: preset-env maps opera_android as opera, this is incorrect as they have different engine mappings
  // see https://github.com/mdn/browser-compat-data/blob/master/browsers/opera_android.json
  if (browser === "opera_android" && version_added === "45") {
    return "48";
  }
  return version_added;
}

function generateModuleSupport(source) {
  const stats = source.__compat.support;
  const allowedBrowsers = {};

  Object.keys(stats).forEach(browser => {
    const browserName = browserNameMap[browser] || browser;
    // todo: remove this when we support deno
    if (browserName === "deno") return;
    let browserSupport = stats[browserSupportMap[browserName] || browser];
    if (Array.isArray(browserSupport)) {
      browserSupport = browserSupport[0]; // The first item is the most progressive support
    }
    if (
      browserSupport.version_added &&
      !browserSupport.flags &&
      !browserSupport.partial_implementation
    ) {
      allowedBrowsers[browserName] = browserVersion(
        browser,
        browserSupport.version_added
      );
    }
  });
  addElectronSupportFromChromium(allowedBrowsers);

  return allowedBrowsers;
}

const dataPath = path.join(__dirname, "../data/native-modules.json");
const processed = generateModuleSupport(compatData.statements.export);
babel7Only(() => {
  if (processed.ios) {
    processed.ios_saf = processed.ios;
  }
});
const data = {
  "es6.module": processed,
};
writeFile(data, dataPath, "native-modules");
exports.generateModuleSupport = generateModuleSupport;
