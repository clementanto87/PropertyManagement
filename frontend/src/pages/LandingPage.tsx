import { useState } from 'react';
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
  MapPin
} from 'lucide-react';

const features = [
  {
    icon: <Home className="w-8 h-8 text-blue-600" />,
    title: 'Property Management',
    description: 'Effortlessly manage all your properties from a single dashboard.'
  },
  {
    icon: <Users className="w-8 h-8 text-indigo-600" />,
    title: 'Tenant Management',
    description: 'Handle tenant applications, leases, and communications in one place.'
  },
  {
    icon: <DollarSign className="w-8 h-8 text-green-600" />,
    title: 'Rent Collection',
    description: 'Automate rent collection and track payments with ease.'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-purple-600" />,
    title: 'Secure & Reliable',
    description: 'Bank-level security to keep your data safe and protected.'
  },
  {
    icon: <Smartphone className="w-8 h-8 text-orange-600" />,
    title: 'Mobile Friendly',
    description: 'Manage your properties on the go with our mobile-responsive design.'
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-teal-600" />,
    title: 'Analytics & Reports',
    description: 'Get detailed insights and reports on your property performance.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Property Manager',
    content: 'This platform has transformed how we manage our properties. The automation features save us hours every week!',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Real Estate Investor',
    content: 'The best property management solution I\'ve used. The analytics dashboard is a game-changer.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Landlord',
    content: 'Intuitive interface and excellent customer support. Highly recommended for any property owner.',
    rating: 4
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
      'Basic reporting',
      'Email support',
      'Mobile app access',
      'Rent collection'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'Ideal for growing portfolios',
    features: [
      'Up to 50 properties',
      'Advanced reporting',
      'Priority support',
      'Maintenance tracking',
      'Document storage',
      'API access'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large property management companies',
    features: [
      'Unlimited properties',
      'Custom reporting',
      '24/7 dedicated support',
      'White-label solution',
      'Onboarding & training',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Email submitted:', email);
    // Reset form
    setEmail('');
  };

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'You get full access to all Professional plan features for 14 days. No credit card required to start.'
    },
    {
      question: 'Can I switch plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and regular security audits to protect your data.'
    },
    {
      question: 'Do you offer support?',
      answer: 'Yes, we offer 24/7 email support for all plans, with priority support for Professional and Enterprise plans.'
    }
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <header className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PropertyPro</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Testimonials</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">FAQ</a>
            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Sign In</Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Get Started Free
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">How It Works</a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Pricing</a>
              <a href="#testimonials" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Testimonials</a>
              <a href="#faq" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">FAQ</a>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <Link 
                  to="/signup" 
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Get Started Free
                </Link>
                <p className="mt-3 text-center text-sm font-medium text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Modern Property Management</span>
              <span className="block text-blue-600">Made Simple</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Streamline your property management with our all-in-one platform. Save time, reduce stress, and grow your real estate business effortlessly.
            </p>
            <div className="mt-10 sm:flex sm:justify-center">
              <div className="rounded-md shadow">
                <Link 
                  to="/signup" 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Start Free 14-Day Trial
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a 
                  href="#how-it-works" 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  See How It Works
                </a>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-600">Rated 4.9/5 by 1000+ property managers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase text-gray-500 tracking-wide">
            Trusted by property managers worldwide
          </p>
          <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
            <div className="col-span-1 flex justify-center">
              <div className="h-12 flex items-center">
                <span className="text-xl font-bold text-gray-900">RealEstate Pro</span>
              </div>
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="h-12 flex items-center">
                <span className="text-xl font-bold text-gray-900">RentEase</span>
              </div>
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="h-12 flex items-center">
                <span className="text-xl font-bold text-gray-900">HomeHarbor</span>
              </div>
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="h-12 flex items-center">
                <span className="text-xl font-bold text-gray-900">PropertyPlus</span>
              </div>
            </div>
            <div className="col-span-2 flex justify-center md:col-span-1">
              <div className="h-12 flex items-center">
                <span className="text-xl font-bold text-gray-900">LandlordPro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need to Manage Properties
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our platform provides all the tools you need to manage your properties efficiently and effectively.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white shadow-md text-white">
                        {feature.icon}
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900">{feature.title}</h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Get started in minutes and transform how you manage your properties
            </p>
          </div>

          <div className="mt-16">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="mb-10 lg:mb-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-medium text-gray-900">Create an Account</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Sign up for free and set up your account in just a few minutes. No credit card required.
                  </p>
                </div>
              </div>

              <div className="mb-10 lg:mb-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-medium text-gray-900">Add Your Properties</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Import your property portfolio or add properties manually with our easy-to-use interface.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-medium text-gray-900">Start Managing</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Access all features, automate tasks, and manage your properties from anywhere, anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link 
                to="/signup" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started Now <ArrowRight className="ml-3 -mr-1 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-white sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Loved by Property Managers
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Don't just take our word for it. Here's what our customers have to say.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} flex-shrink-0`}
                        fill={i < testimonial.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-gray-600">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-gray-50 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Choose the perfect plan for your business needs
            </p>
          </div>

          <div className="mt-16 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-8 bg-white rounded-2xl shadow-sm border-2 ${plan.popular ? 'border-blue-500' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 -mt-3 -mr-3">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-lg font-medium text-gray-500">{plan.period}</span>
                </p>
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="ml-3 text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`block w-full py-3 px-4 text-center rounded-md text-base font-medium ${
                      plan.popular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-base text-gray-500">
              Need a custom solution?{' '}
              <a href="#contact" className="font-medium text-blue-600 hover:text-blue-500">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white sm:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Everything you need to know about our property management platform.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-5 text-left focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-500 transform transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">Still have questions?</h3>
            <p className="mt-2 text-base text-gray-500">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="mt-6">
              <a 
                href="mailto:support@propertypro.com" 
                className="inline-flex items-center text-blue-600 hover:text-blue-500"
              >
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-blue-200">Start your free 14-day trial today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-100">
              No credit card required. Cancel anytime.
            </p>
          </div>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 bg-opacity-60 hover:bg-opacity-70"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">PropertyPro</span>
              </div>
              <p className="text-gray-300 text-base">
                Modern property management software for landlords and property managers.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Solutions</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">For Landlords</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">For Property Managers</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">For Real Estate Agents</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">For Real Estate Investors</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Help Center</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Guides</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">API Status</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Contact Support</a></li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">About</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Blog</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Careers</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Press</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Cookie Policy</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">GDPR</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; {new Date().getFullYear()} PropertyPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
