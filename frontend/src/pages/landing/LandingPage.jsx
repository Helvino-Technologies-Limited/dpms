import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Calendar, FileText, CreditCard, Package, Shield,
  CheckCircle2, ArrowRight, Phone, Mail, Globe, Star,
  Users, TrendingUp, Clock, Zap, ChevronDown, Menu, X,
  Stethoscope, Activity, Award, Building2
} from 'lucide-react';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80',
  'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1200&q=80',
];

const FEATURE_IMAGES = {
  appointments: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
  patients: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80',
  billing: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
  dental: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80',
};

const TESTIMONIALS = [
  {
    name: 'Dr. Sarah Kamau',
    role: 'Orthodontist, Nairobi',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=80',
    text: 'DPMS transformed how I run my clinic. Patient management is seamless and the dental charting is incredibly accurate.',
    rating: 5,
  },
  {
    name: 'Dr. James Mwangi',
    role: 'Dental Surgeon, Mombasa',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&q=80',
    text: 'The insurance claims module alone saved us hours every week. Outstanding support from the Helvino team.',
    rating: 5,
  },
  {
    name: 'Dr. Amina Hassan',
    role: 'Pediatric Dentist, Kisumu',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&q=80',
    text: 'Multi-branch management is a game changer. I can see all clinic metrics from one dashboard in real-time.',
    rating: 5,
  },
];

