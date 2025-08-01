
'use client';

import { useBlastTangleGame } from '@/hooks/useBlastTangleGame';
import HomeMenu from '@/components/blast-tangle/HomeMenu';
import GameHeader from '@/components/blast-tangle/GameHeader';
import GameBoard from '@/components/blast-tangle/GameBoard';
import AvailableBlocks from '@/components/blast-tangle/AvailableBlocks';
import GameOverScreen from '@/components/blast-tangle/GameOverScreen';
import { useCallback, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { type Block } from '@/lib/blast-tangle/blocks';
import SettingsDialog from '@/components/blast-tangle/SettingsDialog';
import ScoreHistoryDialog from '@/components/blast-tangle/ScoreHistoryDialog';


export default function Home() {
  const game = useBlastTangleGame();
  const [draggedBlock, setDraggedBlock] = useState<{block: Block, element: HTMLElement} | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showClearSaveConfirm, setShowClearSaveConfirm] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScoreHistoryOpen, setIsScoreHistoryOpen] = useState(false);


  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, block: Block) => {
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '0.5';
    setDraggedBlock({block, element});
  }, []);
  
  const handleDragEnd = useCallback(() => {
    if (draggedBlock) {
      draggedBlock.element.style.opacity = '1';
    }
    setDraggedBlock(null);
  }, [draggedBlock]);

  const handleDrop = useCallback((row: number, col: number) => {
    if (draggedBlock) {
        const dropRow = row - Math.floor(draggedBlock.block.shape.length / 2);
        const dropCol = col - Math.floor(draggedBlock.block.shape[0].length / 2);
        game.handleBlockDrop(draggedBlock.block, dropRow, dropCol);
    }
    handleDragEnd();
  }, [draggedBlock, game, handleDragEnd]);

  const handleRestart = () => {
    setShowRestartConfirm(false);
    setIsSettingsOpen(false);
    game.restartGame();
  }

  const handleClearSave = () => {
    game.clearSave();
    setShowClearSaveConfirm(false);
  }

  const renderGameContent = () => {
    const isGameVisible = game.gameState === 'playing' || game.gameState === 'game-over' || game.gameState === 'paused';

    if (game.gameState === 'home') {
      return (
        <HomeMenu 
            onStartGame={game.startGame} 
            onContinueGame={game.continueGame} 
            hasSave={game.hasSave} 
            bestScore={game.bestScore}
            onShowScores={() => setIsScoreHistoryOpen(true)}
            onClearSave={() => setShowClearSaveConfirm(true)}
        />
      );
    }

    if (isGameVisible) {
       return (
          <div className="relative flex flex-col items-center gap-8 animate-fade-in w-full max-w-md mx-auto">
            <GameHeader 
              score={game.score} 
              bestScore={game.bestScore} 
              onSettings={() => {
                game.pauseGame();
                setIsSettingsOpen(true)}
              } 
              onGetHint={game.requestHint}
              isHintLoading={game.isHintLoading}
              isGamePaused={game.gameState === 'paused'}
            />
            <GameBoard 
              grid={game.grid} 
              onDrop={handleDrop} 
              hint={game.hint} 
              clearingCells={game.clearingCells} 
              draggedBlock={draggedBlock?.block ?? null} 
            />
            <AvailableBlocks 
              blocks={game.gameState !== 'game-over' ? game.availableBlocks : []} 
              onBlockRotate={game.handleRotateBlock} 
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
             {game.gameState === 'game-over' && (
                <GameOverScreen score={game.score} onRestart={game.restartGame} />
             )}
          </div>
        );
    }
    
    return null;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      {renderGameContent()}
       <AlertDialog open={showRestartConfirm} onOpenChange={setShowRestartConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to restart?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestart}>Restart</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={showClearSaveConfirm} onOpenChange={setShowClearSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Saved Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your saved game progress? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearSave}>Clear Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={(open) => {
          setIsSettingsOpen(open);
          if (!open && game.gameState === 'paused') {
            game.continueGame();
          }
        }}
        isSoundEnabled={game.isSoundEnabled}
        onSoundToggle={game.toggleSound}
        onRestart={() => {
          setShowRestartConfirm(true);
        }}
        onContinue={() => {
            setIsSettingsOpen(false);
            game.continueGame();
        }}
        onExit={() => {
            setIsSettingsOpen(false);
            game.setGameState('home');
        }}
      />

      <ScoreHistoryDialog 
        isOpen={isScoreHistoryOpen}
        onOpenChange={setIsScoreHistoryOpen}
        scores={game.scoreHistory}
      />
      
      <audio id="place-sound" preload="auto">
        <source src="https://actions.google.com/sounds/v1/impacts/big_object_fall_into_water_and_splash.ogg" type="audio/ogg" />
      </audio>
      <audio id="clear-sound" preload="auto">
        <source src="https://actions.google.com/sounds/v1/water/bubble_pop.ogg" type="audio/ogg" />
      </audio>
      <audio id="game-over-sound" preload="auto">
        <source src="https://actions.google.com/sounds/v1/jingles/game_over_jingle_1.ogg" type="audio/ogg" />
      </audio>
      <audio id="click-sound" preload="auto">
         <source src="https://actions.google.com/sounds/v1/ui/ui_pop.ogg" type="audio/ogg" />
      </audio>
    </main>
  );
}
