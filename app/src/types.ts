import {
  handleCut,
  handleFeedAndCut,
  handlePrintImageFromUrl,
  handlePrintTest,
  handlePrintTestPattern,
  handlePrintText,
} from ".";

declare global {
  interface Window {
    printerHub: {
      handlePrintText: typeof handlePrintText;
      handlePrintTest: typeof handlePrintTest;
      handleFeedAndCut: typeof handleFeedAndCut;
      handlePrintImageFromUrl: typeof handlePrintImageFromUrl;
      handlePrintTestPattern: typeof handlePrintTestPattern;
      handleFeed: typeof handleFeedAndCut;
      handleCut: typeof handleCut;
    };
  }
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface MonochromeImageData extends ImageDimensions {
  imageData: ImageData;
}
