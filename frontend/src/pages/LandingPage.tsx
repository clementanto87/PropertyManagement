import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Star,
  Building2,
  DollarSign,
  Clock,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  FileText,
  Calendar,
  Bell,
  Sparkles,
  Rocket,
  Award,
  Globe,
  Lock,
  Play,
  Menu,
  X,
  Sparkle,
  Target,
  Layers,
  BarChart,
  Activity
} from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const features = [
  {
    icon: <Home className="w-8 h-8" />,
    title: 'Smart Property Management',
    description: 'AI-powered insights and automation to manage all your properties effortlessly from one unified dashboard.',
    color: 'from-blue-500 via-cyan-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    gradient: 'from-blue-600 to-cyan-600'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Tenant Relationship Hub',
    description: 'Streamline tenant applications, lease management, and communications with our intelligent CRM system.',
    color: 'from-indigo-500 via-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    gradient: 'from-indigo-600 to-purple-600'
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: 'Automated Rent Collection',
    description: 'Set up recurring payments, track income, and get real-time financial insights with automated reporting.',
    color: 'from-green-500 via-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    gradient: 'from-green-600 to-emerald-600'
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: 'Enterprise-Grade Security',
    description: 'Bank-level encryption, SOC 2 compliance, and regular security audits to protect your sensitive data.',
    color: 'from-purple-500 via-pink-500 to-rose-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    gradient: 'from-purple-600 to-pink-600'
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Native Mobile Apps',
    description: 'Full-featured iOS and Android apps with offline mode, push notifications, and seamless sync.',
    color: 'from-orange-500 via-red-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    gradient: 'from-orange-600 to-red-600'
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: 'Advanced Analytics',
    description: 'Real-time dashboards, predictive analytics, and custom reports to make data-driven decisions.',
    color: 'from-teal-500 via-cyan-500 to-blue-500',
    bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    gradient: 'from-teal-600 to-cyan-600'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Property Manager',
    company: 'Premier Properties',
    content: 'This platform has completely transformed how we manage our 200+ property portfolio. The automation features save us 20+ hours every week, and our tenant satisfaction has increased by 40%.',
    rating: 5,
    avatar: 'SJ',
    image: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  },
  {
    name: 'Michael Chen',
    role: 'Real Estate Investor',
    company: 'Chen Capital Group',
    content: 'The analytics dashboard is a game-changer. I can see ROI, occupancy rates, and maintenance costs in real-time. This is the best property management solution I\'ve ever used.',
    rating: 5,
    avatar: 'MC',
    image: 'bg-gradient-to-br from-indigo-500 to-purple-500'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Landlord',
    company: 'Independent Owner',
    content: 'As someone managing properties part-time, the intuitive interface and excellent customer support have been invaluable. I highly recommend this to any property owner.',
    rating: 5,
    avatar: 'ER',
    image: 'bg-gradient-to-br from-pink-500 to-rose-500'
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for individual landlords',
    features: [
      'Up to 5 properties',
      'Basic reporting & analytics',
      'Email support',
      'Mobile app access',
      'Automated rent collection',
      'Document storage (5GB)'
    ],
    cta: 'Start Free Trial',
    popular: false,
    gradient: 'from-gray-100 to-gray-50',
    icon: <Home className="w-6 h-6" />
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'Ideal for growing portfolios',
    features: [
      'Up to 50 properties',
      'Advanced analytics & AI insights',
      'Priority support (24/7)',
      'Maintenance tracking & automation',
      'Unlimited document storage',
      'API access & integrations',
      'Custom reporting',
      'Team collaboration tools'
    ],
    cta: 'Start Free Trial',
    popular: true,
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    icon: <Rocket className="w-6 h-6" />
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large property management companies',
    features: [
      'Unlimited properties',
      'Custom analytics & dashboards',
      'Dedicated account manager',
      'White-label solution',
      'Onboarding & training',
      'Custom integrations',
      'SLA guarantees',
      'Advanced security features'
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-gray-100 to-gray-50',
    icon: <Building2 className="w-6 h-6" />
  }
];

const stats = [
  { value: '10K+', label: 'Active Properties', icon: <Home className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
  { value: '50K+', label: 'Happy Customers', icon: <Users className="w-6 h-6" />, color: 'from-indigo-500 to-purple-500' },
  { value: '99.9%', label: 'Uptime SLA', icon: <Activity className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
  { value: '24/7', label: 'Support', icon: <Bell className="w-6 h-6" />, color: 'from-orange-500 to-red-500' }
];

const benefits = [
  { icon: <Zap className="w-6 h-6" />, text: 'Save 20+ hours per week' },
  { icon: <TrendingUp className="w-6 h-6" />, text: 'Increase revenue by 30%' },
  { icon: <Award className="w-6 h-6" />, text: '99% tenant satisfaction' },
  { icon: <Lock className="w-6 h-6" />, text: 'Bank-level security' }
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresRef, featuresVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();
  const [pricingRef, pricingVisible] = useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Trigger hero animation
    setTimeout(() => setHeroVisible(true), 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setEmail('');
  };

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'You get full access to all Professional plan features for 14 days. No credit card required to start. You can cancel anytime during the trial period with no charges.'
    },
    {
      question: 'Can I switch plans later?',
      answer: 'Yes, absolutely! You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and we\'ll prorate any charges.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level AES-256 encryption, are SOC 2 Type II certified, and undergo regular security audits. Your data is stored in secure, redundant data centers with 99.9% uptime SLA.'
    },
    {
      question: 'Do you offer support?',
      answer: 'Yes! We offer 24/7 email support for all plans. Professional and Enterprise plans include priority support with faster response times, phone support, and dedicated account managers.'
    },
    {
      question: 'Can I integrate with other tools?',
      answer: 'Yes! We offer API access and integrations with popular tools like QuickBooks, Stripe, Zillow, and more. Enterprise plans include custom integrations tailored to your needs.'
    }
  ];

  return (
    <div className="bg-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-float"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        ></div>
        <div 
          className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-float-delayed"
          style={{
            transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`
          }}
        ></div>
        <div 
          className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-pink-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-float"
          style={{
            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`
          }}
        ></div>
      </div>

      {/* Navigation */}
      <header 
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrollY > 50 
            ? 'bg-white/80 backdrop-blur-xl shadow-xl border-b border-gray-100/50' 
            : 'bg-white/60 backdrop-blur-md shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PropertyPro
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {['Features', 'How It Works', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`} 
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-lg hover:bg-blue-50/50 group"
                >
                  {item}
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:w-3/4"></span>
                </a>
              ))}
            </nav>
            
            <div className="hidden lg:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="relative group px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div 
          className={`lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            {['Features', 'How It Works', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link 
                  to="/signup" 
                className="block w-full text-center py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              <Link 
                to="/login" 
                className="block w-full text-center py-3 px-4 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
                  </Link>
              </div>
            </div>
          </div>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-52 lg:pb-40 overflow-hidden"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-gradient"></div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center transition-all duration-1000 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Badge */}
            <div className="inline-block mb-6 animate-fade-in">
              <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50 shadow-lg backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                New: AI-Powered Property Insights
                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Beta</span>
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight font-extrabold mb-8 leading-tight">
              <span className="block text-gray-900 mb-2">Modern Property</span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Management Made
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Effortlessly Simple
              </span>
            </h1>

            <p className="mt-8 max-w-4xl mx-auto text-xl sm:text-2xl lg:text-3xl text-gray-600 leading-relaxed font-light">
              Streamline your property management with our all-in-one platform. 
              <span className="font-semibold text-gray-900"> Save 20+ hours per week</span>, reduce stress, and 
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> grow your real estate business</span> effortlessly.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/signup" 
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 w-full sm:w-auto"
                >
                <span className="relative z-10 flex items-center">
                  Start Free 14-Day Trial
                  <ArrowRight className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <a 
                  href="#how-it-works" 
                className="group inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-gray-900 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:shadow-xl hover:scale-105 w-full sm:w-auto"
                >
                <Play className="mr-3 w-5 h-5" />
                Watch Demo
                <ChevronDown className="ml-3 w-5 h-5 animate-bounce" />
                </a>
              </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-7 h-7 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${star * 100}ms` }} />
                ))}
                <span className="ml-4 text-xl font-bold text-gray-900">4.9/5</span>
                <span className="ml-2 text-lg text-gray-600">(2,500+ reviews)</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Award className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">Trusted by</span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">10,000+</span>
                <span className="text-lg text-gray-600">property managers</span>
            </div>
          </div>

            {/* Quick Benefits */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <div className="text-blue-600">{benefit.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
              </div>
              ))}
            </div>
              </div>

          {/* Enhanced Stats Section */}
          <div className={`mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-300 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="group relative p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100/50 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
            </div>
                  <div className={`text-4xl md:text-5xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
              </div>
                  <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
            </div>
              </div>
            ))}
            </div>
              </div>
      </section>

      {/* Logo Cloud - Enhanced */}
      <div className="relative bg-gradient-to-b from-white via-gray-50 to-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-center text-sm font-bold uppercase text-gray-500 tracking-widest mb-12">
            Trusted by industry leaders worldwide
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:grid-cols-5">
            {['RealEstate Pro', 'RentEase', 'HomeHarbor', 'PropertyPlus', 'LandlordPro'].map((logo, index) => (
              <div 
                key={index}
                className="col-span-1 flex justify-center items-center h-20 opacity-40 hover:opacity-100 transition-all duration-300 hover:scale-110 group"
              >
                <div className="px-6 py-3 bg-white rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
                  <span className="text-lg font-bold text-gray-900">{logo}</span>
            </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced */}
      <section 
        id="features" 
        ref={featuresRef}
        className="py-24 sm:py-32 lg:py-40 bg-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-20 transition-all duration-1000 ${
            featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Sparkle className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="mt-6 max-w-3xl text-xl lg:text-2xl text-gray-600 mx-auto leading-relaxed">
              Our platform provides all the tools you need to manage your properties efficiently, 
              automate workflows, and grow your real estate business.
            </p>
          </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                  featuresVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
                
                <div className={`relative h-full p-8 rounded-3xl ${feature.bgColor} border border-gray-100 shadow-xl group-hover:shadow-2xl transition-all duration-500`}>
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        {feature.icon}
                      </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                  <div className="mt-6 flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section id="how-it-works" className="relative py-24 sm:py-32 lg:py-40 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              Getting Started
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="mt-6 max-w-3xl text-xl lg:text-2xl text-gray-600 mx-auto leading-relaxed">
              Get started in minutes and transform how you manage your properties. 
              No technical knowledge required.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { 
                step: '1', 
                title: 'Create Your Account', 
                desc: 'Sign up for free and set up your account in just a few minutes. No credit card required. Get instant access to all features.', 
                icon: <Users className="w-10 h-10" />,
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                step: '2', 
                title: 'Add Your Properties', 
                desc: 'Import your property portfolio or add properties manually with our intuitive interface. Bulk import supported via CSV.', 
                icon: <Home className="w-10 h-10" />,
                color: 'from-indigo-500 to-purple-500'
              },
              { 
                step: '3', 
                title: 'Start Managing', 
                desc: 'Access all features, automate tasks, and manage your properties from anywhere, anytime. Mobile apps included.', 
                icon: <Zap className="w-10 h-10" />,
                color: 'from-purple-500 to-pink-500'
              }
            ].map((item, index) => (
              <div
                key={index}
                className="relative group"
              >
                {/* Animated Border */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse`}></div>
                
                <div className="relative bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 h-full">
                  {/* Step Number */}
                  <div className={`flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${item.color} text-white text-4xl font-bold mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {item.step}
              </div>

                  {/* Icon */}
                  <div className={`flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} bg-opacity-10 text-gray-900 mb-8 mx-auto group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
              </div>

                  <h3 className="text-3xl font-bold text-gray-900 mb-6">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{item.desc}</p>
                  
                  {/* Decorative Element */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className={`w-12 h-1 bg-gradient-to-r ${item.color} rounded-full`}></div>
                </div>
                </div>
              </div>
            ))}
            </div>

          <div className="mt-20 text-center">
              <Link 
                to="/signup" 
              className="group inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
              Get Started Now
              <ArrowRight className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced */}
      <section 
        id="testimonials" 
        ref={testimonialsRef}
        className="py-24 sm:py-32 lg:py-40 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-20 transition-all duration-1000 ${
            testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Customer Stories
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
              Loved by{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Property Managers
              </span>
            </h2>
            <p className="mt-6 max-w-3xl text-xl lg:text-2xl text-gray-600 mx-auto leading-relaxed">
              Don't just take our word for it. Here's what our customers have to say about their experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`group relative p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100 overflow-hidden ${
                  testimonialsVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -mr-20 -mt-20 opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -ml-16 -mb-16 opacity-30"></div>
                
                <div className="relative z-10">
                  {/* Avatar & Info */}
                  <div className="flex items-center mb-6">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${testimonial.image} flex items-center justify-center text-white text-xl font-bold shadow-xl`}>
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-xl font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm font-semibold text-blue-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-gray-700 leading-relaxed text-lg italic relative">
                    <span className="absolute -top-2 -left-2 text-6xl text-blue-100 font-serif leading-none">"</span>
                    <span className="relative z-10">{testimonial.content}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Enhanced */}
      <section 
        id="pricing" 
        ref={pricingRef}
        className="relative py-24 sm:py-32 lg:py-40 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.1),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-20 transition-all duration-1000 ${
            pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-6">
              <DollarSign className="w-4 h-4 mr-2" />
              Transparent Pricing
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
              Simple,{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Transparent
              </span>
              {' '}Pricing
            </h2>
            <p className="mt-6 max-w-3xl text-xl lg:text-2xl text-gray-600 mx-auto leading-relaxed">
              Choose the perfect plan for your business needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative group transition-all duration-500 ${
                  pricingVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
                    <span className="inline-flex items-center px-5 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className={`relative h-full p-10 rounded-3xl transition-all duration-500 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl scale-105 border-4 border-white/20'
                    : 'bg-white text-gray-900 shadow-xl hover:shadow-2xl border-2 border-gray-100'
                } hover:scale-105`}>
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                    plan.popular 
                      ? 'bg-white/20 backdrop-blur-sm text-white' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                  } shadow-lg`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className={`text-3xl font-bold mb-3 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  
                  <div className="mt-6 mb-4">
                    <span className={`text-6xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xl font-medium ml-2 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                      {plan.period}
                    </span>
                  </div>
                  
                  <p className={`text-base mb-8 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                        <CheckCircle2 className={`h-6 w-6 flex-shrink-0 mr-3 mt-0.5 ${
                          plan.popular ? 'text-blue-200' : 'text-green-500'
                        }`} />
                        <span className={`text-base ${plan.popular ? 'text-blue-50' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                    </li>
                  ))}
                </ul>
                  
                  <Link
                    to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`block w-full py-4 px-6 text-center rounded-xl text-lg font-bold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:scale-105'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-xl text-gray-600 mb-4">
              Need a custom solution?
            </p>
            <a href="#contact" className="inline-flex items-center font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 text-lg">
                Contact our sales team
              <ArrowRight className="ml-2 w-5 h-5" />
              </a>
          </div>
        </div>
      </section>

      {/* FAQ - Enhanced */}
      <section id="faq" className="py-24 sm:py-32 lg:py-40 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold mb-6">
              <Sparkle className="w-4 h-4 mr-2" />
              Got Questions?
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="mt-6 text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Everything you need to know about our property management platform.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group border-2 border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300"
              >
                <button
                  className="w-full px-8 py-6 text-left focus:outline-none flex items-center justify-between group-hover:bg-blue-50/50 transition-colors duration-300"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 pr-8">
                    {faq.question}
                  </span>
                    <ChevronDown 
                    className={`h-6 w-6 text-gray-500 transition-all duration-300 flex-shrink-0 ${
                      activeFaq === index ? 'rotate-180 text-blue-600' : ''
                    }`} 
                    />
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${
                  activeFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed text-lg">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center p-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Still have questions?</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
              <a 
                href="mailto:support@propertypro.com" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Contact Support
              <ArrowRight className="ml-2 h-5 w-5" />
              </a>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Animated Shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              Ready to Get Started?
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
              <span className="block">Start Your Free</span>
              <span className="block text-blue-200">14-Day Trial Today</span>
            </h2>
            <p className="mt-6 text-xl lg:text-2xl leading-8 text-blue-100">
              No credit card required. Cancel anytime. Full access to all features.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-blue-600 bg-white rounded-2xl shadow-2xl hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                <Play className="mr-3 w-5 h-5" />
                Watch Demo
              </a>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span className="font-semibold">Bank-level Security</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">No Credit Card Required</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="font-semibold">14-Day Free Trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="xl:grid xl:grid-cols-3 xl:gap-12">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                  <Building2 className="h-6 w-6 text-white" />
              </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  PropertyPro
                </span>
              </div>
              <p className="text-gray-300 text-base leading-relaxed max-w-sm">
                Modern property management software for landlords and property managers.
                Streamline operations, automate workflows, and grow your business.
              </p>
              <div className="flex space-x-6">
                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-all duration-300 hover:scale-110 cursor-pointer"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                ))}
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-12 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-12">
                <div>
                  <h3 className="text-sm font-bold text-gray-300 tracking-wider uppercase mb-6">Solutions</h3>
                  <ul className="space-y-4">
                    {['For Landlords', 'For Property Managers', 'For Real Estate Agents', 'For Real Estate Investors'].map((item) => (
                      <li key={item}>
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()}
                          className="text-base text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-bold text-gray-300 tracking-wider uppercase mb-6">Support</h3>
                  <ul className="space-y-4">
                    {['Help Center', 'Documentation', 'API Status', 'Contact Support'].map((item) => (
                      <li key={item}>
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()}
                          className="text-base text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-12">
                <div>
                  <h3 className="text-sm font-bold text-gray-300 tracking-wider uppercase mb-6">Company</h3>
                  <ul className="space-y-4">
                    {['About Us', 'Blog', 'Careers', 'Press Kit'].map((item) => (
                      <li key={item}>
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()}
                          className="text-base text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-bold text-gray-300 tracking-wider uppercase mb-6">Legal</h3>
                  <ul className="space-y-4">
                    {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map((item) => (
                      <li key={item}>
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()}
                          className="text-base text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-base text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} PropertyPro. All rights reserved.
            </p>
              <div className="mt-4 md:mt-0 flex items-center space-x-6 text-sm text-gray-400">
                <span>Made with ❤️ for property managers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
