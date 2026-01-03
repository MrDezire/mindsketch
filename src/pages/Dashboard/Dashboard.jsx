import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSketchboard } from '../../contexts/SketchboardContext';
import './Dashboard.css';

export default function Dashboard() {
    const { user, logOut, isGuest } = useAuth();
    const { boards, loading, createBoard, deleteBoard, updateBoardName } = useSketchboard();
    const [isCreating, setIsCreating] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const navigate = useNavigate();

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newBoardName.trim()) return;

        try {
            const board = await createBoard(newBoardName.trim());
            if (board) {
                navigate(`/canvas/${board.id}`);
            }
        } catch (err) {
            console.error('Failed to create board:', err);
        }
        setNewBoardName('');
        setIsCreating(false);
    };

    const handleQuickCreate = async () => {
        try {
            const board = await createBoard('Untitled Sketch');
            if (board) {
                navigate(`/canvas/${board.id}`);
            }
        } catch (err) {
            console.error('Failed to create board:', err);
        }
    };

    const handleDeleteBoard = async (e, boardId) => {
        e.stopPropagation();
        if (window.confirm('Delete this sketchboard? This cannot be undone!')) {
            await deleteBoard(boardId);
        }
    };

    const handleStartEdit = (e, board) => {
        e.stopPropagation();
        setEditingId(board.id);
        setEditName(board.name);
    };

    const handleSaveEdit = async (e, boardId) => {
        e.stopPropagation();
        if (editName.trim()) {
            await updateBoardName(boardId, editName.trim());
        }
        setEditingId(null);
    };

    const handleLogout = async () => {
        await logOut();
        navigate('/');
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <span className="logo-icon">💭</span>
                    <h1 className="logo-text">MindSketch</h1>
                </div>

                <div className="header-right">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || 'User'} />
                            ) : (
                                <span>{isGuest ? '👤' : (user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}</span>
                            )}
                        </div>
                        <div className="user-details">
                            <span className="user-name">
                                {isGuest ? 'Guest User' : (user?.displayName || user?.email?.split('@')[0] || 'Sketcher')}
                            </span>
                            {isGuest && <span className="guest-badge">Guest Mode</span>}
                        </div>
                    </div>
                    <button className="btn btn-small" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-title-row">
                    <h2 className="dashboard-title">Your Sketchboards</h2>
                    <button
                        className="btn btn-primary"
                        onClick={handleQuickCreate}
                    >
                        ✨ New Sketch
                    </button>
                </div>

                {isGuest && (
                    <div className="guest-warning sticky-note pink animate-pop">
                        <span className="warning-icon">⚠️</span>
                        <div className="warning-content">
                            <strong>Guest Mode</strong>
                            <p>Your sketches won't be saved after you leave. Sign up to keep them!</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <div className="loader-pencil"></div>
                        <p>Loading your sketches...</p>
                    </div>
                ) : boards.length === 0 ? (
                    <div className="empty-state animate-fade-up">
                        <div className="empty-illustration">
                            <span className="empty-icon">📝</span>
                        </div>
                        <h3>No sketches yet!</h3>
                        <p>Create your first sketchboard to start capturing ideas.</p>
                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => setIsCreating(true)}
                        >
                            🎨 Create Your First Sketch
                        </button>
                    </div>
                ) : (
                    <div className="boards-grid">
                        {/* Create New Card */}
                        <div
                            className="board-card create-card"
                            onClick={() => setIsCreating(true)}
                        >
                            <div className="create-icon">+</div>
                            <span>New Sketchboard</span>
                        </div>

                        {/* Board Cards */}
                        {boards.map((board, index) => (
                            <div
                                key={board.id}
                                className="board-card"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    transform: `rotate(${(index % 3 - 1) * 1.5}deg)`
                                }}
                                onClick={() => navigate(`/canvas/${board.id}`)}
                            >
                                <div className="board-preview">
                                    <span className="preview-placeholder">
                                        {board.nodes?.length || 0} ideas
                                    </span>
                                </div>

                                <div className="board-info">
                                    {editingId === board.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onBlur={(e) => handleSaveEdit(e, board.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit(e, board.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="board-name-input"
                                            autoFocus
                                        />
                                    ) : (
                                        <h3 className="board-name">{board.name}</h3>
                                    )}
                                    <span className="board-date">{formatDate(board.updatedAt)}</span>
                                </div>

                                <div className="board-actions">
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={(e) => handleStartEdit(e, board)}
                                        title="Rename"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={(e) => handleDeleteBoard(e, board.id)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {isCreating && (
                <div className="modal-overlay" onClick={() => setIsCreating(false)}>
                    <div
                        className="modal-content sketch-card animate-pop"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Name Your Sketchboard</h3>
                        <form onSubmit={handleCreateBoard}>
                            <input
                                type="text"
                                className="input-sketch"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                placeholder="e.g., Project Ideas, Study Notes..."
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setIsCreating(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    ✨ Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
