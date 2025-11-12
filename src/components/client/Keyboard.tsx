"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Delete, CornerDownLeft, ArrowUp } from 'lucide-react';

const keyRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['caps', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
  ['space', 'enter'],
];

export default function Keyboard() {
  const [log, setLog] = useState<string[]>([]);
  const [isCaps, setIsCaps] = useState(false);

  const handleKeyPress = (key: string) => {
    let newKey = key;
    if (key.length === 1 && isCaps) {
      newKey = key.toUpperCase();
    }

    if (key === 'caps') {
      setIsCaps(!isCaps);
      return;
    }

    if (key === 'backspace') {
      setLog((prev) => prev.slice(0, -1));
    } else if (key === 'space') {
      setLog((prev) => [...prev, ' ']);
    } else if (key === 'enter') {
      setLog((prev) => [...prev, '\n']);
    } else {
      setLog((prev) => [...prev, newKey]);
    }
  };

  const renderKey = (key: string) => {
    let content: React.ReactNode = key;
    let className = 'flex-1';

    if (key.length === 1 && isCaps) {
      content = key.toUpperCase();
    }

    switch (key) {
      case 'backspace':
        content = <Delete />;
        className = 'flex-1';
        break;
      case 'caps':
        content = <ArrowUp />;
        className = cn('flex-1', isCaps && 'bg-accent text-accent-foreground');
        break;
      case 'space':
        content = 'Space';
        className = 'flex-[5]';
        break;
      case 'enter':
        content = <CornerDownLeft />;
        className = 'flex-[2]';
        break;
    }

    return (
      <Button
        key={key}
        variant="outline"
        className={cn('h-12 text-lg md:text-xl font-semibold', className)}
        onClick={() => handleKeyPress(key)}
      >
        {content}
      </Button>
    );
  };

  return (
    <div className="flex flex-col h-full justify-end p-2">
      <div className="space-y-2">
        {keyRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map(renderKey)}
          </div>
        ))}
      </div>
    </div>
  );
}
