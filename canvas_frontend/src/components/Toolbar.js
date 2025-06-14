import React, { useState } from "react";
import "../styles/Toolbar.css";

const Toolbar = ({
  width,
  height,
  onDimensionChange,
  selectedTool,
  onSelectTool,
  selectedColor,
  onColorChange,
  shapeSize,
  onShapeSizeChange,
  onAddShape,
  onAddText,
  onAddImage,
  onFileUpload,
  onDeleteSelected,
  onSelectionModeChange,
  className = ""
}) => {
  const [shapeType, setShapeType] = useState("rectangle");
  const [showImageDropdown, setShowImageDropdown] = useState(false);

  const handleAddShape = () => {
    onAddShape(shapeType);
  };

  const handleAddImage = (type) => {
    setShowImageDropdown(false);
    if (type === "url") onAddImage();
    else if (type === "upload") document.getElementById("fileInput").click();
  };

  const maxShapeSize = Math.min(width, height);

  return (
    <div className={`toolbar-container vertical-toolbar ${className}`}>
      {/* 1) Dimensions */}
      <div className="sidebar-section dimension-group">
        <label>
          Width:
          <input
            type="number"
            value={width}
            onChange={e => onDimensionChange("width", e.target.value)}
          />
        </label>
        <label>
          Height:
          <input
            type="number"
            value={height}
            onChange={e => onDimensionChange("height", e.target.value)}
          />
        </label>
      </div>

      {/* 2) Main tools */}
      <div className="sidebar-section main-tools-vertical-group">
        <button
          className={selectedTool === "pencil" ? "active-tool" : ""}
          onClick={() => onSelectTool("pencil")}
        >
          ✏️ Pencil
        </button>
        <button className="add-text-btn" onClick={onAddText}>
          📝 Add Text
        </button>

        <div className="image-dropdown-group">
          <button
            className="image-dropdown-btn"
            onClick={() => setShowImageDropdown(v => !v)}
          >
            🖼️ Add Image ▾
          </button>
          {showImageDropdown && (
            <div className="image-dropdown-menu">
              <button onClick={() => handleAddImage("url")}>From URL</button>
              <button onClick={() => handleAddImage("upload")}>
                Upload Photo
              </button>
            </div>
          )}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onFileUpload}
          />
        </div>
      </div>

      {/* 3) Shapes */}
      <div className="sidebar-section shapes-group">
        <label>
          Shape:
          <select
            value={shapeType}
            onChange={e => setShapeType(e.target.value)}
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
          </select>
        </label>
        <button onClick={handleAddShape}>➕ Add Shape</button>
      </div>

      {/* 4) Size & Color */}
      <div className="sidebar-section size-color-group">
        <label>
          Size:
          <input
            type="range"
            min="10"
            max={maxShapeSize}
            value={shapeSize > maxShapeSize ? maxShapeSize : shapeSize}
            onChange={e => onShapeSizeChange(Math.min(Number(e.target.value), maxShapeSize))}
          />
        </label>
        <label>
          Color:
          <input
            type="color"
            value={selectedColor}
            onChange={e => onColorChange(e.target.value)}
          />
        </label>
      </div>

     
      <div className="sidebar-section select-delete-group">
        <select onChange={e => onSelectionModeChange(e.target.value)}>
          <option value="select">Select</option>
          <option value="selectAll">Select All</option>
        </select>
        <button onClick={onDeleteSelected}>🗑️ Delete</button>
      </div>
    </div>
  );
};

export default Toolbar;
