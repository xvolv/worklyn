"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

const MIN_WIDTH = 180;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 240;
const COLLAPSED_THRESHOLD = 140; // drag below this → auto-collapse

interface SidebarContextType {
  isOpen: boolean;
  width: number;
  toggle: () => void;
  close: () => void;
  setWidth: (w: number) => void;
  isDragging: boolean;
  startDrag: (e: React.MouseEvent) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [width, setWidthState] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_WIDTH);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setWidthState(DEFAULT_WIDTH); // reset to default when reopening
      return !prev;
    });
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const setWidth = useCallback((w: number) => {
    const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w));
    setWidthState(clamped);
  }, []);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStartX.current = e.clientX;
      dragStartWidth.current = width;
      setIsDragging(true);
    },
    [width]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current;
      const newWidth = dragStartWidth.current + delta;

      if (newWidth < COLLAPSED_THRESHOLD) {
        setIsOpen(false);
        setIsDragging(false);
        return;
      }

      setWidthState(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)));
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  return (
    <SidebarContext.Provider
      value={{ isOpen, width, toggle, close, setWidth, isDragging, startDrag }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used within <SidebarProvider>");
  return context;
}
