import React, { useRef, useEffect, useState } from 'react';
import "../styles/CanvasArea.css";

const CanvasArea = ({
  width,
  height,
  selectedTool,
  selectedColor,
  shapeSize,
  elements,
  setElements,
  selectedElementIndex,
  setSelectedElementIndex,
  selectedIndices = [],
  selectionMode = 'select'
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const draggingIdxRef = useRef(null);
  const clickedIdxRef = useRef(null);
  const didDragRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all elements
    elements.forEach((element, idx) => {
      switch (element.type) {
        case 'freehand':
          drawFreehand(ctx, element.points, element.color);
          break;
        case 'rectangle':
          drawRectangle(ctx, element.x, element.y, element.size, element.size, element.color);
          break;
        case 'circle':
          drawCircle(ctx, element.x, element.y, element.size / 2, element.color);
          break;
        case 'text':
          drawText(ctx, element.text, element.x, element.y, element.color, element.fontSize);
          break;
        case 'image': {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.src = element.src;
          if (img.complete) {
            ctx.drawImage(img, element.x, element.y, element.width, element.height);
          } else {
            img.onload = () => {
              ctx.drawImage(img, element.x, element.y, element.width, element.height);
            };
          }
          break;
        }
      }
      
      //  Highlight selected element(s) 
      if (selectedIndices.includes(idx) || selectedElementIndex === idx) {
        ctx.save();
        ctx.strokeStyle = selectedIndices.includes(idx) ? '#007bff' : '#00ff00';
        ctx.lineWidth = 2;

        if (element.type === 'rectangle') {
          ctx.strokeRect(
            element.x - 2,
            element.y - 2,
            element.size + 4,
            element.size + 4
          );
        } else if (element.type === 'circle') {
          ctx.beginPath();
          ctx.arc(
            element.x + element.size / 2,
            element.y + element.size / 2,
            element.size / 2 + 2,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        } else if (element.type === 'text') {
          ctx.strokeRect(
            element.x - 2,
            element.y - (element.fontSize || 20),
            ctx.measureText(element.text).width + 4,
            (element.fontSize || 20) + 4
          );
        } else if (element.type === 'freehand') {
          // Draw a bounding box for freehand selection
          const points = element.points;
          if (points.length > 1) {
            const minX = Math.min(...points.map(p => p.x));
            const maxX = Math.max(...points.map(p => p.x));
            const minY = Math.min(...points.map(p => p.y));
            const maxY = Math.max(...points.map(p => p.y));
            ctx.strokeRect(minX - 2, minY - 2, (maxX - minX) + 4, (maxY - minY) + 4);
          }
        } else if (element.type === 'image') {
          ctx.strokeRect(
            element.x - 2,
            element.y - 2,
            element.width + 4,
            element.height + 4
          );
        }

        ctx.restore();
      }
    });
    // Draw current freehand path (while drawing)
    if (drawing && currentPath.length > 1) {
      drawFreehand(ctx, currentPath, selectedColor);
    }
  }, [elements, selectedElementIndex, drawing, currentPath, selectedColor, selectedIndices]);

  const drawFreehand = (ctx, points, color) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  };

  const drawRectangle = (ctx, x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  };

  const drawCircle = (ctx, x, y, radius, color) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawText = (ctx, text, x, y, color, fontSize = 20) => {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color || '#000';
    ctx.fillText(text, x, y);
  };

  // Helper to check if point is inside a shape or text
  const getElementAtPosition = (x, y) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.type === 'rectangle') {
        if (
          x >= element.x &&
          x <= element.x + element.size &&
          y >= element.y &&
          y <= element.y + element.size
        ) {
          return i;
        }
      } else if (element.type === 'circle') {
        const centerX = element.x + element.size / 2;
        const centerY = element.y + element.size / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= element.size / 2) {
          return i;
        }
      } else if (element.type === 'text') {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.font = `${element.fontSize || 20}px Arial`;
        const textWidth = ctx.measureText(element.text).width;
        const textHeight = element.fontSize || 20;
        if (
          x >= element.x &&
          x <= element.x + textWidth &&
          y <= element.y &&
          y >= element.y - textHeight
        ) {
          return i;
        }
      } else if (element.type === 'freehand') {
        // Approximate detection using the bounding box of the path
        const points = element.points;
        if (points.length > 0) {
          const minX = Math.min(...points.map(p => p.x));
          const maxX = Math.max(...points.map(p => p.x));
          const minY = Math.min(...points.map(p => p.y));
          const maxY = Math.max(...points.map(p => p.y));
          if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            return i;
          }
        }
      } else if (element.type === 'image') {
        if (
          x >= element.x &&
          x <= element.x + element.width &&
          y >= element.y &&
          y <= element.y + element.height
        ) {
          return i;
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Determine if the click is on an existing element
    const idx = getElementAtPosition(x, y);

    // Store click info for later deselect logic
    clickedIdxRef.current = idx;
    didDragRef.current = false;

    
    if (selectedTool === 'pencil' && idx === null) {
      setDrawing(true);
      setCurrentPath([{ x, y }]);
      return;
    }

    if (selectionMode === 'select') {
      if (idx !== null) {
        // Select the element (no toggle here; toggle handled on mouse up if no drag)
        setSelectedElementIndex(idx);
      } else {
        setSelectedElementIndex(null);
      }
    }
    // In selectAll mode, do not change selection on click
    if (selectionMode === 'selectAll') {
      // Do nothing, all are already selected
    }
    // Drag logic
    if (idx !== null) {
      setIsDragging(true);
      draggingIdxRef.current = idx;
      setDragOffset({
        x: x - elements[idx].x,
        y: y - elements[idx].y
      });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // -------- Dynamic cursor handling --------
    const hoverIdx = getElementAtPosition(x, y);
    let nextCursor;

    if (drawing) {
      nextCursor = 'crosshair';
    } else if (isDragging) {
      nextCursor = 'grabbing';
    } else if (hoverIdx !== null) {
      nextCursor = 'grab';
    } else if (selectedTool === 'pencil') {
      nextCursor = 'crosshair';
    } else {
      nextCursor = 'default';
    }

    if (canvas.style.cursor !== nextCursor) {
      canvas.style.cursor = nextCursor;
    }

    if (drawing && selectedTool === 'pencil') {
      setCurrentPath(prev => [...prev, { x, y }]);
      return;
    }
    if (!isDragging || draggingIdxRef.current === null) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const newX = x - dragOffset.x;
    const newY = y - dragOffset.y;

    didDragRef.current = true;

    animationFrameRef.current = requestAnimationFrame(() => {
      setElements(prevElements => {
        const updated = [...prevElements];
        const el = updated[draggingIdxRef.current];
        updated[draggingIdxRef.current] = { ...el, x: newX, y: newY };
        return updated;
      });
    });
  };

  const handleMouseUp = () => {
    if (drawing && selectedTool === 'pencil') {
      if (currentPath.length > 1) {
        setElements(prev => [
          ...prev,
          {
            type: 'freehand',
            points: currentPath,
            color: selectedColor
          }
        ]);
      }
      setDrawing(false);
      setCurrentPath([]);
    }
    setIsDragging(false);

    // Toggle deselect if there was no drag
    if (!didDragRef.current && clickedIdxRef.current !== null) {
      setSelectedElementIndex(prev => (prev === clickedIdxRef.current ? null : prev));
    }

    draggingIdxRef.current = null;
    clickedIdxRef.current = null;
    didDragRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  /* Touch Events for Mobile  */
  const getTouchPos = (touch) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return; // single touch only
    const { x, y } = getTouchPos(e.touches[0]);

    
    const syntheticEvent = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    handleMouseDown({ ...e, ...syntheticEvent });
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    const syntheticEvent = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    handleMouseMove({ ...e, ...syntheticEvent });
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  return (
    <div className="canvas-area-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="canvas-area"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
       
      />
    </div>
  );
};

export default CanvasArea; 