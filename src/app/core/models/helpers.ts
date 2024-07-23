export function constructFullSquareSVG(size: number, color: string): string {
  return `<svg width="${size}" height="${size}" style="display: block">
      <rect width="${size}" height="${size}" fill="${color}"></rect>
      </svg>`;
}
