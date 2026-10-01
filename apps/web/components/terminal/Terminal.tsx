"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { getSocket } from "@/lib/socket";
import { SOCKET_EVENTS, type TerminalOutputEvent } from "@dockerops/shared";

const THEME = {
  background: "#0a0a0a",
  foreground: "#f2f1ea",
  cursor: "#adff2f",
  cursorAccent: "#0a0a0a",
  selectionBackground: "#adff2f55",
  black: "#0a0a0a",
  red: "#ff4433",
  green: "#adff2f",
  yellow: "#ffcc00",
  blue: "#5ec8ff",
  magenta: "#d68cff",
  cyan: "#5ec8ff",
  white: "#f2f1ea",
  brightBlack: "#3a3a3a",
};

export function GameTerminal({ sessionId }: { sessionId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      fontFamily: "ui-monospace, Consolas, SFMono-Regular, Menlo, monospace",
      fontSize: 13,
      cursorBlink: true,
      theme: THEME,
      scrollback: 5000,
      convertEol: true,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    termRef.current = term;

    // Defer the first fit — the container can still be 0x0 synchronously
    // after open() while the surrounding grid/flex layout is settling,
    // which throws inside xterm's viewport sizing code.
    requestAnimationFrame(() => fitAddon.fit());

    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.JOIN_SESSION, { sessionId });

    const onOutput = (evt: TerminalOutputEvent) => {
      if (evt.sessionId === sessionId) term.write(evt.data);
    };
    socket.on(SOCKET_EVENTS.TERMINAL_OUTPUT, onOutput);

    const onData = term.onData((data) => {
      socket.emit(SOCKET_EVENTS.TERMINAL_INPUT, { sessionId, data });
    });

    const sendResize = () => {
      fitAddon.fit();
      socket.emit(SOCKET_EVENTS.TERMINAL_RESIZE, { sessionId, cols: term.cols, rows: term.rows });
    };
    const resizeObserver = new ResizeObserver(sendResize);
    resizeObserver.observe(containerRef.current);
    setTimeout(sendResize, 300);

    return () => {
      socket.off(SOCKET_EVENTS.TERMINAL_OUTPUT, onOutput);
      onData.dispose();
      resizeObserver.disconnect();
      term.dispose();
      termRef.current = null;
    };
  }, [sessionId]);

  return <div ref={containerRef} className="h-full w-full p-2" />;
}
