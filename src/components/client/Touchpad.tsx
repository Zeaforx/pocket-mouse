"use client";

import { useState, useRef, useEffect } from "react";
import type { PointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "@/app/context/SettingsContext";
import { Card } from "@/components/ui/card";

type Dot = {
  id: number;
  x: number;
  y: number;
};

// --- CONFIGURATION ---
const LONG_PRESS_DELAY = 300; // ms - How long you hold to start a drag
const TAP_THRESHOLD = 10; // px - Max distance you can move for a "tap"
const MULTI_TAP_MAX_DELAY = 250; // ms - Max delay between fingers for a multi-tap
// ---------------------

export default function Touchpad() {
  const { haptics } = useSettings();
  const [dots, setDots] = useState<Dot[]>([]);
  const ws = useRef<WebSocket | null>(null);

  // --- NEW: Refs for state ---
  const touchpadRef = useRef<HTMLDivElement>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const pointersRef = useRef<
    Map<number, { x: number; y: number; time: number }>
  >(new Map());
  const lastPointerUpTimeRef = useRef(0);
  const lastPointerCountRef = useRef(0);

  // ---------------------------

  // 1. WebSocket connection (Unchanged)
  useEffect(() => {
    ws.current = new WebSocket(`ws://${window.location.hostname}:8000/ws`);
    ws.current.onopen = () => console.log("Connected to Mouse Server");
    ws.current.onclose = () => console.log("Disconnected from Mouse Server");
    return () => {
      ws.current?.close();
    };
  }, []);

  const sendWsMessage = (message: object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    touchpadRef.current?.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      time: e.timeStamp,
    });

    // If it's the first finger, set up for potential drag/tap
    if (pointersRef.current.size === 1) {
      isDraggingRef.current = false;
      startPosRef.current = { x: e.clientX, y: e.clientY };

      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);

      pressTimerRef.current = setTimeout(() => {
        isDraggingRef.current = true;
        sendWsMessage({ action: "press" });
        console.log("Drag mode: ON");
        pressTimerRef.current = null;
      }, LONG_PRESS_DELAY);
    } else {
      // More than one finger, so it's not a single-finger drag.
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 || !pointersRef.current.has(e.pointerId)) return;

    const fingerCount = pointersRef.current.size;

    // --- GESTURE LOGIC ---
    if (fingerCount === 1) {
      // 1-Finger Swipe (Move)
      const dist = Math.hypot(
        e.clientX - startPosRef.current.x,
        e.clientY - startPosRef.current.y
      );

      if (dist > TAP_THRESHOLD && pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }

      sendWsMessage({ x: e.movementX, y: e.movementY });
    } else if (fingerCount === 2) {
      // 2-Finger Swipe (Scroll)
      // We only need the movement from one of the fingers for scrolling
      if (e.isPrimary) {
        sendWsMessage({ action: "scroll", dy: e.movementY });
      }
    }
    // 3+ finger swipes are not handled for now.

    // Visual dot logic
    const rect = touchpadRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDots((prev) => [
        ...prev.slice(-10),
        { id: Date.now() + e.pointerId, x, y },
      ]);
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    touchpadRef.current?.releasePointerCapture(e.pointerId);

    const upTime = e.timeStamp;
    const pointerCount = pointersRef.current.size;

    // Check for multi-tap
    if (
      pointerCount > 1 &&
      upTime - lastPointerUpTimeRef.current < MULTI_TAP_MAX_DELAY
    ) {
      // This is the second+ finger lifting in a potential multi-tap
      const startPointer = pointersRef.current.get(e.pointerId);
      if (startPointer) {
        const dist = Math.hypot(
          e.clientX - startPointer.x,
          e.clientY - startPointer.y
        );
        if (dist < TAP_THRESHOLD) {
          // It's a tap!
          if (lastPointerCountRef.current === 2) {
            console.log("Action: 2-Finger TAP (Right Click)");
            sendWsMessage({ action: "right_click" });
          } else if (lastPointerCountRef.current === 3) {
            console.log("Action: 3-Finger TAP (Middle Click)");
            sendWsMessage({ action: "middle_click" });
          }
        }
      }
      // Reset for next gesture
      lastPointerCountRef.current = 0;
      lastPointerUpTimeRef.current = 0;
    } else if (pointerCount === 1) {
      // This is the last finger lifting up.
      // Could be a 1-finger tap, swipe, or end of a drag.
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;

        const dist = Math.hypot(
          e.clientX - startPosRef.current.x,
          e.clientY - startPosRef.current.y
        );

        if (dist < TAP_THRESHOLD) {
          console.log("Action: 1-Finger TAP (Left Click)");
          sendWsMessage({ action: "click" });
        } else {
          console.log("Action: SWIPE");
        }
      } else if (isDraggingRef.current) {
        console.log("Drag mode: OFF");
        isDraggingRef.current = false;
        sendWsMessage({ action: "release" });
      }
    }

    // Update state for multi-tap detection
    lastPointerUpTimeRef.current = upTime;
    lastPointerCountRef.current = pointerCount;
    pointersRef.current.delete(e.pointerId);

    // If all fingers are up, clear dots and timers
    if (pointersRef.current.size === 0) {
      clearDots();
      isDraggingRef.current = false;
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    }
  };

  const clearDots = () => {
    setDots([]);
  };

  return (
    <Card
      ref={touchpadRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp} // Treat cancel like up
      onPointerLeave={clearDots}
      className="flex-1 w-full h-[60vh] touch-none cursor-crosshair overflow-hidden relative select-none bg-card/50 rounded-none border-0"
    >
      {/* ... rest of your component is unchanged ... */}
      <div className="absolute top-2 left-2 text-xs text-muted-foreground opacity-50 pointer-events-none">
        Trackpad Area
      </div>
      <AnimatePresence>
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute bg-primary rounded-full"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              left: dot.x,
              top: dot.y,
              width: 20,
              height: 20,
              x: "-50%",
              y: "-50%",
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>
    </Card>
  );
}
