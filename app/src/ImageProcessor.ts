import { PRINTER_CONFIG } from "./constants";
import { MonochromeImageData } from "./types";

export class ImageProcessor {
  static async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  static convertToMonochrome(img: HTMLImageElement): MonochromeImageData {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Scale to printer width maintaining aspect ratio
    const printerWidth = PRINTER_CONFIG.WIDTH;
    const aspectRatio = img.height / img.width;
    const scaledHeight = Math.floor(printerWidth * aspectRatio);

    console.log("Image scaling:", {
      originalWidth: img.width,
      originalHeight: img.height,
      originalAspectRatio: aspectRatio,
      scaledWidth: printerWidth,
      scaledHeight,
      willRequireMultiplePasses: scaledHeight > PRINTER_CONFIG.MAX_HEIGHT,
      numberOfPasses: Math.ceil(scaledHeight / PRINTER_CONFIG.MAX_HEIGHT),
      scaledMM: {
        width: printerWidth * PRINTER_CONFIG.DOT_MM,
        height: scaledHeight * PRINTER_CONFIG.DOT_MM,
      },
    });

    canvas.width = printerWidth;
    canvas.height = scaledHeight;

    // Clear canvas with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, printerWidth, scaledHeight);

    ctx.drawImage(img, 0, 0, printerWidth, scaledHeight);
    const imageData = ctx.getImageData(0, 0, printerWidth, scaledHeight);

    // Convert to monochrome with error diffusion dithering
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < printerWidth; x++) {
        const i = (y * printerWidth + x) * 4;
        const brightness =
          (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) /
          3;
        const monochrome = brightness > PRINTER_CONFIG.THRESHOLD ? 255 : 0;
        imageData.data[i] = monochrome;
        imageData.data[i + 1] = monochrome;
        imageData.data[i + 2] = monochrome;
      }
    }

    return {
      width: printerWidth,
      height: scaledHeight,
      imageData,
    };
  }

  static drawPreview(imageData: ImageData, canvasId: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element with id ${canvasId} not found`);
    }

    // Set canvas size to match the printer's aspect ratio but scaled to fit nicely in the UI
    const maxPreviewWidth = 384; // Reasonable preview size
    const scale = maxPreviewWidth / imageData.width;
    canvas.width = maxPreviewWidth;
    canvas.height = Math.floor(imageData.height * scale);

    // Set CSS to ensure the canvas displays at the right size
    canvas.style.width = "100%";
    canvas.style.maxWidth = `${maxPreviewWidth}px`;
    canvas.style.height = "auto";
    canvas.style.border = "1px solid #ccc";

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scaled image data
    const scaledImageData = ctx.createImageData(canvas.width, canvas.height);

    // Simple nearest-neighbor scaling
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const sourceX = Math.floor(x / scale);
        const sourceY = Math.floor(y / scale);
        const sourceIndex = (sourceY * imageData.width + sourceX) * 4;
        const targetIndex = (y * canvas.width + x) * 4;

        scaledImageData.data[targetIndex] = imageData.data[sourceIndex];
        scaledImageData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
        scaledImageData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
        scaledImageData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
      }
    }

    ctx.putImageData(scaledImageData, 0, 0);
  }
}
