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
  const [context, setContext] = useState('media control');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, startSuggestingTransition] = useTransition();
  const [isClassifying, startClassifyingTransition] = useTransition();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [result, setResult] = useState<ClassifyRemoteActionOutput | null>(null);

  const touchpadRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const debouncedGesturePath = useDebounce(gesturePath, 700);

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

  useEffect(() => {
    if (debouncedGesturePath.length > 2) {
      startClassifyingTransition(async () => {
        const gestureData = JSON.stringify(debouncedGesturePath);
        const response = await handleClassifyGesture(gestureData, context);

        if (response.success) {
          setResult(response.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Classification Error',
            description: response.error,
          });
          setResult(null);
        }
        setGesturePath([]); // Clear path after processing
      });
    } else {
        if(result) setResult(null); // Clear old result if new gesture is too short
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGesturePath, context]);


  const handleSuggest = () => {
    startSuggestingTransition(async () => {
      const response = await handleSuggestPrompts();
      if (response.success) {
        setSuggestions(response.data);
        if(response.data.length > 0) setPopoverOpen(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Suggestion Error',
          description: response.error,
        });
      }
    });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Card
        ref={touchpadRef}
        onPointerMove={addDot}
        onPointerLeave={clearDots}
        onPointerUp={handlePointerUp}
        className="flex-1 w-full touch-none cursor-crosshair overflow-hidden relative select-none bg-card/50"
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

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Bot className="w-6 h-6" />
            <CardTitle>AI Action Classifier</CardTitle>
          </div>
          <CardDescription>
            Draw a gesture on the touchpad above to classify a remote action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Label htmlFor="context" className="sr-only">Context</Label>
              <Input
                id="context"
                placeholder="e.g., media control, browser"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="pr-10"
              />
               <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      disabled={isSuggesting}
                      onClick={handleSuggest}
                    >
                      {isSuggesting ? (
                        <Loader className="animate-spin" size={16} />
                      ) : (
                        <Wand2 size={16} />
                      )}
                      <span className="sr-only">Suggest Contexts</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                    <Command>
                      <CommandList>
                        <CommandGroup heading="Suggestions">
                          {suggestions.map((suggestion) => (
                            <CommandItem
                              key={suggestion}
                              onSelect={() => {
                                setContext(suggestion);
                                setPopoverOpen(false);
                              }}
                            >
                              {suggestion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>
          </div>
          <div className="min-h-[60px] bg-muted/50 rounded-lg flex items-center justify-center p-4">
            {isClassifying ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader className="animate-spin" />
                <span>Classifying action...</span>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="font-bold text-2xl capitalize text-secondary">
                  {result.action}
                </span>
                <span className="text-sm text-muted-foreground">
                  Confidence: {Math.round(result.confidence * 100)}%
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground italic">Draw a gesture to see AI classification</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
