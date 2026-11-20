/// <reference types="youtube" />

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
  namespace App {}
}

export {};
