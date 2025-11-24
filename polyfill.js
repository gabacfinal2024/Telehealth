// Polyfill for URL.canParse (added in Node.js 18.17.0)
// This fixes compatibility with Node.js 18.14.2
if (typeof URL !== 'undefined' && typeof URL.canParse === 'undefined') {
  URL.canParse = function(url, base) {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}

