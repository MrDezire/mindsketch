import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Landing.css';

export default function Landing() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing-page">
            {/* Floating doodle decorations */}
            <div className="landing-doodles">
                <span className="doodle d1">💡</span>
                <span className="doodle d2">✏️</span>
                <span className="doodle d3">🎨</span>
                <span className="doodle d4">📝</span>
                <span className="doodle d5">⭐</span>
                <span className="doodle d6">🧠</span>
            </div>

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-logo">
                    <span className="logo-icon">💭</span>
                    <span className="logo-text">MindSketch</span>
                </div>
                <div className="nav-links">
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn btn-primary">
                            Go to Dashboard →
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">Sign In</Link>
                            <Link to="/signup" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content animate-fade-up">
                    <h1 className="hero-title">
                        <span className="title-line">Sketch Your</span>
                        <span className="title-highlight">Ideas</span>
                        <span className="title-line">Into Reality</span>
                    </h1>

                    <p className="hero-subtitle">
                        A creative canvas for brainstorming, mind mapping, and capturing
                        your thoughts — like doodling in a notebook, but infinitely better.
                    </p>

                    <div className="hero-actions">
                        <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="btn btn-primary btn-large">
                            🚀 Start Sketching Free
                        </Link>
                        <Link to="#features" className="btn btn-ghost">
                            Learn More ↓
                        </Link>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="canvas-preview">
                        <div className="preview-node node-1 sticky-note yellow">
                            <span>💡 Big Idea!</span>
                        </div>
                        <div className="preview-node node-2 sticky-note pink">
                            <span>🎯 Goals</span>
                        </div>
                        <div className="preview-node node-3 sticky-note blue">
                            <span>📚 Notes</span>
                        </div>
                        <div className="preview-node node-4 sticky-note green">
                            <span>✅ Tasks</span>
                        </div>
                        <svg className="preview-connections">
                            <path d="M 150 80 Q 200 120 180 180" className="connection-line" />
                            <path d="M 150 80 Q 100 150 120 200" className="connection-line" />
                            <path d="M 180 180 Q 220 220 250 200" className="connection-line" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <h2 className="section-title">Why MindSketch?</h2>

                <div className="features-grid">
                    <div className="feature-card sketch-card">
                        <span className="feature-icon">🎨</span>
                        <h3>Infinite Canvas</h3>
                        <p>Unlimited space for your ideas. Zoom, pan, and explore your thoughts freely.</p>
                    </div>

                    <div className="feature-card sketch-card">
                        <span className="feature-icon">🔗</span>
                        <h3>Connect Ideas</h3>
                        <p>Draw pencil-style connections between thoughts to map relationships.</p>
                    </div>

                    <div className="feature-card sketch-card">
                        <span className="feature-icon">📱</span>
                        <h3>Works Everywhere</h3>
                        <p>Seamlessly switch between phone, tablet, and desktop.</p>
                    </div>

                    <div className="feature-card sketch-card">
                        <span className="feature-icon">☁️</span>
                        <h3>Cloud Saved</h3>
                        <p>Your sketches are automatically saved and synced across devices.</p>
                    </div>

                    <div className="feature-card sketch-card">
                        <span className="feature-icon">🔒</span>
                        <h3>Private & Secure</h3>
                        <p>Your workspace is yours alone. Secure login keeps your ideas safe.</p>
                    </div>

                    <div className="feature-card sketch-card">
                        <span className="feature-icon">💰</span>
                        <h3>100% Free</h3>
                        <p>No paywalls, no premium tiers. All features free forever.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content sketch-card">
                    <h2>Ready to capture your ideas?</h2>
                    <p>Join MindSketch today and transform how you think, plan, and create.</p>
                    <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="btn btn-primary btn-large">
                        ✨ Get Started — It's Free!
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <span className="logo-icon">💭</span>
                        <span>MindSketch</span>
                    </div>
                    <p className="footer-tagline">Think. Sketch. Create.</p>
                    <p className="footer-credit">Created by <strong>Husenbasha</strong> 🐼</p>
                    <p className="footer-copy">Made with ✏️ and ❤️ | © 2026</p>
                </div>
            </footer>
        </div>
    );
}
