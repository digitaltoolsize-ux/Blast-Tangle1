
'use client';

import type { Hint } from '@/hooks/useBlastTangleGame';
import { cn } from '@/lib/utils';
import type { DragEvent } from 'react';
import { BLOCK_COLORS, type Block } from '@/lib/blast-tangle/blocks';
import { useState, useCallback, useEffect, useRef } from 'react';
import BlockPiece from './BlockPiece';

interface GameBoardProps {
  grid: number[][];
  onDrop: (row: number, col: number) => void;
  hint: Hint | null;
  clearingCells: [number, number][];
  draggedBlock: Block | null;
}

const GRID_SIZE = 10;

export default function GameBoard({ grid, onDrop, hint, clearingCells, draggedBlock }: GameBoardProps) {
  const [dragOverCell, setDragOverCell] = useState<{row: number, col: number} | null>(null);
  const [pointerPosition, setPointerPosition] = useState({ x: -1000, y: -1000 });
  const boardRef = useRef<HTMLDivElement>(null);

  const canPlace = useCallback((currentGrid: number[][], block: Block | null, row: number, col: number) => {
    if (!block) return false;
    const { shape } = block;

    if (row < 0 || col < 0 || row + shape.length > GRID_SIZE || col + shape[0].length > GRID_SIZE) {
        return false;
    }

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c] === 1) {
          const gridRow = row + r;
          const gridCol = col + c;
          if (
            gridRow >= GRID_SIZE ||
            gridCol >= GRID_SIZE ||
            currentGrid[gridRow][gridCol] !== 0
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);
  
  const getCellFromEvent = (e: DragEvent<HTMLDivElement>): { row: number, col: number } | null => {
    const board = boardRef.current;
    if (!board) return null;

    const rect = board.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellWidth = rect.width / GRID_SIZE;
    const cellHeight = rect.height / GRID_SIZE;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col };
    }
    
    return null;
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setPointerPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    const cell = getCellFromEvent(e);
    if (cell) {
      setDragOverCell(cell);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverCell(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
     if (draggedBlock && dragOverCell) {
        const previewRow = dragOverCell.row;
        const previewCol = dragOverCell.col;
        if(canPlace(grid, draggedBlock, previewRow, previewCol)) {
            onDrop(previewRow, previewCol);
        }
    }
    setDragOverCell(null);
    setPointerPosition({ x: -1000, y: -1000 });
  };

  useEffect(() => {
    if (!draggedBlock) {
      setPointerPosition({ x: -1000, y: -1000 });
    }
  }, [draggedBlock]);
  
  const hintCells = new Set<string>();
  if (hint) {
    for (let r = 0; r < hint.shape.length; r++) {
      for (let c = 0; c < hint.shape[0].length; c++) {
        if (hint.shape[r][c] === 1) {
          hintCells.add(`${hint.position.y + r},${hint.position.x + c}`);
        }
      }
    }
  }

  const clearingCellsSet = new Set<string>(clearingCells.map(([r, c]) => `${r},${c}`));

  const previewCells = new Set<string>();
  let isPlacementValid = false;
  let previewRow = -1;
  let previewCol = -1;

  if(draggedBlock && dragOverCell) {
    previewRow = dragOverCell.row;
    previewCol = dragOverCell.col;
    isPlacementValid = canPlace(grid, draggedBlock, previewRow, previewCol);
    if(isPlacementValid) {
      for (let r = 0; r < draggedBlock.shape.length; r++) {
        for (let c = 0; c < draggedBlock.shape[0].length; c++) {
          if (draggedBlock.shape[r][c] === 1) {
            previewCells.add(`${previewRow + r},${previewCol + c}`);
          }
        }
      }
    }
  }


  return (
    <div
      ref={boardRef}
      className="relative grid gap-1 p-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        width: 'min(90vw, 400px)',
        height: 'min(90vw, 400px)',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isHintCell = hintCells.has(`${r},${c}`);
          const isClearingCell = clearingCellsSet.has(`${r},${c}`);
          const cellColor = cell > 0 ? BLOCK_COLORS[cell - 1] : 'transparent';
          const isPreviewCell = previewCells.has(`${r},${c}`);

          return (
            <div
              key={`${r}-${c}`}
              data-row={r}
              data-col={c}
              className="aspect-square w-full"
            >
              <div
                className={cn(
                  'w-full h-full rounded-sm transition-all duration-200 border-2',
                  cell === 0 && 'bg-secondary/30 border-transparent',
                  cell > 0 && 'scale-100',
                  cell > 0 && !isClearingCell && 'animate-fade-in',
                  isHintCell && 'bg-gray-500/50 scale-105 shadow-inner border-gray-400',
                  isClearingCell && 'cell-clearing',
                   isPreviewCell && 'opacity-50',
                  !isPlacementValid && dragOverCell && draggedBlock && 
                    (r >= dragOverCell.row && r < dragOverCell.row + draggedBlock.shape.length) &&
                    (c >= dragOverCell.col && c < dragOverCell.col + draggedBlock.shape[0].length) &&
                    draggedBlock.shape[r - dragOverCell.row][c - dragOverCell.col] === 1 &&
                    'bg-red-500/30 border-red-400'
                )}
                 style={{ 
                   backgroundColor: cell > 0 ? cellColor : (isPreviewCell ? draggedBlock?.color : undefined),
                   borderColor: cell > 0 ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                   boxShadow: cell > 0 ? 'inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.2)' : 'none'
                  }}
              />
            </div>
          );
        })
      )}
      {draggedBlock && (
        <div 
          className="absolute pointer-events-none transition-transform duration-75 ease-linear" 
          style={{ 
            transform: `translate(${pointerPosition.x}px, ${pointerPosition.y}px)`,
          }}>
          <BlockPiece block={draggedBlock} isGhost />
        </div>
      )}
    </div>
  );
}
