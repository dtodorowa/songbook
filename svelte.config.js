import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Everything lives in the browser's IndexedDB, so the app is a pure SPA.
    adapter: adapter({ fallback: "index.html" }),
  },
};

export default config;
