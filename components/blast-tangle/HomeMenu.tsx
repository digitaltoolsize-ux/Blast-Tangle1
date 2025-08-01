
'use client';

import { Button } from '@/components/ui/button';
import { Crown, Trash2 } from 'lucide-react';
import Image from 'next/image';
import GameModeCard from './GameModeCard';

interface HomeMenuProps {
  onStartGame: () => void;
  onContinueGame: () => void;
  onShowScores: () => void;
  hasSave: boolean;
  bestScore: number;
  onClearSave: () => void;
}

const TitleLetter = ({ children, colorClass }: { children: React.ReactNode; colorClass: string }) => (
    <span className={`inline-block text-shadow-custom ${colorClass}`}>
        {children}
    </span>
);

export default function HomeMenu({ onStartGame, onContinueGame, hasSave, bestScore, onShowScores, onClearSave }: HomeMenuProps) {
  const title = "Blast Tangle";
  const colors = [
    'text-[#4856a9]', 'text-[#6c54a5]', 'text-[#9f4f9f]', 'text-[#cb4e98]', 'text-[#f36f3c]', 
    '', 
    'text-[#f5a133]', 'text-[#f8c42b]', 'text-[#cb4e98]', 'text-[#9f4f9f]', 'text-[#6c54a5]', 'text-[#4856a9]'
  ];
  
  return (
    <div className="flex flex-col items-center justify-between min-h-screen w-full p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="w-full flex justify-end">
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onShowScores}>
            <div className="relative h-14 w-14">
                <Image src="https://placehold.co/100x100.png" data-ai-hint="gold medal" alt="Medal" layout="fill" className="rounded-full" />
            </div>
            <p className="font-bold text-white">Medal</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center text-center -mt-24">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-1 whitespace-nowrap">
            <span className="animate-title-shine">
              {title.split("").map((letter, index) => (
                  letter === " " ? <span key={index}>&nbsp;</span> : <TitleLetter key={index} colorClass={colors[index]}>{letter}</TitleLetter>
              ))}
            </span>
        </h1>
        <p className="font-semibold text-white/90 text-xl tracking-wider">ADVENTURE MASTER</p>
      </div>
      
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center text-slate-700 shadow-lg">
          <p className="font-bold">Consecutive Daily Victories</p>
          <div className="flex items-center justify-center gap-2 mt-1">
             <div className="relative h-10 w-10">
                <Image src="https://placehold.co/100x100.png" data-ai-hint="trophy icon" alt="Win" layout="fill" />
            </div>
            <p className="font-bold text-2xl">x0</p>
          </div>
        </div>

        <GameModeCard
          title="Adventure"
          titleColor="text-pink-500"
          bgColor="bg-gradient-to-br from-yellow-400 to-orange-500"
          onClick={onStartGame}
        >
          <div className="flex items-center justify-between">
            <div className="relative h-20 w-20 bg-gray-700/50 rounded-md">
                 <Image src="https://placehold.co/200x200.png" data-ai-hint="jungle adventure" alt="Adventure" layout="fill" className="rounded-md" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <p className="font-bold text-white text-stroke text-2xl">Level 1</p>
                <Button onClick={(e) => { e.stopPropagation(); onStartGame(); }} size="lg" className="font-bold text-lg shadow-lg bg-green-500 hover:bg-green-600 text-white rounded-lg w-32">
                  Play
                </Button>
            </div>
          </div>
        </GameModeCard>
        
        <GameModeCard
          title="Classic"
          titleColor="text-cyan-400"
          bgColor="bg-gradient-to-br from-cyan-400 to-blue-600"
          onClick={hasSave ? onContinueGame : onStartGame}
        >
          <div className="flex items-center justify-between">
            <div className="relative h-20 w-20 bg-gray-800/50 rounded-md">
                <Image src="https://placehold.co/200x200.png" data-ai-hint="classic arcade" alt="Classic" layout="fill" className="rounded-md" />
            </div>
             <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-white font-bold text-2xl">
                    <Crown className="text-yellow-400 h-7 w-7" />
                    <span>{bestScore}</span>
                </div>
                <Button onClick={(e) => { e.stopPropagation(); hasSave ? onContinueGame() : onStartGame(); }} size="lg" className="font-bold text-lg shadow-lg bg-green-500 hover:bg-green-600 text-white rounded-lg w-32">
                   {hasSave ? 'Continue' : 'Play'}
                </Button>
            </div>
          </div>
        </GameModeCard>
        
        {hasSave && (
          <Button onClick={onClearSave} variant="destructive" className="mt-4">
            <Trash2 className="mr-2 h-4 w-4" /> Clear Saved Game
          </Button>
        )}
      </div>

    </div>
  );
}
