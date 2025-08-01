export const BLOCK_SHAPES = {
  // 1x1
  o1: [[1]],
  // 2x1
  i2: [[1, 1]],
  // 3x1
  i3: [[1, 1, 1]],
  // 4x1
  i4: [[1, 1, 1, 1]],
  // 5x1
  i5: [[1, 1, 1, 1, 1]],
  // 2x2
  o4: [
    [1, 1],
    [1, 1],
  ],
  // L-shape (3 blocks)
  l3: [
    [1, 0],
    [1, 1],
  ],
  // L-shape (4 blocks)
  l4: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  // L-shape (5 blocks)
  l5: [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  // T-shape (4 blocks)
  t4: [
    [1, 1, 1],
    [0, 1, 0],
  ],
  // S-shape (4 blocks)
  s4: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  // Corner (3 blocks)
  c3: [
    [1, 1],
    [1, 0],
  ],
  // Plus (5 blocks)
  p5: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
};

export const BLOCK_TYPES = Object.keys(BLOCK_SHAPES);

export const BLOCK_COLORS = [
  '#EF4444', // Red-500
  '#F97316', // Orange-500
  '#EAB308', // Yellow-500
  '#22C55E', // Green-500
  '#3B82F6', // Blue-500
  '#8B5CF6', // Violet-500
];

export type BlockShape = (0 | 1)[][];

export interface Block {
  id: string;
  shape: BlockShape;
  type: string;
  color: string;
  rotation: number;
}
