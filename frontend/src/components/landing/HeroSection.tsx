import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import './HeroSection.css';

export function HeroSection() {
    return (
        <section className="hero-section">
            <div className="hero-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="hero-container">
                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="hero-badge">
                            <span className="badge-icon">✨</span>
                            <span>Modern Property Management</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Simplify Property
                        <br />
                        <span className="gradient-text">Management</span>
                    </motion.h1>

                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Streamline operations, delight tenants, and maximize revenue with our
                        all-in-one property management platform.
                    </motion.p>

                    <motion.div
                        className="hero-cta"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <button className="btn btn-primary">
                            <span>Start Free Trial</span>
                            <ArrowRight size={20} />
                        </button>
                        <button className="btn btn-secondary">
                            <Play size={20} />
                            <span>Watch Demo</span>
                        </button>
                    </motion.div>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <div className="stat">
                            <div className="stat-value">10K+</div>
                            <div className="stat-label">Properties</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <div className="stat-value">50K+</div>
                            <div className="stat-label">Happy Tenants</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <div className="stat-value">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                >
                    {/* CSS-based 3D Illustration */}
                    <div className="illustration-3d">
                        <div className="house-3d">
                            <div className="house-base"></div>
                            <div className="house-roof"></div>
                            <div className="house-door"></div>
                            <div className="house-window window-left"></div>
                            <div className="house-window window-right"></div>
                        </div>
                        <div className="floating-orb orb-blue"></div>
                        <div className="floating-orb orb-purple"></div>
                        <div className="floating-orb orb-green"></div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
