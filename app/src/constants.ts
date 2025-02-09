export const PRINTER_CONFIG = {
  SERVER_URL: "http://192.168.1.21:3001",
  WIDTH: 512, // Changed to match printer spec
  DPI: 180, // Added DPI from spec
  DOT_MM: 0.141, // Added mm per dot from spec
  COMMANDS: {
    INITIALIZE: "\x1B\x40",
    RASTER_MODE: "\x1D\x76\x30\x00",
    ESC: "\x1B",
    FEED: "\x64",
    LINE_FEED: "\x0A",
    FULL_CUT: "\x1D\x56\x00", // GS V 0 - Full cut
    PARTIAL_CUT: "\x1D\x56\x01", // GS V 1 - Partial cut with left-side uncut
  },
  THRESHOLD: 128,
  MAX_HEIGHT: 443, // ~62.5mm at 180 DPI
} as const;
