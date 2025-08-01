'use server';

/**
 * @fileOverview Provides an AI-powered hint for the Blast Tangle game.
 *
 * - getHint - A function that generates a hint for the player.
 * - GetHintInput - The input type for the getHint function.
 * - GetHintOutput - The return type for the getHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetHintInputSchema = z.object({
  grid: z
    .array(z.array(z.number()))
    .describe('The current state of the game grid.'),
  blocks: z
    .array(z.array(z.array(z.number())))
    .describe('The available blocks to place.'),
});
export type GetHintInput = z.infer<typeof GetHintInputSchema>;

const GetHintOutputSchema = z.object({
  hint: z
    .object({
      blockIndex: z
        .number()
        .describe('The index of the block to use from the blocks array.'),
      x: z.number().describe('The x coordinate to place the block at.'),
      y: z.number().describe('The y coordinate to place the block at.'),
      rotation: z
        .number()
        .describe('The number of 90-degree rotations to apply to the block.'),
    })
    .nullable()
    .describe(
      'A suggested move, or null if no valid moves are possible. Rotation is number of 90 degree rotations.'
    ),
  reasoning: z.string().describe('The AI reasoning for the hint.'),
});
export type GetHintOutput = z.infer<typeof GetHintOutputSchema>;

export async function getHint(input: GetHintInput): Promise<GetHintOutput> {
  return getHintFlow(input);
}

const getHintPrompt = ai.definePrompt({
  name: 'getHintPrompt',
  input: {schema: GetHintInputSchema},
  output: {schema: GetHintOutputSchema},
  prompt: `You are an expert AI assistant for the "Blast Tangle" puzzle game. Your goal is to provide the most strategic hint to the user.

The game is played on a 10x10 grid. The player is given a set of blocks to place. When a row or column is completely filled, it is cleared, and the player scores points.

Analyze the provided grid and available blocks to find the optimal move. The best move is one that:
1.  Maximizes the number of cleared lines (both rows and columns).
2.  If clearing lines is not immediately possible, sets up the board for future line clears.
3.  Utilizes blocks in a way that keeps the board open and avoids creating unfillable gaps.
4.  Considers all possible rotations for each block to find the best fit.

Here is the current game state:

**Grid State (0 is empty, 1 is filled):**
{{#each grid}}
  {{this}}
{{/each}}

**Available Blocks:**
{{#each blocks}}
  **Block {{@index}}:**
  {{#each this}}
    {{this}}
  {{/each}}
{{/each}}

Your task is to return a single, optimal move in JSON format. Provide your reasoning for why this move is the best strategic choice. If no valid moves are possible, return null for the hint.`,
});

const getHintFlow = ai.defineFlow(
  {
    name: 'getHintFlow',
    inputSchema: GetHintInputSchema,
    outputSchema: GetHintOutputSchema,
  },
  async input => {
    // Check for valid moves here before calling the model, and return null immediately if there aren't any. This avoids unnecessary LLM calls.
    const validMoves = findValidMoves(input.grid, input.blocks);
    if (validMoves.length === 0) {
      return {
        hint: null,
        reasoning: 'No valid moves available.',
      };
    }

    const {output} = await getHintPrompt(input);
    return output!;
  }
);

function findValidMoves(
  grid: number[][],
  blocks: number[][][]
): {
  blockIndex: number;
  x: number;
  y: number;
  rotation: number;
}[] {
  const validMoves: {
    blockIndex: number;
    x: number;
    y: number;
    rotation: number;
  }[] = [];
  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const block = blocks[blockIndex];
    for (let rotation = 0; rotation < 4; rotation++) {
      const rotatedBlock = rotateBlock(block, rotation);
      for (let y = 0; y <= grid.length - rotatedBlock.length; y++) {
        for (let x = 0; x <= grid[0].length - rotatedBlock[0].length; x++) {
          if (isValidMove(grid, rotatedBlock, x, y)) {
            validMoves.push({
              blockIndex: blockIndex,
              x: x,
              y: y,
              rotation: rotation,
            });
          }
        }
      }
    }
  }
  return validMoves;
}

function rotateBlock(block: number[][], rotations: number): number[][] {
  let rotatedBlock = block;
  for (let i = 0; i < rotations; i++) {
    rotatedBlock = rotatedBlock[0].map((val, index) =>
      rotatedBlock.map(row => row[index]).reverse()
    );
  }
  return rotatedBlock;
}

function isValidMove(
  grid: number[][],
  block: number[][],
  x: number,
  y: number
): boolean {
  for (let i = 0; i < block.length; i++) {
    for (let j = 0; j < block[i].length; j++) {
      if (block[i][j] === 1 && grid[y + i][x + j] === 1) {
        return false;
      }
    }
  }
  return true;
}
