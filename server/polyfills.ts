if (typeof globalThis !== "undefined") {
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    (globalThis as any).DOMMatrix = class DOMMatrix {};
  }
  if (typeof (globalThis as any).Path2D === "undefined") {
    (globalThis as any).Path2D = class Path2D {};
  }
  if (typeof (globalThis as any).ImageData === "undefined") {
    (globalThis as any).ImageData = class ImageData {
      constructor(
        public data: Uint8ClampedArray,
        public width: number,
        public height?: number,
      ) {}
    };
  }
  if (typeof (globalThis as any).CanvasRenderingContext2D === "undefined") {
    (globalThis as any).CanvasRenderingContext2D = class CanvasRenderingContext2D {};
  }
}

