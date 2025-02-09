import { PrinterClient } from "./PrinterClient";
import { PRINTER_CONFIG } from "./constants";

export class PrinterCommands {
  static createTextCommand(text: string): string {
    return `${PRINTER_CONFIG.COMMANDS.INITIALIZE}${text}${PRINTER_CONFIG.COMMANDS.FEED_AND_CUT}`;
  }

  static createPrinterBitmapCommand(
    width: number,
    height: number,
    imageData: ImageData,
    includeFeed: boolean = true,
  ): ArrayBuffer {
    const bytesPerLine = Math.ceil(width / 8);
    const rasterData = new Uint8Array(bytesPerLine * height);

    // Convert image data to printer format
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const byteIndex = y * bytesPerLine + Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);

        if (imageData.data[pixelIndex] === 0) {
          rasterData[byteIndex] |= 1 << bitIndex;
        }
      }
    }

    const commandStart = [
      0x1b,
      0x40, // ESC @ Initialize printer
      0x1d,
      0x76,
      0x30,
      0, // GS v 0 \0
      bytesPerLine & 0xff,
      (bytesPerLine >> 8) & 0xff,
      height & 0xff,
      (height >> 8) & 0xff,
    ];

    // Only include feed command if requested
    const commandEnd = includeFeed ? [0x0a] : [];

    const result = new Uint8Array(
      commandStart.length + rasterData.length + commandEnd.length,
    );

    result.set(commandStart, 0);
    result.set(rasterData, commandStart.length);
    if (commandEnd.length > 0) {
      result.set(commandEnd, commandStart.length + rasterData.length);
    }

    return result.buffer;
  }

  // Add this to your PrinterCommands class
  // Modified test pattern
  static createTestPattern(): ArrayBuffer {
    const width = PRINTER_CONFIG.WIDTH; // 512 dots
    const height = 180; // 1 inch
    const bytesPerLine = Math.ceil(width / 8);
    const rasterData = new Uint8Array(bytesPerLine * height);

    // Create a test grid pattern
    // Vertical lines every 64 dots (about 9mm)
    for (let x = 0; x < width; x += 64) {
      for (let y = 0; y < height; y++) {
        const byteIndex = y * bytesPerLine + Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);
        rasterData[byteIndex] |= 1 << bitIndex;
      }
    }

    // Horizontal lines every 30 dots (about 4.2mm)
    for (let y = 0; y < height; y += 30) {
      for (let x = 0; x < width; x++) {
        const byteIndex = y * bytesPerLine + Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);
        rasterData[byteIndex] |= 1 << bitIndex;
      }
    }

    // Command sequence - GS v 0
    const commandStart = [
      0x1b,
      0x40, // ESC @ Initialize printer
      0x1d,
      0x76,
      0x30,
      0, // GS v 0 \0
      bytesPerLine & 0xff, // xL
      (bytesPerLine >> 8) & 0xff, // xH
      height & 0xff, // yL
      (height >> 8) & 0xff, // yH
    ];

    const commandEnd = [0x0a]; // Line feed

    const result = new Uint8Array(
      commandStart.length + rasterData.length + commandEnd.length,
    );

    result.set(commandStart, 0);
    result.set(rasterData, commandStart.length);
    result.set(commandEnd, commandStart.length + rasterData.length);

    return result.buffer;
  }

  static createFeedCommand(lines: number = 5): ArrayBuffer {
    // ESC d n - Feed n lines
    const command = [
      0x1b,
      0x64,
      lines, // Feed n lines
    ];

    return new Uint8Array(command).buffer;
  }

  static async printLargeImage(imageData: ImageData): Promise<void> {
    const { width, height } = imageData;
    const numChunks = Math.ceil(height / PRINTER_CONFIG.MAX_HEIGHT);

    for (let i = 0; i < numChunks; i++) {
      const chunkHeight = Math.min(
        PRINTER_CONFIG.MAX_HEIGHT,
        height - i * PRINTER_CONFIG.MAX_HEIGHT,
      );
      const chunkCanvas = document.createElement("canvas");
      const ctx = chunkCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      chunkCanvas.width = width;
      chunkCanvas.height = chunkHeight;

      // Copy portion of original image
      ctx.putImageData(
        imageData,
        0,
        -i * PRINTER_CONFIG.MAX_HEIGHT,
        0,
        i * PRINTER_CONFIG.MAX_HEIGHT,
        width,
        chunkHeight,
      );

      const chunkImageData = ctx.getImageData(0, 0, width, chunkHeight);
      const isLastChunk = i === numChunks - 1;
      const command = PrinterCommands.createPrinterBitmapCommand(
        width,
        chunkHeight,
        chunkImageData,
        isLastChunk,
      );
      await PrinterClient.sendCommand(command, true);
    }
  }
}
