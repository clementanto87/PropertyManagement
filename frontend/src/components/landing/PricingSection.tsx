import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, ArrowRight } from 'lucide-react';
import './PricingSection.css';

const plans = [
    {
        name: 'Starter',
        price: '49',
        description: 'Perfect for small property owners',
        features: [
            'Up to 10 properties',
            'Online rent payments',
            'Basic maintenance tracking',
            'Email support',
            'Mobile app access',
        ],
        popular: false,
    },
    {
        name: 'Professional',
        price: '149',
        description: 'For growing property portfolios',
        features: [
            'Up to 100 properties',
            'Advanced financial reports',
            'Automated rent reminders',
            'Priority support',
            'Custom branding',
            'API access',
        ],
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'For large-scale operations',
        features: [
            'Unlimited properties',
            'Dedicated account manager',
            'Custom integrations',
            '24/7 phone support',
            'Advanced analytics',
            'White-label solution',
        ],
        popular: false,
    },
];

export function PricingSection() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section className="pricing-section" ref={ref}>
            <div className="pricing-container">
                <motion.div
                    className="pricing-header"
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="pricing-title">
                        Simple, transparent <span className="gradient-text">pricing</span>
                    </h2>
                    <p className="pricing-subtitle">
                        Choose the perfect plan for your property management needs
                    </p>
                </motion.div>

                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            {plan.popular && <div className="popular-badge">Most Popular</div>}

                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                {plan.price !== 'Custom' && <span className="currency">$</span>}
                                <span className="amount">{plan.price}</span>
                                {plan.price !== 'Custom' && <span className="period">/month</span>}
                            </div>
                            <p className="plan-description">{plan.description}</p>

                            <ul className="plan-features">
                                {plan.features.map((feature) => (
                                    <li key={feature}>
                                        <Check size={20} className="check-icon" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`plan-button ${plan.popular ? 'primary' : 'secondary'}`}>
                                <span>Get Started</span>
                                <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
