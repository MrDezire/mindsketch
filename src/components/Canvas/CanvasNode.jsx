import { useState, useRef, useEffect } from 'react';
import './CanvasNode.css';

export default function CanvasNode({
    node,
    isSelected,
    isConnecting,
    onClick,
    onUpdate,
    onDelete,
    onDuplicate,
    onStartConnection,
    viewport
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(node.content);
    const nodeRef = useRef(null);
    const textareaRef = useRef(null);

    // Update edit content when node content changes
    useEffect(() => {
        setEditContent(node.content);
    }, [node.content]);

    // Focus textarea when editing
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    // Handle drag start
    const handleMouseDown = (e) => {
        if (e.button !== 0 || isEditing) return;
        e.stopPropagation();

        const rect = nodeRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsDragging(true);
    };

    // Handle drag
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const newX = (e.clientX - dragOffset.x - viewport.x) / viewport.zoom;
            const newY = (e.clientY - dragOffset.y - viewport.y) / viewport.zoom;

            onUpdate({ position: { x: newX, y: newY } });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, viewport, onUpdate]);

    // Handle double click to edit
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (node.type !== 'image') {
            setIsEditing(true);
        }
    };

    // Save content
    const handleSaveContent = () => {
        onUpdate({ content: editContent });
        setIsEditing(false);
    };

    // Handle key down in editing mode
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setEditContent(node.content);
            setIsEditing(false);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveContent();
        }
    };

    // Get node color class
    const getColorClass = () => {
        const colors = {
            yellow: 'node-yellow',
            pink: 'node-pink',
            blue: 'node-blue',
            green: 'node-green',
            orange: 'node-orange',
            purple: 'node-purple'
        };
        return colors[node.style?.color] || 'node-yellow';
    };

    // Handle color change
    const handleColorChange = (color) => {
        onUpdate({ style: { ...node.style, color } });
    };

    // Render node content based on type
    const renderContent = () => {
        if (node.type === 'image' && node.imageData) {
            return (
                <div className="node-image-container">
                    <img
                        src={node.imageData}
                        alt={node.fileName || 'Image'}
                        className="node-image"
                        draggable={false}
                    />
                    {node.content && (
                        <div className="node-image-caption">{node.content}</div>
                    )}
                </div>
            );
        }

        if (isEditing) {
            return (
                <textarea
                    ref={textareaRef}
                    className="node-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onBlur={handleSaveContent}
                    onKeyDown={handleKeyDown}
                    placeholder="Write your idea..."
                />
            );
        }

        return (
            <div className="node-text">
                {node.content || (
                    <span className="placeholder">Double-click to edit...</span>
                )}
            </div>
        );
    };

    return (
        <div
            ref={nodeRef}
            className={`canvas-node ${node.type} ${getColorClass()} ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
                left: node.position.x,
                top: node.position.y,
                width: node.style?.width || 180,
                minHeight: node.type === 'image' ? 'auto' : (node.style?.height || (node.type === 'sticky' ? 150 : 80))
            }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {/* Node content */}
            <div className="node-content">
                {renderContent()}
            </div>

            {/* Node controls (visible when selected) */}
            {isSelected && !isEditing && (
                <div className="node-controls">
                    {/* Color picker (not for images) */}
                    {node.type !== 'image' && (
                        <div className="control-group colors">
                            {['yellow', 'pink', 'blue', 'green', 'orange', 'purple'].map(color => (
                                <button
                                    key={color}
                                    className={`color-btn color-${color} ${node.style?.color === color ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); handleColorChange(color); }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="control-group actions">
                        <button
                            className="action-btn connect-btn"
                            onClick={(e) => { e.stopPropagation(); onStartConnection(); }}
                            title="Connect to another node"
                        >
                            🔗
                        </button>
                        <button
                            className="action-btn duplicate-btn"
                            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                            title="Duplicate (Ctrl+D)"
                        >
                            📋
                        </button>
                        <button
                            className="action-btn delete-btn"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            )}

            {/* Resize handle */}
            <div
                className="resize-handle"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = node.style?.width || 180;
                    const startHeight = node.style?.height || 150;

                    const handleResize = (e) => {
                        const newWidth = Math.max(100, startWidth + (e.clientX - startX) / viewport.zoom);
                        const newHeight = Math.max(80, startHeight + (e.clientY - startY) / viewport.zoom);
                        onUpdate({ style: { ...node.style, width: newWidth, height: newHeight } });
                    };

                    const stopResize = () => {
                        window.removeEventListener('mousemove', handleResize);
                        window.removeEventListener('mouseup', stopResize);
                    };

                    window.addEventListener('mousemove', handleResize);
                    window.addEventListener('mouseup', stopResize);
                }}
            />

            {/* Connection point indicator */}
            <div className="connection-point top" />
            <div className="connection-point bottom" />
            <div className="connection-point left" />
            <div className="connection-point right" />
        </div>
    );
}
