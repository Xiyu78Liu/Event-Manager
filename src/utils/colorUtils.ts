export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 99, g: 102, b: 241 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function lightenColor(hex: string, amount: number = 40): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
}

export function darkenColor(hex: string, amount: number = 30): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r - amount, g - amount, b - amount);
}

export const PRESET_THEMES = [
  { name: 'Blue', value: '#376996', colors: ['#1D3461', '#1F487E', '#376996', '#6290C8', '#829CBC'] },
  { name: 'Cyan', value: '#AED1E6', colors: ['#CFE8EF', '#C6DBF0', '#AED1E6', '#A0C4E2', '#85C7DE'] },
  { name: 'Green', value: '#6F9283', colors: ['#696D7D', '#6F9283', '#8D9F87', '#CDC6A5', '#F0DCCA'] },
  { name: 'Magenta', value: '#932F6D', colors: ['#420039', '#932F6D', '#E07BE0', '#DCCCFF', '#F6F2FF'] },
  { name: 'Misty Rose', value: '#D7B29D', colors: ['#DDE8B9', '#E8D2AE', '#D7B29D', '#CB8589', '#796465'] },
  { name: 'Amethyst', value: '#B18FCF', colors: ['#D8D8F6', '#B18FCF', '#978897', '#494850', '#2C2C34'] },
  { name: 'Blood', value: '#DA344D', colors: ['#EF7674', '#EC5766', '#DA344D', '#D91E36', '#C42348'] },
  { name: 'Cold', value: '#9893DA', colors: ['#BBBDF6', '#9893DA', '#797A9E', '#72727E', '#625F63'] },
  { name: 'Prismarine', value: '#85BDBF', colors: ['#C9FBFF', '#C2FCF7', '#85BDBF', '#57737A', '#040F0F'] },
  { name: 'Mint Cream', value: '#7A918E', colors: ['#392F5A', '#7A918E', '#D2EFF3', '#EFF6EE', '#E7F1F1'] },
  { name: 'Yellow', value: '#BDB747', colors: ['#735F3D', '#BDB747', '#E1CE7A', '#FDD692', '#C2C5DD'] },
];

export const SOLID_COLORS = [
  { name: '靛蓝', value: '#6366f1' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '绿色', value: '#10b981' },
  { name: '橙色', value: '#f97316' },
  { name: '粉色', value: '#ec4899' },
  { name: '红色', value: '#ef4444' },
];
