'use client';

import { Button } from '@/components/ui/button';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export default function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in">
      <div className="bg-card/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-fade-in-up border border-border">
        <h2 className="text-4xl font-bold text-destructive-foreground mb-2">Game Over</h2>
        <p className="text-lg text-muted-foreground mb-4">Your final score is:</p>
        <p className="text-6xl font-bold text-primary-foreground mb-8">{score}</p>
        <Button onClick={onRestart} size="lg" className="font-bold text-lg rounded-full px-8 py-6">Play Again</Button>
      </div>
    </div>
  );
}
