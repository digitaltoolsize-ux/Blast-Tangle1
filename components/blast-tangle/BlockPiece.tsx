'use client';

import { type Block } from '@/lib/blast-tangle/blocks';
import { cn } from '@/lib/utils';
import React from 'react';

interface BlockPieceProps {
  block: Block;
  onRotate?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  isGhost?: boolean;
}

export default function BlockPiece({ block, onRotate, onDragStart, onDragEnd, isGhost = false }: BlockPieceProps) {
  const { shape, color } = block;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(e);
  };

  const cellSize = isGhost ? 'min(9vw, 36px)' : 'min(7vw, 30px)'; // Ghost is board-sized, original is smaller
  const gridTemplateColumns = `repeat(${shape[0].length}, ${cellSize})`;

  return (
    <div
      draggable={!isGhost}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onRotate}
      className={cn(
        'p-2 transition-transform duration-200',
        !isGhost && 'cursor-grab active:cursor-grabbing hover:scale-110',
        isGhost && 'opacity-70'
      )}
      title={!isGhost ? "Click to rotate, drag to place" : ""}
    >
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: gridTemplateColumns,
        }}
      >
        {shape.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={cn(
                'rounded-sm aspect-square',
                cell === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
              style={{ 
                backgroundColor: cell === 1 ? color : 'transparent',
                width: cellSize,
                height: cellSize,
                boxShadow: cell === 1 ? 'inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.2)' : 'none',
               }}
            />
          ))
        )}
      </div>
    </div>
  );
}
