
"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { produce } from 'immer';
import { Button } from '@/components/ui/button';
import {
  Pen, Move, Type, PaintBucket, Square, Undo2, Redo2, Pencil, Trash2, Download
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// --- Type Definitions ---
interface Point { x: number; y: number; }

interface DrawElement {
  id: number;
  type: 'draw';
  points: Point[];
  color: string;
  strokeWidth: number;
}

interface ShapeElement {
  id: number;
  type: 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

type SketchElement = DrawElement | ShapeElement;

let nextId = 1;

export default function SketchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const undoStackRef = useRef<SketchElement[][]>([[]]);
  const redoStackRef = useRef<SketchElement[][]>([]);

  const [elements, setElements] = useState<SketchElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('draw');
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number, y: number } | null>(null);
  const elementStartPos = useRef<{ x: number, y: number } | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const getContext = useCallback(() => canvasRef.current?.getContext('2d'), []);

  // --- State & History Management ---

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 1);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  const saveState = useCallback((newElements: SketchElement[]) => {
    undoStackRef.current.push(newElements);
    redoStackRef.current = [];
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = getContext();
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
      context.beginPath();
      if (element.type === 'draw') {
        context.strokeStyle = element.color;
        context.lineWidth = element.strokeWidth;
        element.points.forEach((p, i) => {
          if (i === 0) context.moveTo(p.x, p.y);
          else context.lineTo(p.x, p.y);
        });
        context.stroke();
      } else if (element.type === 'shape') {
        context.fillStyle = element.color;
        context.fillRect(element.x, element.y, element.width, element.height);
      }
    });

    // Draw selection box if an element is selected
    if (selectedElementId) {
      const el = elements.find(e => e.id === selectedElementId);
      if (el) {
        context.strokeStyle = 'rgba(0, 123, 255, 0.8)';
        context.lineWidth = 2;
        context.setLineDash([5, 5]);
        const bbox = getElementBoundingBox(el);
        context.strokeRect(bbox.x - 5, bbox.y - 5, bbox.width + 10, bbox.height + 10);
        context.setLineDash([]);
      }
    }

  }, [elements, getContext, selectedElementId]);

  useEffect(() => {
    redrawCanvas();
  }, [elements, redrawCanvas]);

  const setCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    }
  }, [redrawCanvas]);

  useEffect(() => {
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    return () => window.removeEventListener('resize', setCanvasSize);
  }, [setCanvasSize]);
  
   // --- Event Handling ---

  const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { 
        x: clientX - rect.left, 
        y: clientY - rect.top
    };
  };
  
  const getElementAtPosition = (coords: Point) => {
    // Iterate backwards to select top-most element
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        const bbox = getElementBoundingBox(element);
        if (coords.x >= bbox.x && coords.x <= bbox.x + bbox.width &&
            coords.y >= bbox.y && coords.y <= bbox.y + bbox.height) {
            return element;
        }
    }
    return null;
  };

  const getElementBoundingBox = (element: SketchElement) => {
    if (element.type === 'draw') {
        const xCoords = element.points.map(p => p.x);
        const yCoords = element.points.map(p => p.y);
        const minX = Math.min(...xCoords);
        const minY = Math.min(...yCoords);
        const maxX = Math.max(...xCoords);
        const maxY = Math.max(...yCoords);
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    // Shape
    return { x: element.x, y: element.y, width: element.width, height: element.height };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getEventCoordinates(e);
    if (!coords) return;
    
    if (tool === 'select') {
        const clickedElement = getElementAtPosition(coords);
        setSelectedElementId(clickedElement ? clickedElement.id : null);
        if (clickedElement) {
            setIsDragging(true);
            dragStartPos.current = coords;
            const bbox = getElementBoundingBox(clickedElement);
            elementStartPos.current = { x: bbox.x, y: bbox.y };
        }
        return;
    }

    setIsDrawing(true);

    if (tool === 'draw') {
        const newElement: DrawElement = {
            id: nextId++,
            type: 'draw',
            points: [coords],
            color: color,
            strokeWidth: 4,
        };
        setElements(produce(draft => { draft.push(newElement) }));
    } else if (tool === 'shape') {
         const newElement: ShapeElement = {
            id: nextId++,
            type: 'shape',
            x: coords.x,
            y: coords.y,
            width: 0,
            height: 0,
            color: color,
        };
        setElements(produce(draft => { draft.push(newElement) }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getEventCoordinates(e);
    if (!coords) return;

    if (isDragging && tool === 'select' && selectedElementId && dragStartPos.current && elementStartPos.current) {
        const dx = coords.x - dragStartPos.current.x;
        const dy = coords.y - dragStartPos.current.y;
        
        setElements(produce(draft => {
            const el = draft.find(elem => elem.id === selectedElementId);
            if (el) {
                if(el.type === 'draw') {
                    el.points.forEach(p => {
                        p.x += dx;
                        p.y += dy;
                    })
                } else if (el.type === 'shape') {
                    el.x += dx;
                    el.y += dy;
                }
            }
        }));
        dragStartPos.current = coords;
        return;
    }
    
    if (!isDrawing) return;

    if (tool === 'draw') {
        setElements(produce(draft => {
            const lastElement = draft[draft.length - 1];
            if (lastElement && lastElement.type === 'draw') {
                lastElement.points.push(coords);
            }
        }));
    } else if (tool === 'shape') {
        setElements(produce(draft => {
            const lastElement = draft[draft.length - 1];
            if (lastElement && lastElement.type === 'shape') {
                lastElement.width = coords.x - lastElement.x;
                lastElement.height = coords.y - lastElement.y;
            }
        }));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
        saveState([...elements]);
    }
    if (isDragging) {
        saveState([...elements]);
    }
    setIsDrawing(false);
    setIsDragging(false);
    dragStartPos.current = null;
    elementStartPos.current = null;
  };
  
  // --- Toolbar Actions ---

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length <= 1) return;
    const currentState = undoStackRef.current.pop()!;
    redoStackRef.current.push(currentState);
    const prevState = undoStackRef.current[undoStackRef.current.length - 1];
    setElements(prevState);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const nextState = redoStackRef.current.pop()!;
    undoStackRef.current.push(nextState);
    setElements(nextState);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const handleClear = useCallback(() => {
    setElements([]);
    saveState([]);
    setSelectedElementId(null);
  }, [saveState]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if(tempCtx) {
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
    }
    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = dataUrl;
    link.click();
  };

  const ToolButton = ({ value, children, tooltipText, ...props }: { value: string; children: React.ReactNode, tooltipText: string } & Omit<React.ComponentProps<typeof Button>, 'value'>) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
              variant={tool === value ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => setTool(value)}
              aria-label={value}
              {...props}
            >
              {children}
            </Button>
        </TooltipTrigger>
        <TooltipContent side="right"><p>{tooltipText}</p></TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
    <div className="relative w-full h-full bg-muted border rounded-lg overflow-hidden">
        <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full h-full bg-transparent ${tool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
        />
        <aside className="absolute top-1/2 left-4 -translate-y-1/2 flex h-fit flex-col items-center gap-1 p-2 bg-card border rounded-lg shadow-xl">
            <ToolButton value="select" tooltipText="Select & Move"><Move className="w-5 h-5"/></ToolButton>
            <ToolButton value="draw" tooltipText="Pencil"><Pencil className="w-5 h-5"/></ToolButton>
            <ToolButton value="shape" tooltipText="Draw Rectangle"><Square className="w-5 h-5"/></ToolButton>
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <label>
                      <div 
                        className="my-1 w-8 h-8 rounded-full border-2 border-border shadow-inner cursor-pointer"
                        style={{backgroundColor: color}}
                        aria-label="Color Picker"
                      />
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="sr-only" />
                    </label>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Select Color</p></TooltipContent>
            </Tooltip>

            <Separator className="my-1" />
            
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={handleDownload} aria-label="Download"><Download className="w-5 h-5"/></Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Download as PNG</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={handleUndo} disabled={!canUndo} aria-label="Undo"><Undo2/></Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Undo</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={handleRedo} disabled={!canRedo} aria-label="Redo"><Redo2/></Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Redo</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" onClick={handleClear} aria-label="Clear Canvas"><Trash2/></Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Clear Canvas</p></TooltipContent>
            </Tooltip>
        </aside>
    </div>
    </TooltipProvider>
  );
}

    