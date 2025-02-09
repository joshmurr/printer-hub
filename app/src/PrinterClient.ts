import { ImageProcessor } from "./ImageProcessor";
import { PrinterCommand, PrinterCommands } from "./PrinterCommands";
import { PRINTER_CONFIG } from "./constants";

export class PrinterClient {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.sendCommand(PRINTER_CONFIG.COMMANDS.INITIALIZE);
      this.initialized = true;
    }
  }

  static async sendCommand(
    command: string | ArrayBuffer,
    isBinary = false,
  ): Promise<void> {
    const statusDiv = document.getElementById("status");
    if (!statusDiv) {
      throw new Error("Status element not found");
    }

    try {
      statusDiv.textContent = "Sending print command...";
      statusDiv.className = "";

      // Log the command details
      console.log("Sending command with details:", {
        isBinary,
        contentType: isBinary ? "application/octet-stream" : "text/plain",
        commandType: command instanceof ArrayBuffer ? "ArrayBuffer" : "string",
        length:
          command instanceof ArrayBuffer ? command.byteLength : command.length,
      });

      const response = await fetch(`${PRINTER_CONFIG.SERVER_URL}/print`, {
        method: "POST",
        headers: {
          "Content-Type": isBinary ? "application/octet-stream" : "text/plain",
        },
        body: command,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log("Server response:", result);
      statusDiv.textContent = "Print command sent successfully";
    } catch (error) {
      console.error("Full error:", error);
      const errorDetails =
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
              stack: error.stack,
            }
          : error;
      console.error("Error details:", errorDetails);
      statusDiv.textContent = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      statusDiv.className = "error";
      throw error;
    }
  }

  static async printText(
    text: string,
    options: Omit<PrinterCommand, "text"> = {},
  ): Promise<void> {
    await this.initialize();

    // First send just the text and line feeds
    const textCommand = PrinterCommands.createTextCommand({
      text,
      shouldCut: false,
      ...options,
    });
    await this.sendCommand(textCommand);

    // If cutting is requested, wait a bit then send cut command
    if (options.shouldCut !== false) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
      await this.sendCommand(PRINTER_CONFIG.COMMANDS.FULL_CUT);
    }
  }

  // Example usage for multiple prints
  static async printMultipleTexts(texts: string[]): Promise<void> {
    await this.initialize();

    // Print all texts except the last one without cutting
    for (let i = 0; i < texts.length - 1; i++) {
      const command = PrinterCommands.createTextCommand({
        text: texts[i],
        shouldCut: false,
      });
      await this.sendCommand(command);
    }

    // Print the last text with a cut
    if (texts.length > 0) {
      const command = PrinterCommands.createTextCommand({
        text: texts[texts.length - 1],
        shouldCut: true,
      });
      await this.sendCommand(command);
    }
  }

  static async printImage(imageUrl: string): Promise<void> {
    const img = await ImageProcessor.loadImage(imageUrl);
    const monochromeData = ImageProcessor.convertToMonochrome(img);
    ImageProcessor.drawPreview(monochromeData.imageData, "previewCanvas");

    const command = PrinterCommands.createPrinterBitmapCommand(
      monochromeData.width,
      monochromeData.height,
      monochromeData.imageData,
    );

    await this.sendCommand(command, true);
  }
}
