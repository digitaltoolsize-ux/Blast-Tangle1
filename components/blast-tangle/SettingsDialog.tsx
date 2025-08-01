'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isSoundEnabled: boolean;
  onSoundToggle: () => void;
  onRestart: () => void;
  onContinue: () => void;
  onExit: () => void;
}

export default function SettingsDialog({
  isOpen,
  onOpenChange,
  isSoundEnabled,
  onSoundToggle,
  onRestart,
  onContinue,
  onExit,
}: SettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-switch" className="text-lg">
              Sound
            </Label>
            <Switch
              id="sound-switch"
              checked={isSoundEnabled}
              onCheckedChange={onSoundToggle}
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={onContinue} size="lg">Continue</Button>
          <Button onClick={onRestart} variant="outline" size="lg">Restart</Button>
          <Button onClick={onExit} variant="destructive" size="lg">Exit to Menu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
