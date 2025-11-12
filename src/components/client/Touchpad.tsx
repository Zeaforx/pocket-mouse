"use client";

import { useState, useRef, useEffect, useMemo, useTransition } from 'react';
import type { PointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettings } from '@/app/context/SettingsContext';
import { useDebounce } from '@/hooks/use-debounce';
import { handleClassifyGesture, handleSuggestPrompts } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader, Bot, Sparkles, Wand2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import type { ClassifyRemoteActionOutput } from '@/ai/flows/classify-remote-action';

type Dot = {
  id: number;
  x: number;
  y: number;
};

type Point = { x: number; y: number; t: number };

export default function Touchpad() {
  const { sensitivity, haptics } = useSettings();
  const [dots, setDots] = useState<Dot[]>([]);
  const [gesturePath, setGesturePath] = useState<Point[]>([]);
  
  const touchpadRef = useRef<HTMLDivElement>(null);

  const addDot = (e: PointerEvent<HTMLDivElement>) => {
    if (haptics && typeof window.navigator.vibrate === 'function') {
      window.navigator.vibrate(10);
    }
    const rect = touchpadRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDots((prev) => [...prev, { id: Date.now(), x, y }]);
      setGesturePath((prev) => [...prev, { x, y, t: Date.now() }]);
    }
  };

  const clearDots = () => {
    setDots([]);
  };

  const handlePointerUp = () => {
    if (gesturePath.length > 0) {
      // The debounced effect will handle classification
    }
  };

  return (
    <Card
      ref={touchpadRef}
      onPointerMove={addDot}
      onPointerLeave={clearDots}
      onPointerUp={handlePointerUp}
      className="flex-1 w-full touch-none cursor-crosshair overflow-hidden relative select-none bg-card/50 rounded-none border-0"
    >
      <AnimatePresence>
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute bg-primary rounded-full"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 0,
              transition: { duration: 0.8, ease: 'easeOut' },
            }}
            style={{
              left: dot.x,
              top: dot.y,
              width: 12,
              height: 12,
              x: '-50%',
              y: '-50%',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </Card>
  );
}
