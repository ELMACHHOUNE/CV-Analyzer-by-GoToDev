// Apply polyfills for pdfjs-dist in Node.js/serverless environments
console.log("[Polyfills] Initializing DOM polyfills...");

if (typeof globalThis !== "undefined") {
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    (globalThis as any).DOMMatrix = class DOMMatrix {};
    console.log("[Polyfills] DOMMatrix polyfilled");
  }
  if (typeof (globalThis as any).Path2D === "undefined") {
    (globalThis as any).Path2D = class Path2D {};
    console.log("[Polyfills] Path2D polyfilled");
  }
  if (typeof (globalThis as any).ImageData === "undefined") {
    (globalThis as any).ImageData = class ImageData {
      constructor(
        public data: Uint8ClampedArray,
        public width: number,
        public height?: number,
      ) {}
    };
    console.log("[Polyfills] ImageData polyfilled");
  }
  if (typeof (globalThis as any).CanvasRenderingContext2D === "undefined") {
    (globalThis as any).CanvasRenderingContext2D = class CanvasRenderingContext2D {};
    console.log("[Polyfills] CanvasRenderingContext2D polyfilled");
  }
}

console.log("[Polyfills] Initialization complete");

