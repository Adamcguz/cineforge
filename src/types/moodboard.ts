export interface MoodboardItem {
  id: string;
  type: 'image' | 'text' | 'color';
  x: number;
  y: number;
  width: number;
  height: number;
  caption?: string;
  content: string; // base64 data URL for images, text for text cards, hex for color swatches
  zIndex: number;
}
