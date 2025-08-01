
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ScoreRecord } from '@/hooks/useBlastTangleGame';
import { format } from 'date-fns';

interface ScoreHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  scores: ScoreRecord[];
}

export default function ScoreHistoryDialog({ isOpen, onOpenChange, scores }: ScoreHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Score History</DialogTitle>
          <DialogDescription>
            Here are your most recent scores.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.length > 0 ? (
                scores.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.score}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {format(new Date(record.date), "MMM d, yyyy 'at' h:mm a")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No scores recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