const FEATURES = [
  { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered appointment scheduling with automated SMS reminders and waiting list management.', color: 'text-blue-600 bg-blue-50' },
  { icon: FileText, title: 'Digital Dental Charts', desc: 'Interactive tooth-by-tooth charting with condition tracking, treatment history and clinical notes.', color: 'text-teal-600 bg-teal-50' },
  { icon: CreditCard, title: 'Billing & POS', desc: 'Automated invoicing, split payments, cash/card/mobile money, receipts and refund management.', color: 'text-green-600 bg-green-50' },
  { icon: Shield, title: 'Insurance Claims', desc: 'Submit, track and manage insurance claims with co-payment handling and rejection resolution.', color: 'text-purple-600 bg-purple-50' },
  { icon: Package, title: 'Inventory Control', desc: 'Real-time stock tracking with expiry alerts, batch numbers, reorder reminders and supplier management.', color: 'text-orange-600 bg-orange-50' },
  { icon: TrendingUp, title: 'Advanced Analytics', desc: 'Revenue reports, patient stats, dentist performance, treatment trends and financial insights.', color: 'text-red-600 bg-red-50' },
  { icon: Users, title: 'Multi-Branch Support', desc: 'Manage unlimited branches from one platform with centralised reporting and staff allocation.', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Stethoscope, title: 'Treatment Planning', desc: 'Create detailed multi-phase treatment plans with cost estimates, progress tracking and prescriptions.', color: 'text-pink-600 bg-pink-50' },
];

const STATS = [
  { value: '500+', label: 'Dental Clinics', icon: Building2 },
  { value: '50K+', label: 'Patients Managed', icon: Users },
  { value: '99.9%', label: 'Uptime SLA', icon: Activity },
  { value: '4.9/5', label: 'Average Rating', icon: Star },
];

const PRICING = [
  {
    name: 'Starter',
    price: '2,999',
    period: '/month',
    description: 'Perfect for single-dentist practices',
    features: ['1 Branch', 'Up to 500 Patients', 'Appointment Scheduling', 'Basic Billing', 'Dental Charting', 'Email Support'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '6,999',
    period: '/month',
    description: 'For growing dental practices',
    features: ['3 Branches', 'Unlimited Patients', 'All Core Features', 'Insurance Management', 'Inventory Control', 'Priority Support', 'SMS Reminders'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large dental chains',
    features: ['Unlimited Branches', 'Custom Integrations', 'Dedicated Account Manager', 'Staff Training', 'SLA Guarantee', 'API Access', 'Advanced Analytics'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function LandingPage() {
  const [currentHero, setCurrentHero] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentHero(h => (h + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg leading-none">DPMS</span>
                <span className="hidden sm:block text-xs text-gray-400">by Helvino</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'Testimonials', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                Sign In
              </Link>
              <Link to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm">
                Free Trial
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-500 md:hidden">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 bg-white">
              {['Features', 'Pricing', 'Testimonials', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-primary-600"
                  onClick={() => setMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="px-4 pt-2 flex gap-3">
                <Link to="/login" className="flex-1 text-center py-2 text-sm border border-gray-200 rounded-xl">Sign In</Link>
                <Link to="/register" className="flex-1 text-center py-2 text-sm bg-primary-600 text-white rounded-xl">Free Trial</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {HERO_IMAGES.map((img, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentHero ? 'opacity-100' : 'opacity-0'}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">5-Day Free Trial — No Credit Card Required</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Modern Dental<br />
              <span className="text-primary-400">Practice Management</span><br />
              Made Simple
            </h1>

            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              The complete cloud-based DPMS trusted by 500+ dental clinics across Africa.
              Manage patients, appointments, billing, insurance and more — all in one beautiful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl text-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium px-8 py-4 rounded-2xl transition-all text-lg">
                See Features
                <ChevronDown className="w-5 h-5" />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {['No setup fees', 'Cancel anytime', 'HIPAA compliant', 'Free onboarding'].map(item => (
                <div key={item} className="flex items-center gap-2 text-white/70 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-2xl animate-float w-56">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Today's Schedule</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">24</p>
            <p className="text-xs text-gray-400">appointments booked</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-2xl animate-float w-56" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Revenue Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">KES 48K</p>
            <p className="text-xs text-green-500">↑ 12% vs yesterday</p>
          </div>
        </div>

        {/* Hero dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setCurrentHero(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentHero ? 'bg-white w-6' : 'bg-white/40'}`} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center animate-on-scroll">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-2xl mb-3">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-primary-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider">Everything You Need</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              A Complete Dental Practice<br />Management Platform
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              From patient registration to insurance claims, every workflow is streamlined for modern dental practices.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-on-scroll">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {[
            {
              title: 'Beautiful Digital Dental Charts',
              description: 'Interactive tooth-by-tooth charting system using universal numbering. Mark conditions, record treatments, attach X-rays and clinical notes per tooth.',
              image: FEATURE_IMAGES.dental,
              features: ['Universal tooth numbering system', 'Condition tracking per tooth', 'Treatment history per surface', 'Attach X-ray images'],
              reverse: false,
            },
            {
              title: 'Seamless Appointment Management',
              description: 'Comprehensive scheduling with dentist availability, online booking, automated SMS reminders, and intelligent waiting list management.',
              image: FEATURE_IMAGES.appointments,
              features: ['Visual calendar scheduler', 'Automated SMS/email reminders', 'No-show tracking', 'Multi-dentist scheduling'],
              reverse: true,
            },
            {
              title: 'Powerful Billing & POS',
              description: 'Generate professional invoices automatically, accept multiple payment methods, handle insurance claims and track all financial activity.',
              image: FEATURE_IMAGES.billing,
              features: ['Instant invoice generation', 'Cash, card, mobile money', 'Split payment support', 'Insurance billing integration'],
              reverse: false,
            },
          ].map(({ title, description, image, features, reverse }) => (
            <div key={title} className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center mb-24 last:mb-0 animate-on-scroll`}>
              <div className="flex-1">
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">{title}</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">{description}</p>
                <ul className="space-y-3">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-gray-700">
                      <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-primary-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className="inline-flex items-center gap-2 mt-8 text-primary-600 font-semibold hover:gap-3 transition-all">
                  Get started free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary-100 rounded-3xl" />
                  <img src={image} alt={title}
                    className="relative rounded-2xl shadow-2xl w-full object-cover aspect-video" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              Loved by Dental Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, image, text, rating }) => (
              <div key={name}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-on-scroll">
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{name}</p>
                    <p className="text-sm text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider">Pricing</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-500">All plans include a 5-day free trial. No credit card required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING.map(({ name, price, period, description, features, cta, highlighted }) => (
              <div key={name}
                className={`rounded-2xl p-8 border animate-on-scroll ${highlighted
                  ? 'bg-primary-600 border-primary-600 text-white shadow-2xl scale-105'
                  : 'bg-white border-gray-100 shadow-sm'}`}>
                {highlighted && (
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${highlighted ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                <p className={`text-sm mb-4 ${highlighted ? 'text-primary-200' : 'text-gray-400'}`}>{description}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {price === 'Custom' ? '' : 'KES '}
                  </span>
                  <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>{price}</span>
                  <span className={`text-sm ${highlighted ? 'text-primary-200' : 'text-gray-400'}`}>{period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${highlighted ? 'text-primary-100' : 'text-gray-600'}`}>
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-white' : 'text-primary-600'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${highlighted
                    ? 'bg-white text-primary-600 hover:bg-primary-50'
                    : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-primary-700 via-primary-600 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Dental Practice?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join 500+ dental clinics already using DPMS. Start your 5-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl hover:bg-primary-50 transition-colors shadow-lg text-lg">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="tel:0703445756"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-medium px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-lg">
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Phone, label: 'Phone', value: '0703445756', href: 'tel:0703445756' },
              { icon: Mail, label: 'Email', value: 'helvinotechltd@gmail.com', href: 'mailto:helvinotechltd@gmail.com' },
              { icon: Globe, label: 'Website', value: 'helvino.org', href: 'https://helvino.org' },
            ].map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">DPMS</p>
                <p className="text-xs">Developed by Helvino Technologies Limited</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="mailto:helvinotechltd@gmail.com" className="hover:text-white transition-colors">helvinotechltd@gmail.com</a>
              <a href="https://helvino.org" className="hover:text-white transition-colors">helvino.org</a>
              <a href="tel:0703445756" className="hover:text-white transition-colors">0703445756</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © {new Date().getFullYear()} Helvino Technologies Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
