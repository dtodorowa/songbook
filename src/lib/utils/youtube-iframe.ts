/**
 * Load the YouTube IFrame Player API and resolve once `window.YT` is ready.
 *
 * The API is a global singleton delivered by a `<script>` tag: the tag is
 * injected once, and YouTube calls `window.onYouTubeIframeAPIReady` when the
 * `YT` namespace (its `Player` constructor + `PlayerState` enum) is available.
 * Resolves immediately if the API is already loaded. Chains any existing
 * `onYouTubeIframeAPIReady` so multiple players can share one script load.
 *
 * Replaces the per-component `loadYTAPI(): Promise<any>` copies.
 */
export function loadYouTubeIframeAPI(): Promise<typeof YT> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      // YouTube guarantees `window.YT` is populated before this fires.
      resolve(window.YT as typeof YT);
    };
    if (!document.querySelector("script[data-yt-api]")) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.dataset.ytApi = "1";
      document.head.appendChild(s);
    }
  });
}
