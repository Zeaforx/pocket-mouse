"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Delete, CornerDownLeft, ArrowUp } from "lucide-react";

const keyRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["caps", "z", "x", "c", "v", "b", "n", "m", "backspace"],
  ["space", "enter"],
];

export default function Keyboard() {
  const ws = useRef<WebSocket | null>(null);
  const [isCaps, setIsCaps] = useState(false);

  // 1. WebSocket connection for Keyboard
  useEffect(() => {
    const hostname = window.location.hostname;

    // Explicitly use '127.0.0.1' if hostname is 'localhost' for better stability in some environments.
    const host = hostname === "localhost" ? "127.0.0.1" : hostname;
    const url = `ws://${host}:8000/ws-keyboard`;

    console.log("Attempting WebSocket connection to:", url);

    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log("Keyboard Connected to Server");
    ws.current.onclose = () => console.log("Keyboard Disconnected from Server");

    // Add an explicit error handler to help diagnose connection issues
    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
      console.error(
        "Connection failed. Check if the Python server is running and accessible at the address:",
        url
      );
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendWsKeyMessage = (key: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: "key_press", key }));
    } else {
      console.warn("WebSocket not open. Key press dropped:", key);
    }
  };

  const handleKeyPress = (key: string) => {
    let newKey = key;

    // Toggle Caps Lock locally
    if (key === "caps") {
      setIsCaps((prev) => !prev);
      return;
    }

    // Apply Caps Lock state to letters before sending
    if (key.length === 1 && isCaps) {
      newKey = key.toUpperCase();
    }

    // Send the key press to the server
    sendWsKeyMessage(newKey);
  };

  const renderKey = (key: string) => {
    let content: React.ReactNode = key;
    let className = "flex-1";

    if (key.length === 1 && isCaps) {
      content = key.toUpperCase();
    }

    switch (key) {
      case "backspace":
        content = <Delete className="w-5 h-5" />;
        className = "flex-1";
        break;
      case "caps":
        content = <ArrowUp className="w-5 h-5" />;
        className = cn(
          "flex-1",
          isCaps && "bg-primary/90 text-primary-foreground hover:bg-primary"
        );
        break;
      case "space":
        content = "Space";
        className = "flex-[5]";
        break;
      case "enter":
        content = <CornerDownLeft className="w-5 h-5" />;
        className = "flex-[2]";
        break;
    }

    return (
      <Button
        key={key}
        variant="outline"
        className={cn(
          "h-12 text-lg md:text-xl font-semibold transition-all duration-75 ease-out active:scale-95",
          className
        )}
        onClick={() => handleKeyPress(key)}
      >
        {content}
      </Button>
    );
  };

  return (
    <div className="flex flex-col h-full justify-end p-2 bg-background">
      <div className="text-center text-sm text-muted-foreground mb-4">
        Tap keys below to type on your host computer.
      </div>
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
