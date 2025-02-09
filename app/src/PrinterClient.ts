import { ImageProcessor } from "./ImageProcessor";
import { PrinterCommands } from "./PrinterCommands";
import { PRINTER_CONFIG } from "./constants";

export class PrinterClient {
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

  static async printText(text: string): Promise<void> {
    const command = PrinterCommands.createTextCommand(text);
    await this.sendCommand(command);
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
