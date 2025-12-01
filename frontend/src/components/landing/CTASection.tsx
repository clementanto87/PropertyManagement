import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Sparkles } from 'lucide-react';
import './CTASection.css';

export function CTASection() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section className="cta-section" ref={ref}>
            <div className="cta-background">
                <div className="cta-orb cta-orb-1"></div>
                <div className="cta-orb cta-orb-2"></div>
            </div>

            <motion.div
                className="cta-container"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                <div className="cta-icon">
                    <Sparkles size={48} />
                </div>

                <h2 className="cta-title">
                    Ready to transform your
                    <br />
                    property management?
                </h2>

                <p className="cta-subtitle">
                    Join thousands of property managers who trust our platform
                </p>

                <div className="cta-buttons">
                    <button className="cta-button primary">
                        <span>Start Free Trial</span>
                        <ArrowRight size={20} />
                    </button>
                    <button className="cta-button secondary">
                        <span>Schedule Demo</span>
                    </button>
                </div>

                <div className="cta-trust">
                    <div className="trust-item">
                        <span className="trust-icon">✓</span>
                        <span>No credit card required</span>
                    </div>
                    <div className="trust-item">
                        <span className="trust-icon">✓</span>
                        <span>14-day free trial</span>
                    </div>
                    <div className="trust-item">
                        <span className="trust-icon">✓</span>
                        <span>Cancel anytime</span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
