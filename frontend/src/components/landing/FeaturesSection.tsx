import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CreditCard, Wrench, BarChart3, Users, Smartphone, Bell } from 'lucide-react';
import './FeaturesSection.css';

const features = [
    {
        icon: CreditCard,
        title: 'Online Rent Payments',
        description: 'Accept payments securely with automated reminders and receipts',
        color: '#3B82F6',
    },
    {
        icon: Wrench,
        title: 'Maintenance Management',
        description: 'Track and resolve maintenance requests efficiently',
        color: '#F59E0B',
    },
    {
        icon: BarChart3,
        title: 'Financial Reports',
        description: 'Generate comprehensive financial reports instantly',
        color: '#10B981',
    },
    {
        icon: Users,
        title: 'Tenant Portal',
        description: 'Self-service portal for tenants to manage their account',
        color: '#8B5CF6',
    },
    {
        icon: Smartphone,
        title: 'Mobile Apps',
        description: 'Native iOS and Android apps for on-the-go management',
        color: '#EC4899',
    },
    {
        icon: Bell,
        title: 'Smart Notifications',
        description: 'Stay informed with real-time alerts and updates',
        color: '#EF4444',
    },
];

export function FeaturesSection() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section className="features-section" ref={ref}>
            <div className="features-container">
                <motion.div
                    className="features-header"
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="features-title">
                        Everything you need to manage
                        <br />
                        <span className="gradient-text">properties efficiently</span>
                    </h2>
                    <p className="features-subtitle">
                        Powerful features designed to streamline your property management workflow
                    </p>
                </motion.div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="feature-card"
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <div className="feature-icon" style={{ backgroundColor: `${feature.color}20` }}>
                                <feature.icon size={32} color={feature.color} strokeWidth={2} />
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <div className="feature-glow" style={{ background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)` }}></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
