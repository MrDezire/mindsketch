import './CanvasToolbar.css';

export default function CanvasToolbar({ onAddNode, onAddImage, connectingFrom, onCancelConnect }) {
    return (
        <div className="canvas-toolbar">
            <div className="toolbar-group">
                <span className="toolbar-label">Add:</span>

                <button
                    className="toolbar-btn"
                    onClick={() => onAddNode('text')}
                    title="Add Text Note"
                >
                    <span className="btn-icon">📝</span>
                    <span className="btn-label">Text</span>
                </button>

                <button
                    className="toolbar-btn"
                    onClick={() => onAddNode('sticky')}
                    title="Add Sticky Note"
                >
                    <span className="btn-icon">📌</span>
                    <span className="btn-label">Sticky</span>
                </button>

                <button
                    className="toolbar-btn"
                    onClick={() => onAddNode('shape')}
                    title="Add Shape"
                >
                    <span className="btn-icon">⬡</span>
                    <span className="btn-label">Shape</span>
                </button>

                <button
                    className="toolbar-btn"
                    onClick={onAddImage}
                    title="Add Image"
                >
                    <span className="btn-icon">🖼️</span>
                    <span className="btn-label">Image</span>
                </button>
            </div>

            {connectingFrom && (
                <div className="toolbar-group connecting-notice">
                    <span className="notice-text">🔗 Click another node to connect</span>
                    <button
                        className="toolbar-btn cancel-btn"
                        onClick={onCancelConnect}
                    >
                        ✕ Cancel
                    </button>
                </div>
            )}

            <div className="toolbar-group toolbar-tips">
                <span className="tip">💡 Tips:</span>
                <span className="tip-text">Shift+Drag to pan • Scroll to zoom • Ctrl+Z to undo</span>
            </div>

            <div className="toolbar-group toolbar-shortcuts">
                <span className="shortcut">⌨️ Shortcuts:</span>
                <div className="shortcuts-list">
                    <span><kbd>Ctrl</kbd>+<kbd>S</kbd> Save</span>
                    <span><kbd>Ctrl</kbd>+<kbd>Z</kbd> Undo</span>
                    <span><kbd>Ctrl</kbd>+<kbd>D</kbd> Duplicate</span>
                    <span><kbd>Del</kbd> Delete</span>
                </div>
            </div>
        </div>
    );
}
