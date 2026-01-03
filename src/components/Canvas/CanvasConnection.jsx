import { useState } from 'react';
import './CanvasConnection.css';

export default function CanvasConnection({ connection, fromNode, toNode, onDelete }) {
    const [isHovered, setIsHovered] = useState(false);

    // Calculate center points of nodes
    const fromX = fromNode.position.x + (fromNode.style?.width || 180) / 2;
    const fromY = fromNode.position.y + (fromNode.style?.height || 150) / 2;
    const toX = toNode.position.x + (toNode.style?.width || 180) / 2;
    const toY = toNode.position.y + (toNode.style?.height || 150) / 2;

    // Calculate control points for bezier curve (makes it look more sketchy)
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;

    // Add some curve
    const curveFactor = 0.2;
    const ctrl1X = fromX + dx * 0.25 + dy * curveFactor;
    const ctrl1Y = fromY + dy * 0.25 - dx * curveFactor;
    const ctrl2X = fromX + dx * 0.75 - dy * curveFactor;
    const ctrl2Y = fromY + dy * 0.75 + dx * curveFactor;

    // Create wavy path for hand-drawn effect
    const createWavyPath = () => {
        const steps = 20;
        let path = `M ${fromX} ${fromY}`;

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;

            // Bezier curve calculation
            const x = Math.pow(1 - t, 3) * fromX +
                3 * Math.pow(1 - t, 2) * t * ctrl1X +
                3 * (1 - t) * Math.pow(t, 2) * ctrl2X +
                Math.pow(t, 3) * toX;
            const y = Math.pow(1 - t, 3) * fromY +
                3 * Math.pow(1 - t, 2) * t * ctrl1Y +
                3 * (1 - t) * Math.pow(t, 2) * ctrl2Y +
                Math.pow(t, 3) * toY;

            // Add slight random waviness for hand-drawn effect
            const waveX = x + (Math.sin(i * 2.5) * 1.5);
            const waveY = y + (Math.cos(i * 2.5) * 1.5);

            path += ` L ${waveX} ${waveY}`;
        }

        return path;
    };

    return (
        <g
            className={`canvas-connection ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Invisible wider path for easier interaction */}
            <path
                className="connection-hitbox"
                d={createWavyPath()}
                style={{ pointerEvents: 'stroke' }}
            />

            {/* Visible sketchy line */}
            <path
                className="connection-line"
                d={createWavyPath()}
            />

            {/* Delete button in middle */}
            {isHovered && (
                <g
                    className="connection-delete"
                    transform={`translate(${midX}, ${midY})`}
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                >
                    <circle r="12" className="delete-bg" />
                    <text className="delete-icon" textAnchor="middle" dy="4">×</text>
                </g>
            )}
        </g>
    );
}
