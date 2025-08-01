'use client';

import { Button } from '@/components/ui/button';
import { Settings, Crown, Loader2, Lightbulb } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  bestScore: number;
  onSettings: () => void;
  onGetHint: () => void;
  isHintLoading: boolean;
  isGamePaused: boolean;
}

const ScoreCard = ({ title, score, icon }: { title: string, score: number, icon?: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    {icon}
    <p className="text-lg font-bold text-primary-foreground">{score}</p>
  </div>
);

export default function GameHeader({ score, bestScore, onSettings, onGetHint, isHintLoading, isGamePaused }: GameHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between p-4 bg-card/50 rounded-lg">
      <div className="flex items-center gap-4">
        <ScoreCard title="Best Score" score={bestScore} icon={<Crown className="h-6 w-6 text-yellow-400" />} />
      </div>
      <div>
        <p className="text-5xl font-bold text-primary-foreground text-shadow-custom">{score}</p>
      </div>
      <div className="flex gap-2">
         <Button variant="ghost" size="icon" onClick={onGetHint} disabled={isHintLoading || isGamePaused} aria-label="Get Hint">
          {isHintLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Lightbulb className="h-6 w-6" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
