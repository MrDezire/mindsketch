import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

const SketchboardContext = createContext();

export function useSketchboard() {
    const context = useContext(SketchboardContext);
    if (!context) {
        throw new Error('useSketchboard must be used within a SketchboardProvider');
    }
    return context;
}

// History manager for undo/redo
class HistoryManager {
    constructor(maxSize = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxSize = maxSize;
    }

    push(state) {
        // Remove any future states if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.history.push(JSON.parse(JSON.stringify(state)));

        // Limit history size
        if (this.history.length > this.maxSize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
    }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
}

export function SketchboardProvider({ children }) {
    const { user } = useAuth();
    const [boards, setBoards] = useState([]);
    const [currentBoard, setCurrentBoard] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // History for undo/redo
    const historyRef = useRef(new HistoryManager());
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const isUndoRedoAction = useRef(false);

    // Update undo/redo availability
    const updateHistoryState = useCallback(() => {
        setCanUndo(historyRef.current.canUndo());
        setCanRedo(historyRef.current.canRedo());
    }, []);

    // Save state to history
    const saveToHistory = useCallback(() => {
        if (!isUndoRedoAction.current) {
            historyRef.current.push({ nodes, connections });
            updateHistoryState();
        }
    }, [nodes, connections, updateHistoryState]);

    // Debounced history save
    useEffect(() => {
        if (currentBoard && !isUndoRedoAction.current) {
            const timeoutId = setTimeout(saveToHistory, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [nodes, connections, currentBoard, saveToHistory]);

    // Undo action
    const undo = useCallback(() => {
        const previousState = historyRef.current.undo();
        if (previousState) {
            isUndoRedoAction.current = true;
            setNodes(previousState.nodes);
            setConnections(previousState.connections);
            updateHistoryState();
            setTimeout(() => { isUndoRedoAction.current = false; }, 100);
        }
    }, [updateHistoryState]);

    // Redo action
    const redo = useCallback(() => {
        const nextState = historyRef.current.redo();
        if (nextState) {
            isUndoRedoAction.current = true;
            setNodes(nextState.nodes);
            setConnections(nextState.connections);
            updateHistoryState();
            setTimeout(() => { isUndoRedoAction.current = false; }, 100);
        }
    }, [updateHistoryState]);

    // Fetch user's boards
    useEffect(() => {
        if (!user) {
            setBoards([]);
            setCurrentBoard(null);
            setNodes([]);
            setConnections([]);
            return;
        }

        setLoading(true);
        const boardsRef = collection(db, 'boards');
        const q = query(
            boardsRef,
            where('userId', '==', user.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const boardsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBoards(boardsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching boards:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    // Create a new board
    const createBoard = async (name = 'Untitled Sketch') => {
        if (!user) return null;

        try {
            setSaving(true);
            const boardData = {
                userId: user.uid,
                name,
                nodes: [],
                connections: [],
                viewport: { x: 0, y: 0, zoom: 1 },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'boards'), boardData);
            const newBoard = { id: docRef.id, ...boardData };
            setSaving(false);
            return newBoard;
        } catch (error) {
            console.error('Error creating board:', error);
            setSaving(false);
            throw error;
        }
    };

    // Load a specific board
    const loadBoard = async (boardId) => {
        if (!user) return;

        try {
            setLoading(true);
            const docRef = doc(db, 'boards', boardId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const boardData = { id: docSnap.id, ...docSnap.data() };
                setCurrentBoard(boardData);
                setNodes(boardData.nodes || []);
                setConnections(boardData.connections || []);

                // Initialize history with current state
                historyRef.current.clear();
                historyRef.current.push({
                    nodes: boardData.nodes || [],
                    connections: boardData.connections || []
                });
                updateHistoryState();
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading board:', error);
            setLoading(false);
        }
    };

    // Save current board
    const saveBoard = useCallback(async () => {
        if (!currentBoard || !user) return;

        try {
            setSaving(true);
            const docRef = doc(db, 'boards', currentBoard.id);
            await updateDoc(docRef, {
                nodes,
                connections,
                updatedAt: serverTimestamp()
            });
            setSaving(false);
        } catch (error) {
            console.error('Error saving board:', error);
            setSaving(false);
        }
    }, [currentBoard, nodes, connections, user]);

    // Auto-save on changes
    useEffect(() => {
        if (!currentBoard || isUndoRedoAction.current) return;

        const timeoutId = setTimeout(() => {
            saveBoard();
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [nodes, connections, saveBoard, currentBoard]);

    // Update board name
    const updateBoardName = async (boardId, newName) => {
        try {
            const docRef = doc(db, 'boards', boardId);
            await updateDoc(docRef, {
                name: newName,
                updatedAt: serverTimestamp()
            });

            if (currentBoard?.id === boardId) {
                setCurrentBoard(prev => ({ ...prev, name: newName }));
            }
        } catch (error) {
            console.error('Error updating board name:', error);
        }
    };

    // Delete a board
    const deleteBoard = async (boardId) => {
        try {
            await deleteDoc(doc(db, 'boards', boardId));
            if (currentBoard?.id === boardId) {
                setCurrentBoard(null);
                setNodes([]);
                setConnections([]);
            }
        } catch (error) {
            console.error('Error deleting board:', error);
        }
    };

    // Add a new node
    const addNode = (type, position, content = '', extra = {}) => {
        const newNode = {
            id: uuidv4(),
            type, // 'text', 'shape', 'image', 'sticky'
            position,
            content,
            style: getDefaultNodeStyle(type),
            ...extra,
            createdAt: Date.now()
        };
        setNodes(prev => [...prev, newNode]);
        return newNode;
    };

    // Update a node
    const updateNode = (nodeId, updates) => {
        setNodes(prev => prev.map(node =>
            node.id === nodeId ? { ...node, ...updates } : node
        ));
    };

    // Delete a node
    const deleteNode = (nodeId) => {
        setNodes(prev => prev.filter(node => node.id !== nodeId));
        setConnections(prev => prev.filter(
            conn => conn.fromId !== nodeId && conn.toId !== nodeId
        ));
    };

    // Duplicate a node
    const duplicateNode = (nodeId) => {
        const originalNode = nodes.find(n => n.id === nodeId);
        if (!originalNode) return null;

        const newNode = {
            ...originalNode,
            id: uuidv4(),
            position: {
                x: originalNode.position.x + 30,
                y: originalNode.position.y + 30
            },
            createdAt: Date.now()
        };
        setNodes(prev => [...prev, newNode]);
        return newNode;
    };

    // Add a connection between nodes
    const addConnection = (fromId, toId) => {
        // Prevent duplicate connections
        const exists = connections.some(
            c => (c.fromId === fromId && c.toId === toId) ||
                (c.fromId === toId && c.toId === fromId)
        );
        if (exists) return null;

        const newConnection = {
            id: uuidv4(),
            fromId,
            toId,
            style: 'pencil'
        };
        setConnections(prev => [...prev, newConnection]);
        return newConnection;
    };

    // Delete a connection
    const deleteConnection = (connectionId) => {
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    };

    // Get default style based on node type
    const getDefaultNodeStyle = (type) => {
        const styles = {
            text: {
                width: 200,
                height: 100,
                color: 'yellow',
                fontSize: 16
            },
            sticky: {
                width: 180,
                height: 180,
                color: 'yellow'
            },
            shape: {
                width: 100,
                height: 100,
                shape: 'rectangle',
                color: 'blue'
            },
            image: {
                width: 250,
                height: 200
            }
        };
        return styles[type] || styles.text;
    };

    // Clear the current board
    const clearBoard = () => {
        setNodes([]);
        setConnections([]);
    };

    // Export board as JSON
    const exportAsJSON = () => {
        if (!currentBoard) return null;

        const exportData = {
            name: currentBoard.name,
            exportedAt: new Date().toISOString(),
            nodes,
            connections
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentBoard.name.replace(/\s+/g, '_')}_mindsketch.json`;
        a.click();
        URL.revokeObjectURL(url);

        return exportData;
    };

    // Export board as PNG image
    const exportAsPNG = async (canvasElement) => {
        if (!canvasElement || !currentBoard) return null;

        try {
            // Use html2canvas if available, otherwise basic approach
            const canvas = document.createElement('canvas');
            const rect = canvasElement.getBoundingClientRect();
            canvas.width = rect.width * 2;
            canvas.height = rect.height * 2;

            const ctx = canvas.getContext('2d');
            ctx.scale(2, 2);
            ctx.fillStyle = '#f5f1e8';
            ctx.fillRect(0, 0, rect.width, rect.height);

            // Draw grid
            ctx.strokeStyle = '#e0dcd3';
            ctx.lineWidth = 1;
            for (let x = 0; x < rect.width; x += 32) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, rect.height);
                ctx.stroke();
            }
            for (let y = 0; y < rect.height; y += 32) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(rect.width, y);
                ctx.stroke();
            }

            // Note: For a full implementation, you'd use html2canvas
            // This is a simplified version

            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentBoard.name.replace(/\s+/g, '_')}_mindsketch.png`;
            a.click();

            return url;
        } catch (error) {
            console.error('Export error:', error);
            return null;
        }
    };

    // Import from JSON
    const importFromJSON = (jsonData) => {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (data.nodes && Array.isArray(data.nodes)) {
                // Regenerate IDs to avoid conflicts
                const idMap = {};
                const newNodes = data.nodes.map(node => {
                    const newId = uuidv4();
                    idMap[node.id] = newId;
                    return { ...node, id: newId };
                });

                const newConnections = (data.connections || []).map(conn => ({
                    ...conn,
                    id: uuidv4(),
                    fromId: idMap[conn.fromId] || conn.fromId,
                    toId: idMap[conn.toId] || conn.toId
                }));

                setNodes(prev => [...prev, ...newNodes]);
                setConnections(prev => [...prev, ...newConnections]);

                return true;
            }
            return false;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    };

    const value = {
        boards,
        currentBoard,
        nodes,
        connections,
        loading,
        saving,
        canUndo,
        canRedo,
        createBoard,
        loadBoard,
        saveBoard,
        updateBoardName,
        deleteBoard,
        addNode,
        updateNode,
        deleteNode,
        duplicateNode,
        addConnection,
        deleteConnection,
        clearBoard,
        setCurrentBoard,
        undo,
        redo,
        exportAsJSON,
        exportAsPNG,
        importFromJSON
    };

    return (
        <SketchboardContext.Provider value={value}>
            {children}
        </SketchboardContext.Provider>
    );
}

export default SketchboardContext;
