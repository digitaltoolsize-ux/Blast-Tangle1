'use client';

import { type Block } from '@/lib/blast-tangle/blocks';
import BlockPiece from './BlockPiece';

interface AvailableBlocksProps {
  blocks: Block[];
  onBlockRotate: (blockId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, block: Block) => void;
  onDragEnd: () => void;
}

export default function AvailableBlocks({ blocks, onBlockRotate, onDragStart, onDragEnd }: AvailableBlocksProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-4">
      {blocks.map((block) => (
        <BlockPiece
          key={block.id}
          block={block}
          onRotate={() => onBlockRotate(block.id)}
          onDragStart={(e) => onDragStart(e, block)}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  );
}
