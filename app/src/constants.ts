// constants.ts
export const PRINTER_CONFIG = {
  SERVER_URL: "http://192.168.1.21:3001",
  WIDTH: 512, // Changed to match printer spec
  DPI: 180, // Added DPI from spec
  DOT_MM: 0.141, // Added mm per dot from spec
  COMMANDS: {
    INITIALIZE: "\x1B\x40",
    RASTER_MODE: "\x1D\x76\x30\x00",
    FEED_AND_CUT: "\x0A\x1D\x56\x41",
  },
  THRESHOLD: 128,
  MAX_HEIGHT: 443, // ~62.5mm at 180 DPI
} as const;
