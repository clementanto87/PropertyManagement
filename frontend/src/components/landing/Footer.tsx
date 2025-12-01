import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import './Footer.css';

const footerLinks = {
    product: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Security', href: '#security' },
        { name: 'Integrations', href: '#integrations' },
    ],
    company: [
        { name: 'About Us', href: '#about' },
        { name: 'Careers', href: '#careers' },
        { name: 'Blog', href: '#blog' },
        { name: 'Press', href: '#press' },
    ],
    resources: [
        { name: 'Documentation', href: '#docs' },
        { name: 'Help Center', href: '#help' },
        { name: 'Community', href: '#community' },
        { name: 'Contact', href: '#contact' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
        { name: 'Cookie Policy', href: '#cookies' },
        { name: 'GDPR', href: '#gdpr' },
    ],
};

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3 className="brand-name">PropertyPro</h3>
                        <p className="brand-tagline">
                            Modern property management made simple
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="social-link">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="social-link">
                                <Github size={20} />
                            </a>
                            <a href="#" className="social-link">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="links-title">Product</h4>
                        <ul className="links-list">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href}>{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="links-title">Company</h4>
                        <ul className="links-list">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href}>{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="links-title">Resources</h4>
                        <ul className="links-list">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href}>{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4 className="links-title">Legal</h4>
                        <ul className="links-list">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href}>{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="copyright">
                        © 2025 PropertyPro. All rights reserved.
                    </p>
                    <div className="footer-badges">
                        <span className="badge">🔒 SOC 2 Certified</span>
                        <span className="badge">✓ GDPR Compliant</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
