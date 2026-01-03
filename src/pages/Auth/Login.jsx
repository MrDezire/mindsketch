import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, signInWithGoogle, signInAsGuest, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err) {
            // Error handled by context
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            // Error handled by context
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestSignIn = async () => {
        setIsLoading(true);
        try {
            await signInAsGuest();
            navigate('/dashboard');
        } catch (err) {
            // Error handled by context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-pop">
                {/* Decorative doodles */}
                <div className="doodle-decoration doodle-1">✏️</div>
                <div className="doodle-decoration doodle-2">💡</div>
                <div className="doodle-decoration doodle-3">📝</div>

                <div className="auth-header">
                    <h1 className="auth-title">Welcome Back!</h1>
                    <p className="auth-subtitle">Sign in to continue sketching your ideas</p>
                </div>

                {error && (
                    <div className="error-note animate-shake" onClick={clearError}>
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                        <button className="error-close">×</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="email" className="input-label">Email</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>
                            <input
                                type="email"
                                id="email"
                                className="input-sketch"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password" className="input-label">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                id="password"
                                className="input-sketch"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="btn-loading">
                                <span className="loader-pencil"></span>
                                Signing in...
                            </span>
                        ) : (
                            <>✨ Sign In</>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                <div className="social-buttons">
                    <button
                        className="btn btn-social btn-google"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <svg className="social-icon" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>

                    <button
                        className="btn btn-social btn-guest"
                        onClick={handleGuestSignIn}
                        disabled={isLoading}
                    >
                        <span className="social-icon-emoji">👤</span>
                        Guest Mode
                    </button>
                </div>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/signup" className="auth-link">Create one!</Link>
                </p>
            </div>

            {/* Background decorations */}
            <div className="bg-doodles">
                <div className="bg-doodle bg-1">○</div>
                <div className="bg-doodle bg-2">△</div>
                <div className="bg-doodle bg-3">□</div>
                <div className="bg-doodle bg-4">☆</div>
                <div className="bg-doodle bg-5">◇</div>
            </div>
        </div>
    );
}
