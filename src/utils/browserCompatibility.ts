
/**
 * Browser Compatibility Utility
 * 
 * This utility provides functions to detect browser capabilities and apply appropriate polyfills
 * for better cross-browser compatibility.
 */

/**
 * Detects the browser and its version
 * @returns An object with browser name and version information
 */
export function detectBrowser(): { name: string; version: string } {
  const userAgent = navigator.userAgent;
  let browser = "Unknown";
  let version = "Unknown";

  // Detect Chrome
  if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edge") === -1 && userAgent.indexOf("Edg") === -1) {
    browser = "Chrome";
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match) version = match[1];
  } 
  // Detect Firefox
  else if (userAgent.indexOf("Firefox") > -1) {
    browser = "Firefox";
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) version = match[1];
  } 
  // Detect Safari (not Chrome or Firefox)
  else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    browser = "Safari";
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) version = match[1];
  } 
  // Detect Edge (Chromium-based)
  else if (userAgent.indexOf("Edg") > -1) {
    browser = "Edge";
    const match = userAgent.match(/Edg\/(\d+\.\d+)/);
    if (match) version = match[1];
  } 
  // Detect Internet Explorer
  else if (userAgent.indexOf("Trident") > -1) {
    browser = "Internet Explorer";
    const match = userAgent.match(/rv:(\d+\.\d+)/);
    if (match) version = match[1];
  }

  return { name: browser, version };
}

/**
 * Checks if the browser supports modern features
 * @returns Boolean indicating if the browser has good support for modern features
 */
export function hasGoodBrowserSupport(): boolean {
  const { name, version } = detectBrowser();
  const versionNum = parseFloat(version);
  
  // Define minimum supported versions
  switch (name) {
    case "Chrome": return versionNum >= 80;
    case "Firefox": return versionNum >= 75;
    case "Safari": return versionNum >= 13.1;
    case "Edge": return versionNum >= 80;
    case "Internet Explorer": return false; // IE is not well-supported for modern web apps
    default: return true; // Assume support for unknown browsers
  }
}

/**
 * Applies necessary polyfills based on browser detection
 */
export function applyPolyfills(): void {
  // Add Object.fromEntries polyfill
  if (!Object.fromEntries) {
    Object.fromEntries = function(entries: any) {
      return [...entries].reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
    };
  }

  // Add other polyfills as needed
  // Note: Most browsers have built-in support for Promise, fetch, etc.
  // but you might need polyfills for older browsers
}
