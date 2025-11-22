import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Building, ArrowRight, Shield, Zap, Layers } from 'lucide-react';
import './Landing3D.css';

// --- UI COMPONENTS ---

const GlassCard = ({ icon: Icon, title, text }) => (
    <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        className="glass-card"
    >
        <div className="glass-card-glow" />
        <div className="glass-card-content">
            <div className="glass-card-icon">
                <Icon className="text-white" size={24} />
            </div>
            <h3 className="glass-card-title">{title}</h3>
            <p className="glass-card-text">{text}</p>
        </div>
    </motion.div>
);

const Navbar = () => (
    <nav className="navbar">
        <div className="navbar-brand">
            <div className="navbar-logo">P</div>
            <span className="navbar-name">PropNano</span>
        </div>
        <button className="navbar-button">
            Sign In
        </button>
    </nav>
);

export default function Landing3D() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <div className="landing-nano">

            {/* 3D BACKGROUND - Pure CSS */}
            <div className="background-3d">
                <div className="floating-block block-1"></div>
                <div className="floating-block block-2"></div>
                <div className="floating-block block-3"></div>
                <div className="floating-block block-4"></div>

                {/* Nano particles */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="nano-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {/* CONTENT LAYER */}
            <div className="content-layer">
                <Navbar />

                {/* HERO SECTION */}
                <section className="hero-section">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="hero-content"
                    >
                        <div className="hero-badge">
                            <span className="badge-dot" />
                            <span className="badge-text">V 2.0 Live</span>
                        </div>

                        <h1 className="hero-title">
                            Manage Properties <br />
                            <span className="hero-title-accent">At Nano Scale.</span>
                        </h1>

                        <p className="hero-description">
                            The first property management platform powered by fluid 3D intelligence.
                            Visualize occupancy, automate maintenance, and scale your portfolio effortlessly.
                        </p>

                        <div className="hero-buttons">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="button-primary"
                            >
                                Start Free Trial <ArrowRight size={20} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="button-secondary"
                            >
                                View Demo
                            </motion.button>
                        </div>
                    </motion.div>
                </section>

                {/* FEATURES GRID */}
                <section className="features-section">
                    <div className="features-grid">
                        <GlassCard
                            icon={Zap}
                            title="Instant Leasing"
                            text="Automate applications and background checks with our nano-fast processing engine."
                        />
                        <GlassCard
                            icon={Layers}
                            title="Deep Analytics"
                            text="Visualize your portfolio's performance with 3D interactive charts and predictive modeling."
                        />
                        <GlassCard
                            icon={Shield}
                            title="Ironclad Security"
                            text="Bank-grade encryption keeps your tenant data and financial records completely secure."
                        />
                    </div>
                </section>

                {/* BIG TEXT SCROLL */}
                <section className="scroll-text-section">
                    <motion.div
                        className="scroll-text-wrapper"
                        animate={{ x: [0, -1000] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    >
                        {[...Array(8)].map((_, i) => (
                            <h2 key={i} className="scroll-text">
                                PROPERTY • MANAGEMENT • REIMAGINED •
                            </h2>
                        ))}
                    </motion.div>
                </section>

                {/* FINAL CTA */}
                <section className="cta-section">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to evolve?</h2>
                        <button className="cta-button">
                            Get Access Now
                        </button>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="footer">
                    <p>© 2024 PropNano Inc. Built for the future.</p>
                </footer>
            </div>
        </div>
    );
}
