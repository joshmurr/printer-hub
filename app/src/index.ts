import { ImageProcessor } from "./ImageProcessor";
import { PrinterClient } from "./PrinterClient";
import { PrinterCommands } from "./PrinterCommands";

export async function handlePrintText(): Promise<void> {
  const inputElement = document.getElementById("printText") as HTMLInputElement;
  if (!inputElement?.value) {
    alert("Please enter some text to print");
    return;
  }
  await PrinterClient.printText(inputElement.value, { shouldCut: true });
}

export async function handlePrintTest(): Promise<void> {
  await PrinterClient.printText("Test Print", { shouldCut: true });
}

export async function handleFeedAndCut(): Promise<void> {
  await PrinterClient.printText("\n\n\n\n", { shouldCut: true });
}

export async function handlePrintImageFromUrl(): Promise<void> {
  const inputElement = document.getElementById("printUrl") as HTMLInputElement;
  if (!inputElement?.value) {
    alert("Please enter an image URL");
    return;
  }

  try {
    const img = await ImageProcessor.loadImage(inputElement.value);
    const { imageData } = ImageProcessor.convertToMonochrome(img);
    await PrinterCommands.printLargeImage(imageData);
    console.log("Image printed successfully");
  } catch (error) {
    console.error("Error printing image:", error);
  }
}

export async function handlePrintTestPattern(): Promise<void> {
  const command = PrinterCommands.createTestPattern();
  await PrinterClient.sendCommand(command, true);
}

export async function handleFeed(): Promise<void> {
  const command = PrinterCommands.createFeedCommand();
  await PrinterClient.sendCommand(command, true);
}

export async function handleCut(): Promise<void> {
  const command = PrinterCommands.createCutCommand();
  await PrinterClient.sendCommand(command, true);
}

window.printerHub = {
  handlePrintText,
  handlePrintTest,
  handleFeedAndCut,
  handlePrintImageFromUrl,
  handlePrintTestPattern,
  handleFeed,
  handleCut,
};
