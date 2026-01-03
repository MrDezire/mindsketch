import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSketchboard } from '../../contexts/SketchboardContext';
import CanvasNode from '../../components/Canvas/CanvasNode';
import CanvasConnection from '../../components/Canvas/CanvasConnection';
import CanvasToolbar from '../../components/Canvas/CanvasToolbar';
import './Canvas.css';

export default function Canvas() {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const {
        currentBoard,
        nodes,
        connections,
        loading,
        saving,
        canUndo,
        canRedo,
        loadBoard,
        addNode,
        updateNode,
        deleteNode,
        duplicateNode,
        addConnection,
        deleteConnection,
        saveBoard,
        updateBoardName,
        undo,
        redo,
        exportAsJSON,
        importFromJSON
    } = useSketchboard();

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState(null);
    const [connectingFrom, setConnectingFrom] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showContextMenu, setShowContextMenu] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState('');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [notification, setNotification] = useState(null);

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Load board on mount
    useEffect(() => {
        if (boardId) {
            loadBoard(boardId);
        }
    }, [boardId, loadBoard]);

    // Update title value when board loads
    useEffect(() => {
        if (currentBoard) {
            setTitleValue(currentBoard.name);
        }
    }, [currentBoard]);

    // Screen to canvas coordinates
    const screenToCanvas = useCallback((screenX, screenY) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };

        return {
            x: (screenX - rect.left - viewport.x) / viewport.zoom,
            y: (screenY - rect.top - viewport.y) / viewport.zoom
        };
    }, [viewport]);

    // Handle mouse wheel for zoom
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(Math.max(viewport.zoom * delta, 0.1), 5);

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setViewport(prev => ({
            x: mouseX - (mouseX - prev.x) * (newZoom / prev.zoom),
            y: mouseY - (mouseY - prev.y) * (newZoom / prev.zoom),
            zoom: newZoom
        }));
    }, [viewport.zoom]);

    // Handle pan start
    const handleMouseDown = (e) => {
        if (e.target === canvasRef.current || e.target.classList.contains('canvas-grid')) {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                setIsPanning(true);
                setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
                e.preventDefault();
            } else if (e.button === 0) {
                setSelectedNode(null);
                setConnectingFrom(null);
                setShowContextMenu(null);
                setShowExportMenu(false);
            }
        }
    };

    // Handle pan move
    const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });

        if (isPanning) {
            setViewport(prev => ({
                ...prev,
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            }));
        }
    };

    // Handle pan end
    const handleMouseUp = () => {
        setIsPanning(false);
    };

    // Handle context menu (right click)
    const handleContextMenu = (e) => {
        e.preventDefault();
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setShowContextMenu({
            x: e.clientX,
            y: e.clientY,
            canvasX: canvasPos.x,
            canvasY: canvasPos.y
        });
    };

    // Add node from context menu
    const handleAddNode = (type) => {
        if (showContextMenu) {
            addNode(type, {
                x: showContextMenu.canvasX,
                y: showContextMenu.canvasY
            });
            setShowContextMenu(null);
        }
    };

    // Add node from toolbar
    const handleToolbarAddNode = (type) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = (rect.width / 2 - viewport.x) / viewport.zoom;
        const centerY = (rect.height / 2 - viewport.y) / viewport.zoom;

        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;

        addNode(type, { x: centerX + offsetX, y: centerY + offsetY });
    };

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file!', 'error');
            return;
        }

        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onload = () => {
            const rect = canvasRef.current.getBoundingClientRect();
            const centerX = (rect.width / 2 - viewport.x) / viewport.zoom;
            const centerY = (rect.height / 2 - viewport.y) / viewport.zoom;

            addNode('image', { x: centerX, y: centerY }, '', {
                imageData: reader.result,
                fileName: file.name
            });

            showNotification('Image added! 📷');
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
    };

    // Handle node click for connection
    const handleNodeClick = (nodeId) => {
        if (connectingFrom) {
            if (connectingFrom !== nodeId) {
                addConnection(connectingFrom, nodeId);
            }
            setConnectingFrom(null);
        } else {
            setSelectedNode(nodeId);
        }
    };

    // Handle starting a connection
    const handleStartConnection = (nodeId) => {
        setConnectingFrom(nodeId);
        setSelectedNode(null);
    };

    // Handle duplicate
    const handleDuplicate = () => {
        if (selectedNode) {
            duplicateNode(selectedNode);
            showNotification('Node duplicated! 📋');
        }
    };

    // Handle export
    const handleExport = (format) => {
        if (format === 'json') {
            exportAsJSON();
            showNotification('Exported as JSON! 📄');
        }
        setShowExportMenu(false);
    };

    // Handle import
    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const success = importFromJSON(reader.result);
            if (success) {
                showNotification('Imported successfully! 🎉');
            } else {
                showNotification('Import failed. Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Delete selected node
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode && !isEditingTitle) {
                deleteNode(selectedNode);
                setSelectedNode(null);
                return;
            }

            // Escape to cancel
            if (e.key === 'Escape') {
                setSelectedNode(null);
                setConnectingFrom(null);
                setShowContextMenu(null);
                setShowExportMenu(false);
                return;
            }

            // Ctrl+S to save
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                saveBoard();
                showNotification('Saved! 💾');
                return;
            }

            // Ctrl+Z to undo
            if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }

            // Ctrl+Shift+Z or Ctrl+Y to redo
            if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
                (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
                redo();
                return;
            }

            // Ctrl+D to duplicate
            if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedNode) {
                e.preventDefault();
                handleDuplicate();
                return;
            }

            // Reset viewport
            if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setViewport({ x: 0, y: 0, zoom: 1 });
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNode, deleteNode, saveBoard, undo, redo, isEditingTitle, handleDuplicate]);

    // Add wheel event listener
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
            return () => canvas.removeEventListener('wheel', handleWheel);
        }
    }, [handleWheel]);

    // Handle title save
    const handleTitleSave = () => {
        if (titleValue.trim() && titleValue !== currentBoard?.name) {
            updateBoardName(boardId, titleValue.trim());
        }
        setIsEditingTitle(false);
    };

    if (loading) {
        return (
            <div className="canvas-loading">
                <div className="loader-pencil"></div>
                <p>Loading your sketch...</p>
            </div>
        );
    }

    return (
        <div className="canvas-page">
            {/* Notification */}
            {notification && (
                <div className={`notification ${notification.type} animate-pop`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <header className="canvas-header">
                <div className="header-left">
                    <button className="btn-icon back-btn" onClick={() => navigate('/dashboard')}>
                        ← Back
                    </button>

                    {isEditingTitle ? (
                        <input
                            type="text"
                            className="title-input"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSave();
                                if (e.key === 'Escape') setIsEditingTitle(false);
                            }}
                            autoFocus
                        />
                    ) : (
                        <h1
                            className="canvas-title"
                            onClick={() => setIsEditingTitle(true)}
                            title="Click to edit"
                        >
                            {currentBoard?.name || 'Untitled'}
                        </h1>
                    )}
                </div>

                <div className="header-center">
                    {/* Undo/Redo Buttons */}
                    <div className="history-controls">
                        <button
                            className={`btn-icon ${!canUndo ? 'disabled' : ''}`}
                            onClick={undo}
                            disabled={!canUndo}
                            title="Undo (Ctrl+Z)"
                        >
                            ↶
                        </button>
                        <button
                            className={`btn-icon ${!canRedo ? 'disabled' : ''}`}
                            onClick={redo}
                            disabled={!canRedo}
                            title="Redo (Ctrl+Y)"
                        >
                            ↷
                        </button>
                    </div>

                    <div className="zoom-controls">
                        <button
                            className="btn-icon"
                            onClick={() => setViewport(v => ({ ...v, zoom: Math.max(v.zoom - 0.1, 0.1) }))}
                        >
                            −
                        </button>
                        <span className="zoom-level">{Math.round(viewport.zoom * 100)}%</span>
                        <button
                            className="btn-icon"
                            onClick={() => setViewport(v => ({ ...v, zoom: Math.min(v.zoom + 0.1, 5) }))}
                        >
                            +
                        </button>
                        <button
                            className="btn-icon"
                            onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
                            title="Reset view"
                        >
                            ⌂
                        </button>
                    </div>
                </div>

                <div className="header-right">
                    {saving && (
                        <div className="save-indicator">
                            <span className="save-dot"></span>
                            Saving...
                        </div>
                    )}

                    {/* Export Menu */}
                    <div className="export-menu-container">
                        <button
                            className="btn btn-small"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                        >
                            📤 Export
                        </button>
                        {showExportMenu && (
                            <div className="export-dropdown animate-pop">
                                <button onClick={() => handleExport('json')}>
                                    📄 Export as JSON
                                </button>
                                <label className="import-label">
                                    📥 Import JSON
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImport}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    <button className="btn btn-small btn-primary" onClick={saveBoard}>
                        💾 Save
                    </button>
                </div>
            </header>

            {/* Toolbar */}
            <CanvasToolbar
                onAddNode={handleToolbarAddNode}
                onAddImage={() => fileInputRef.current?.click()}
                connectingFrom={connectingFrom}
                onCancelConnect={() => setConnectingFrom(null)}
            />

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />

            {/* Canvas */}
            <div
                ref={canvasRef}
                className={`canvas-area ${isPanning ? 'panning' : ''} ${connectingFrom ? 'connecting' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={handleContextMenu}
            >
                {/* Grid background */}
                <div
                    className="canvas-grid"
                    style={{
                        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
                        backgroundSize: `${32 * viewport.zoom}px ${32 * viewport.zoom}px`
                    }}
                />

                {/* Canvas content */}
                <div
                    className="canvas-content"
                    style={{
                        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
                    }}
                >
                    {/* Connections */}
                    <svg className="connections-layer">
                        {connections.map(conn => {
                            const fromNode = nodes.find(n => n.id === conn.fromId);
                            const toNode = nodes.find(n => n.id === conn.toId);
                            if (!fromNode || !toNode) return null;

                            return (
                                <CanvasConnection
                                    key={conn.id}
                                    connection={conn}
                                    fromNode={fromNode}
                                    toNode={toNode}
                                    onDelete={() => deleteConnection(conn.id)}
                                />
                            );
                        })}

                        {/* Drawing connection line */}
                        {connectingFrom && (
                            <line
                                className="connecting-line"
                                x1={nodes.find(n => n.id === connectingFrom)?.position.x + 75 || 0}
                                y1={nodes.find(n => n.id === connectingFrom)?.position.y + 50 || 0}
                                x2={(mousePosition.x - viewport.x) / viewport.zoom}
                                y2={(mousePosition.y - viewport.y) / viewport.zoom}
                            />
                        )}
                    </svg>

                    {/* Nodes */}
                    {nodes.map(node => (
                        <CanvasNode
                            key={node.id}
                            node={node}
                            isSelected={selectedNode === node.id}
                            isConnecting={connectingFrom === node.id}
                            onClick={() => handleNodeClick(node.id)}
                            onUpdate={(updates) => updateNode(node.id, updates)}
                            onDelete={() => {
                                deleteNode(node.id);
                                setSelectedNode(null);
                            }}
                            onDuplicate={() => duplicateNode(node.id)}
                            onStartConnection={() => handleStartConnection(node.id)}
                            viewport={viewport}
                        />
                    ))}
                </div>
            </div>

            {/* Context Menu */}
            {showContextMenu && (
                <div
                    className="context-menu sketch-card animate-pop"
                    style={{ left: showContextMenu.x, top: showContextMenu.y }}
                >
                    <button onClick={() => handleAddNode('text')}>
                        📝 Text Note
                    </button>
                    <button onClick={() => handleAddNode('sticky')}>
                        📌 Sticky Note
                    </button>
                    <button onClick={() => handleAddNode('shape')}>
                        ⬡ Shape
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); setShowContextMenu(null); }}>
                        🖼️ Add Image
                    </button>
                    <div className="menu-divider"></div>
                    <button onClick={() => setShowContextMenu(null)}>
                        ✕ Cancel
                    </button>
                </div>
            )}

            {/* Mobile bottom toolbar */}
            <div className="mobile-toolbar">
                <button onClick={() => handleToolbarAddNode('text')}>📝</button>
                <button onClick={() => handleToolbarAddNode('sticky')}>📌</button>
                <button onClick={() => fileInputRef.current?.click()}>🖼️</button>
                <button onClick={undo} disabled={!canUndo}>↶</button>
                <button onClick={redo} disabled={!canRedo}>↷</button>
                <button onClick={saveBoard}>💾</button>
            </div>
        </div>
    );
}
