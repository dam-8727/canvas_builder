import React, { useRef, useState, useEffect } from "react";
import Toolbar from "./components/Toolbar";
import CanvasArea from "./components/CanvasArea";
import ExportButton from "./components/ExportButton";
import { drawElements } from "./utils/canvasUtils";
import "./styles/CanvasArea.css";
import "./styles/Toolbar.css";
import "./styles/ExportButton.css";

import "./App.css";

const getDefaultCanvasWidth = () => Math.min(window.innerWidth * 0.7, 1200);
const getDefaultCanvasHeight = () => Math.min(window.innerHeight * 0.7, 800);

function App() {
  const [canvasWidth, setCanvasWidth] = useState(getDefaultCanvasWidth());
  const [canvasHeight, setCanvasHeight] = useState(getDefaultCanvasHeight());
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [shapeSize, setShapeSize] = useState(50);
  const [elements, setElements] = useState([]);
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [selectionMode, setSelectionMode] = useState('select');
  const canvasRef = useRef(null);

  // Mobile drawer state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Refs for detecting outside clicks (mobile drawer)
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawElements(ctx, elements);
    }
  }, [elements, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (selectedElementIndex !== null && elements[selectedElementIndex]) {
      setElements(prevElements => prevElements.map((el, idx) =>
        idx === selectedElementIndex ? { ...el, color: selectedColor } : el
      ));
    }
    // eslint-disable-next-line
  }, [selectedColor]);

  useEffect(() => {
    // Only allow changing the element's type for shape tools (e.g., rectangle/circle),
    // not for utility tools like "pencil" or when no tool is selected.
    if (!selectedTool || selectedTool === 'pencil') return;

    if (selectedElementIndex !== null && elements[selectedElementIndex]) {
      setElements(prevElements => prevElements.map((el, idx) =>
        idx === selectedElementIndex ? { ...el, type: selectedTool } : el
      ));
    }
    // eslint-disable-next-line
  }, [selectedTool]);

  useEffect(() => {
    if (selectedElementIndex !== null && elements[selectedElementIndex]) {
      setElements(prevElements => prevElements.map((el, idx) => {
        if (idx !== selectedElementIndex) return el;
        if (el.type === 'text') {
          return { ...el, fontSize: shapeSize };
        }
        if (el.type === 'image') {
          const ratio = el.aspect || (el.width / el.height);
          return { ...el, width: shapeSize, height: shapeSize / ratio };
        }
        return { ...el, size: shapeSize };
      }));
    }
    
  }, [shapeSize]);

  const handleDimensionChange = (dimension, value) => {
    if (dimension === 'width') {
      setCanvasWidth(Number(value));
    } else {
      setCanvasHeight(Number(value));
    }
  };

  const handleAddShape = (shapeType) => {
    const centerX = canvasWidth / 2 - shapeSize / 2;
    const centerY = canvasHeight / 2 - shapeSize / 2;
    const newElement = {
      type: shapeType,
      x: centerX,
      y: centerY,
      size: shapeSize,
      color: selectedColor
    };
    setElements([...elements, newElement]);
    setSelectedElementIndex(elements.length); // select the new shape
  };

  const handleAddText = () => {
    setSelectedTool(null);
    const text = prompt("Enter text:");
    if (text) {
      setElements([
        ...elements,
        {
          type: "text",
          text,
          x: 100,
          y: 200,
          fontSize: shapeSize,
          color: selectedColor,
          label: text,
        },
      ]);
    }
  };

  const handleAddImage = () => {
    setSelectedTool(null);
    const url = prompt("Enter image URL:");
    if (url) {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min((canvasWidth * 0.8) / img.width, (canvasHeight * 0.8) / img.height, 1);
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        const centerX = (canvasWidth - imgWidth) / 2;
        const centerY = (canvasHeight - imgHeight) / 2;
        setElements([
          { type: "image", src: url, x: centerX, y: centerY, width: imgWidth, height: imgHeight, aspect: imgWidth / imgHeight, label: url },
          ...elements,
        ]);
      };
      img.src = url;
    }
  };

  const handleFileUpload = (e) => {
    setSelectedTool(null);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const scale = Math.min((canvasWidth * 0.8) / img.width, (canvasHeight * 0.8) / img.height, 1);
          const imgWidth = img.width * scale;
          const imgHeight = img.height * scale;
          const centerX = (canvasWidth - imgWidth) / 2;
          const centerY = (canvasHeight - imgHeight) / 2;
          setElements([
            { type: "image", src: event.target.result, x: centerX, y: centerY, width: imgWidth, height: imgHeight, aspect: imgWidth / imgHeight, label: file.name },
            ...elements,
          ]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveElement = (idx) => {
    setElements(elements.filter((_, i) => i !== idx));
  };

  const handleDraw = (action) => {
    if (!selectedTool || (selectedTool !== "pencil" && selectedTool !== "eraser")) return;
  };

  const handleSelectTool = (tool) => {
    setSelectedTool(prev => {
      const nextTool = prev === tool ? null : tool;

      // If pencil is selected , clear current element selection
      if (tool === 'pencil') {
        setSelectedElementIndex(null);
        setSelectedIndices([]);
      }

      return nextTool;
    });
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleExportPDF = async () => {
    try {
      const canvas = document.querySelector('canvas');
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      const response = await fetch('/canvas/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: dataUrl,
          width: canvasWidth,
          height: canvasHeight,
        }),
      });
      
      if (!response.ok) throw new Error('PDF export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}__${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      a.download = `canvas-${timestamp}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleSelectAll = () => {
    setSelectedIndices(elements.map((_, idx) => idx));
  };

  const handleDeleteSelected = () => {
    if (selectionMode === 'selectAll') {
      if (elements.length === 0) {
        alert('No elements to delete.');
        return;
      }
      setElements([]);
      setSelectedIndices([]);
      setSelectedElementIndex(null);
    } else if (selectionMode === 'select' && selectedElementIndex !== null) {
      setElements(elements.filter((_, idx) => idx !== selectedElementIndex));
      setSelectedElementIndex(null);
    } else {
      alert('No element selected to delete.');
    }
  };

  const handleSelectionModeChange = (mode) => {
    setSelectionMode(mode);
    if (mode === 'selectAll') {
      setSelectedIndices(elements.map((_, idx) => idx));
    } else {
      setSelectedIndices([]);
    }
  };

  
  useEffect(() => {
    const computeSize = () => {
      const isMobileViewport = window.innerWidth < 768;

      const sidebarWidth = isMobileViewport ? 0 : 260; 
      const headerHeight = 80;  
      const exportBtnHeight = isMobileViewport ? 60 : 100; 

      const newWidth = Math.max(200, window.innerWidth - sidebarWidth - 24 /* small padding */);
      const newHeight = Math.max(200, window.innerHeight - headerHeight - exportBtnHeight);

      setCanvasWidth(newWidth);
      setCanvasHeight(newHeight);
    };

    computeSize();
    window.addEventListener('resize', computeSize);
    return () => window.removeEventListener('resize', computeSize);
  }, []);

  // --- Track viewport width for mobile mode ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  useEffect(() => {
    if (!isMobile || !isDrawerOpen) return;

    const handleOutsideClick = (e) => {
      const sidebarEl = sidebarRef.current;
      const burgerEl = hamburgerRef.current;
      if (sidebarEl && !sidebarEl.contains(e.target) && burgerEl && !burgerEl.contains(e.target)) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isMobile, isDrawerOpen]);

  return (
    <>
      <div className="app-title-centered">
        <h1 className="app-title">Canvas Builder</h1>
        <div className="export-btn-fixed">
          <button className={`export-btn ${isMobile ? 'icon-btn' : ''}`} onClick={handleExportPDF}>
            {isMobile ? '↓' : 'Export as PDF'}
          </button>
        </div>
      </div>
      <div className="modern-canvas-app">
        {(!isMobile || isDrawerOpen) && (
          <div className="sidebar" ref={sidebarRef}>
            <div className="sidebar-card">
              <Toolbar
                width={canvasWidth}
                height={canvasHeight}
                onDimensionChange={handleDimensionChange}
                selectedTool={selectedTool}
                onSelectTool={handleSelectTool}
                onAddShape={handleAddShape}
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
                shapeSize={shapeSize}
                onShapeSizeChange={setShapeSize}
                onDeleteSelected={handleDeleteSelected}
                onSelectionModeChange={handleSelectionModeChange}
                onAddText={handleAddText}
                onAddImage={handleAddImage}
                onFileUpload={handleFileUpload}
                className={`${isMobile ? 'mobile' : ''} ${isMobile && isDrawerOpen ? 'open' : ''}`}
              />
            </div>
          </div>
        )}
        <div className="main-area">
          <CanvasArea
            width={canvasWidth}
            height={canvasHeight}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            shapeSize={shapeSize}
            elements={elements}
            setElements={setElements}
            selectedElementIndex={selectedElementIndex}
            setSelectedElementIndex={setSelectedElementIndex}
            selectedIndices={selectedIndices}
            selectionMode={selectionMode}
          />
        </div>
      </div>
      {/* Hamburger FAB for mobile */}
      {isMobile && (
        <button
          className="hamburger-fab"
          onClick={() => setIsDrawerOpen(prev => !prev)}
          ref={hamburgerRef}
        >
          {isDrawerOpen ? '✖' : '☰'}
        </button>
      )}

      {/* Mobile bottom action bar */}
      {isMobile && !isDrawerOpen && (
        <div className="mobile-bottom-bar">
          <button
            className={selectedTool === 'pencil' ? 'active-tool' : ''}
            onClick={() => handleSelectTool('pencil')}
          >✏️</button>
          <button onClick={handleDeleteSelected}>🗑️</button>
        </div>
      )}
    </>
  );
}

export default App;
