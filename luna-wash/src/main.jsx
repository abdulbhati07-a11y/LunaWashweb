import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import '../css/themes.css';
import '../css/styles.css';
import '../css/animations.css';
import '../css/responsive.css';
import '../css/theme-switcher.css';
import './styles/react-app.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const THEME_STORAGE_KEY = 'luna-wash-theme';

const themes = [
  { id: 'dark', name: 'Default', color: '#FF6B35', type: 'dark' },
  { id: 'light', name: 'Light', color: '#FF6B35', type: 'light' },
  { id: 'ocean', name: 'Ocean Blue', color: '#00D9FF', type: 'dark' },
  { id: 'forest', name: 'Forest Green', color: '#4ECB71', type: 'dark' },
  { id: 'sunset', name: 'Sunset', color: '#FF9F43', type: 'dark' },
  { id: 'purple', name: 'Purple', color: '#B366FF', type: 'dark' },
  { id: 'coolGray', name: 'Cool Gray', color: '#7DB8DA', type: 'dark' },
  { id: 'arctic', name: 'Arctic', color: '#00E5FF', type: 'dark' },
  { id: 'coral', name: 'Coral', color: '#FF7A5C', type: 'dark' },
  { id: 'mint', name: 'Mint', color: '#2FCCB8', type: 'dark' },
  { id: 'crimson', name: 'Crimson Red', color: '#FF3366', type: 'dark' },
  { id: 'rose', name: 'Rose Red', color: '#FF4D6D', type: 'light' },
  { id: 'sky', name: 'Sky Blue', color: '#4DA8DA', type: 'light' }
];

const SERVICE_ICONS = { express: '🧼', dry: '🧥', ironing: '👔', stain: '✨' };

const FALLBACK_SERVICES = [
  { code: 'express', icon: '🧼', title: 'Express Wash', text: 'Quick turnaround wash and fold service. Get your clothes cleaned and ready in 24 hours.' },
  { code: 'dry', icon: '🧥', title: 'Dry Cleaning', text: 'Professional dry cleaning for delicate fabrics. Expert care for your finest garments.' },
  { code: 'ironing', icon: '👔', title: 'Ironing Service', text: 'Expert ironing and pressing. Perfectly pressed clothes ready for any occasion.' },
  { code: 'stain', icon: '✨', title: 'Stain Removal', text: 'Advanced stain treatment. We handle tough stains with professional-grade solutions.' }
];

const FALLBACK_PLANS = [
  { name: 'Basic', monthly: '$29', annual: '$290', featured: false, features: ['1 pickup per week', 'Express wash service', 'Free folding', 'Dry cleaning not included'] },
  { name: 'Premium', monthly: '$59', annual: '$590', featured: true, features: ['2 pickups per week', 'Express wash service', 'Dry cleaning included', 'Ironing service'] },
  { name: 'Elite', monthly: '$99', annual: '$990', featured: false, features: ['Unlimited pickups', 'All services included', 'Priority processing', '24/7 support'] }
];

function mapApiService(row) {
  return {
    id: row.id || null,
    code: row.code,
    icon: row.icon || SERVICE_ICONS[row.code] || '🧺',
    title: row.name || row.title,
    text: row.description || row.text
  };
}

function mapApiPlan(row) {
  const monthly = row.monthly_price ?? row.monthly;
  const annual = row.annual_price ?? row.annual;
  return {
    id: row.id || null,
    name: row.name,
    monthly: typeof monthly === 'number' ? `$${monthly}` : monthly,
    annual: typeof annual === 'number' ? `$${annual}` : annual,
    featured: row.is_featured ?? row.featured ?? false,
    features: Array.isArray(row.features) ? row.features : []
  };
}

const testimonials = [
  ['Muhammad Abbas', 'Business Executive', 'LÜNA WASH has completely transformed my laundry routine. No more time wasted on washing and folding!'],
  ['Junaid Khan', 'Fashion Enthusiast', 'The quality of their dry cleaning is exceptional. My delicate fabrics have never looked better.'],
  ['Usman Farhan', 'Marketing Manager', 'Professional service, reasonable prices, and convenient scheduling. Highly recommended!'],
  ['Muhammad Awais', 'Photographer', 'The stain removal service is fantastic. They got out stains I thought were permanent!']
];

async function apiRequest(path, payload) {
  const token = sessionStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}

async function apiGet(path) {
  const token = sessionStorage.getItem('accessToken');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}

function formatService(value, serviceList = FALLBACK_SERVICES) {
  const match = serviceList.find((item) => item.code === value);
  if (match) return match.title;
  return value || 'Laundry Service';
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [annual, setAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(() => Boolean(sessionStorage.getItem('accessToken')));
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return themes.some((item) => item.id === stored) ? stored : 'dark';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const navItems = useMemo(() => [
    ['home', 'Home'],
    ['services', 'Services'],
    ['how-it-works', 'How It Works'],
    ['pricing', 'Pricing'],
    ['testimonials', 'Reviews'],
    ['contact', 'Book Now']
  ], []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }, [theme]);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      apiGet('/services').catch(() => ({ services: FALLBACK_SERVICES })),
      apiGet('/plans').catch(() => ({ plans: FALLBACK_PLANS }))
    ])
      .then(([servicesData, plansData]) => {
        if (ignore) return;
        if (servicesData.services?.length) {
          setServices(servicesData.services.map(mapApiService));
        }
        if (plansData.plans?.length) {
          setPlans(plansData.plans.map(mapApiPlan));
        }
      })
      .finally(() => {
        if (!ignore) setCatalogLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      setAuthChecking(false);
      return undefined;
    }

    let ignore = false;
    setAuthChecking(true);

    apiGet('/auth/me')
      .then((data) => {
        if (ignore || !data?.user) return;
        setCurrentUser(data.user);
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      })
      .catch(() => {
        if (ignore) return;
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('currentUser');
        setCurrentUser(null);
      })
      .finally(() => {
        if (!ignore) setAuthChecking(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (authChecking || !currentUser?.email) {
      if (!authChecking && !currentUser?.email) setBookings([]);
      return undefined;
    }

    let ignore = false;
    setBookingsLoading(true);

    apiGet(`/bookings?email=${encodeURIComponent(currentUser.email)}`)
      .then((data) => {
        if (!ignore) setBookings(data.bookings || []);
      })
      .catch((error) => {
        if (!ignore) notify(error.message, 'error');
      })
      .finally(() => {
        if (!ignore) setBookingsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [currentUser, authChecking]);

  function notify(message, type = 'success') {
    setToast({ message, type });
  }

  function scrollToSection(id) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function handlePlan(planName) {
    setSelectedPlan(planName);
    notify(`${planName} plan selected. Please fill in your details below.`);
    window.setTimeout(() => scrollToSection('contact'), 250);
  }

  function handleHeroPointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setHeroTilt({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
    });
  }

  async function handleRegister(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = form.get('password');
    const confirm = form.get('confirm');

    if (password !== confirm) {
      notify('Passwords do not match.', 'error');
      return;
    }

    try {
      const data = await apiRequest('/auth/register', Object.fromEntries(form));

      if (data.requiresConfirmation) {
        // Email confirmation required — don't sign in yet
        setModal(null);
        formElement.reset();
        notify(data.message || 'Account created! Please check your email to confirm before signing in.', 'success');
        return;
      }

      // Confirmation off — immediately signed in
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      sessionStorage.setItem('accessToken', data.session?.access_token || '');
      setCurrentUser(data.user);
      setModal(null);
      notify(data.message || 'Account created successfully. You are signed in.');
      formElement.reset();
      window.setTimeout(() => scrollToSection('my-bookings'), 300);
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function handleSignIn(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const payload = Object.fromEntries(new FormData(formElement));

    try {
      const data = await apiRequest('/auth/sign-in', payload);
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      sessionStorage.setItem('accessToken', data.session?.access_token || '');
      setCurrentUser(data.user);
      setModal(null);
      notify(data.message || 'Welcome back. You are signed in.');
      formElement.reset();
      window.setTimeout(() => scrollToSection('my-bookings'), 300);
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function handleBooking(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const payload = {
      ...Object.fromEntries(new FormData(formElement)),
      plan: selectedPlan || null,
      profile_id: currentUser?.id || null
    };

    try {
      const data = await apiRequest('/bookings', payload);
      notify('Thank you. Your booking request was sent to LÜNA WASH.');
      formElement.reset();
      setSelectedPlan('');
      if (currentUser?.email && payload.email.toLowerCase() === currentUser.email.toLowerCase()) {
        setBookings((items) => [data.booking, ...items]);
      }
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="navbar-container">
          <div className="navbar-logo"><h2>LÜNA WASH</h2></div>
          <button className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            <span></span><span></span><span></span>
          </button>
          <ul className={`nav-menu ${menuOpen ? 'active' : ''}`} id="navMenu">
            {navItems.map(([id, label]) => (
              <li key={id}><button className="nav-link button-link" onClick={() => scrollToSection(id)}>{label}</button></li>
            ))}
            {currentUser && <li><button className="nav-link button-link" onClick={() => scrollToSection('my-bookings')}>My Bookings</button></li>}
            <li className="nav-auth-mobile">
              <div className="mobile-auth-container">
                <button className="btn btn-secondary btn-small" onClick={() => setModal('sign-in')}>Sign In</button>
                <button className="btn btn-primary btn-small" onClick={() => setModal('register')}>Register</button>
              </div>
            </li>
          </ul>
          <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
          <div className="navbar-auth-buttons">
            {currentUser ? (
              <>
                <button className="btn btn-secondary btn-small" onClick={() => {
                  sessionStorage.removeItem('currentUser');
                  sessionStorage.removeItem('accessToken');
                  setCurrentUser(null);
                  notify('You have been signed out.');
                }}>Sign Out</button>
                <button className="btn btn-primary btn-small" onClick={() => scrollToSection('my-bookings')}>My Bookings</button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary btn-small" onClick={() => setModal('sign-in')}>Sign In</button>
                <button className="btn btn-primary btn-small" onClick={() => setModal('register')}>Register</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section id="home" className="hero">
        <canvas id="bg-canvas"></canvas>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-heading">Wear Clean,<br />Live Free.</h1>
            <p className="hero-subheading">Premium laundry service that comes to you. Fresh, clean clothes delivered to your door.</p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => scrollToSection('contact')}>Book Now</button>
              <button className="btn btn-secondary" onClick={() => scrollToSection('services')}>Learn More</button>
            </div>
          </div>
          <div
            className="hero-graphic react-washer"
            onPointerMove={handleHeroPointerMove}
            onPointerLeave={() => setHeroTilt({ x: 0, y: 0 })}
            style={{ '--tilt-x': heroTilt.x, '--tilt-y': heroTilt.y }}
          >
            <HeroLaundryScene tilt={heroTilt} />
            <div className="washer-body">
              <div className="washer-controls"><span></span><span></span><span></span></div>
              <div className="washer-door"><div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services no-animations">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {(catalogLoading ? FALLBACK_SERVICES : services).map((service) => (
              <div className="service-card glass-card" key={service.code || service.title}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="process no-animations">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="process-steps">
            {['Schedule Pickup', 'We Pick Up', 'Professional Care', 'Delivery'].map((step, index) => (
              <React.Fragment key={step}>
                <div className="process-step glass-card">
                  <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
                  <h3>{step}</h3>
                  <p>{['Book a pickup through our website. Choose your preferred date and time.', 'Our driver collects your laundry with care and professionalism.', 'Expert cleaning and treatment give your clothes the best care possible.', 'Fresh, clean clothes are delivered back folded and ready to wear.'][index]}</p>
                </div>
                {index < 3 && <div className="step-connector"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing no-animations">
        <div className="container">
          <h2 className="section-title">Simple & Transparent Pricing</h2>
          <div className="pricing-toggle">
            <label className="toggle-label">
              <span>Monthly</span>
              <input type="checkbox" className="toggle-switch" checked={annual} onChange={(event) => setAnnual(event.target.checked)} />
              <span className="toggle-slider"></span>
              <span>Annual</span>
            </label>
          </div>
          <div className="pricing-grid">
            {(catalogLoading ? FALLBACK_PLANS : plans).map((plan) => (
              <div className={`pricing-card glass-card ${plan.featured ? 'featured' : ''} ${selectedPlan === plan.name ? 'selected' : ''}`} key={plan.name}>
                {plan.featured && <div className="badge">Most Popular</div>}
                <h3>{plan.name}</h3>
                <div className="price"><span>{annual ? plan.annual : plan.monthly}</span><span className="period">/{annual ? 'year' : 'month'}</span></div>
                <ul className="pricing-features">
                  {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
                </ul>
                <button className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handlePlan(plan.name)}>Choose Plan</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials no-animations">
        <div className="container">
          <h2 className="section-title">Happy Customers</h2>
          <div className="testimonials-carousel">
            {testimonials.map(([name, role, text]) => (
              <div className="testimonial-card glass-card" key={name}>
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"{text}"</p>
                <p className="testimonial-author">- {name}</p>
                <p className="testimonial-role">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact no-animations">
        <div className="container">
          <h2 className="section-title contact-title">Book a Service</h2>
          <div className="contact-info">
            <div className="info-item no-animations"><h3>Phone</h3><p>+92 370 4747292</p></div>
            <div className="info-item no-animations"><h3>Email</h3><p>support@lunawash.com</p></div>
            <div className="info-item no-animations"><h3>Hours</h3><p>Mon-Fri: 8am-8pm<br />Sat: 10am-6pm</p></div>
            <div className="info-item no-animations"><h3>Service Area</h3><p>UMT, Lahore</p></div>
          </div>
          <div className="contact-content">
            <form className="contact-form glass-card" onSubmit={handleBooking}>
              <div className="form-group no-animations"><label htmlFor="name">Full Name</label><input type="text" id="name" name="name" required minLength="2" defaultValue={currentUser?.name || ''} /></div>
              <div className="form-group no-animations"><label htmlFor="email">Email Address</label><input type="email" id="email" name="email" required defaultValue={currentUser?.email || ''} /></div>
              <div className="form-group no-animations"><label htmlFor="phone">Phone Number</label><input type="tel" id="phone" name="phone" required /></div>
              <div className="form-group no-animations">
                <label htmlFor="service">Service Type</label>
                <select id="service" name="service" required>
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.code} value={service.code}>{service.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group no-animations"><label htmlFor="date">Preferred Pickup Date</label><input type="date" id="date" name="date" required /></div>
              <div className="form-group no-animations"><label htmlFor="message">Additional Notes</label><textarea id="message" name="message" rows="2"></textarea></div>
              {selectedPlan && <p className="selected-plan">Selected plan: {selectedPlan}</p>}
              <button type="submit" className="btn btn-primary compact-submit">Book Service</button>
            </form>
          </div>
          {currentUser && (
            <div className="my-bookings glass-card" id="my-bookings">
              <div className="my-bookings-header">
                <div>
                  <h3>My Bookings</h3>
                  <p>{currentUser.email}</p>
                </div>
                <span>{bookingsLoading ? 'Loading' : `${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'}`}</span>
              </div>
              {bookingsLoading ? (
                <p className="booking-empty">Fetching your bookings...</p>
              ) : bookings.length > 0 ? (
                <div className="booking-list">
                  {bookings.map((booking) => (
                    <div className="booking-item" key={booking.id || `${booking.email}-${booking.pickup_date}-${booking.service}`}>
                      <div>
                        <h4>{formatService(booking.service, services)}</h4>
                        <p>{booking.pickup_date || booking.date}</p>
                      </div>
                      <div>
                        {booking.plan && <p className="booking-plan">{booking.plan}</p>}
                        <span>{booking.status || 'pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="booking-empty">No bookings yet. Your new bookings will appear here.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="footer no-animations">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section"><h3>LÜNA WASH</h3><p>Premium laundry service delivered to your door.</p></div>
            <div className="footer-section"><h3>Quick Links</h3><ul>{navItems.slice(1, 5).map(([id, label]) => <li key={id}><button className="footer-link" onClick={() => scrollToSection(id)}>{label}</button></li>)}</ul></div>
            <div className="footer-section"><h3>Follow Us</h3><ul><li>Facebook: Luna_Wash.Fb</li><li>Instagram: Luna_wash.IG</li><li>Twitter: Luna_wash.tweets</li></ul></div>
            <div className="footer-section"><h3>Legal</h3><ul><li>Privacy Policy</li><li>Terms of Service</li></ul></div>
          </div>
          <div className="footer-bottom"><p>&copy; 2026 LÜNA WASH. All rights reserved. Made By Muhammad Abdullah Bhatti.</p></div>
        </div>
      </footer>

      {toast && <div className={`toast show ${toast.type}`}>{toast.message}</div>}
      {modal === 'sign-in' && <AuthModal title="Sign In" onClose={() => setModal(null)} onSubmit={handleSignIn} submitText="Sign In" switchText="Create an account" onSwitch={() => setModal('register')} />}
      {modal === 'register' && <AuthModal title="Create Account" onClose={() => setModal(null)} onSubmit={handleRegister} submitText="Register" switchText="Already have an account?" onSwitch={() => setModal('sign-in')} register />}
    </>
  );
}

function HeroLaundryScene({ tilt }) {
  const containerRef = useRef(null);
  const tiltRef = useRef(tilt);

  useEffect(() => {
    tiltRef.current = tilt;
  }, [tilt]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.2, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light = new THREE.PointLight(0xffffff, 1.4, 14);
    light.position.set(2.5, 3, 5);
    scene.add(light);

    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.08,
      transmission: 0.55,
      thickness: 0.2
    });
    const bubbleGeometry = new THREE.SphereGeometry(0.08, 24, 16);
    const bubbles = Array.from({ length: 18 }, (_, index) => {
      const mesh = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      mesh.position.set((Math.random() - 0.5) * 5.4, -1.8 + Math.random() * 3.8, -1.2 + Math.random() * 1.4);
      mesh.scale.setScalar(0.55 + Math.random() * 0.9);
      mesh.userData = { speed: 0.14 + Math.random() * 0.16, baseX: mesh.position.x, phase: index * 0.7 };
      group.add(mesh);
      return mesh;
    });

    const clothMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xff8f66, roughness: 0.62, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0x7db8da, roughness: 0.62, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0xf6f0de, roughness: 0.62, side: THREE.DoubleSide })
    ];
    const clothGeometry = new THREE.PlaneGeometry(0.46, 0.34, 3, 3);
    const clothes = [
      [-2.2, 0.95, -0.8, 0],
      [2.15, 1.2, -0.7, 1],
      [-1.75, -1.05, -0.5, 2],
      [1.75, -0.85, -0.9, 0],
      [0.15, 1.75, -1.2, 1]
    ].map(([x, y, z, materialIndex], index) => {
      const mesh = new THREE.Mesh(clothGeometry, clothMaterials[materialIndex]);
      mesh.position.set(x, y, z);
      mesh.rotation.set(index * 0.35, index * 0.45, index * 0.25);
      mesh.userData = { phase: index * 0.8, baseY: y };
      group.add(mesh);
      return mesh;
    });

    function resize() {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const time = clock.getElapsedTime();
      const currentTilt = tiltRef.current;
      group.rotation.y += (currentTilt.x * 0.1 - group.rotation.y) * 0.04;
      group.rotation.x += (-currentTilt.y * 0.06 - group.rotation.x) * 0.04;

      if (!reducedMotion) {
        bubbles.forEach((bubble) => {
          bubble.position.y += bubble.userData.speed * 0.012;
          bubble.position.x = bubble.userData.baseX + Math.sin(time + bubble.userData.phase) * 0.08;
          if (bubble.position.y > 2.25) bubble.position.y = -2;
        });
        clothes.forEach((cloth) => {
          cloth.position.y = cloth.userData.baseY + Math.sin(time * 0.7 + cloth.userData.phase) * 0.08;
          cloth.rotation.z += 0.0025;
        });
      }

      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      container.removeChild(renderer.domElement);
      bubbleGeometry.dispose();
      clothGeometry.dispose();
      bubbleMaterial.dispose();
      clothMaterials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return <div className="laundry-3d" ref={containerRef} aria-hidden="true" />;
}

function ThemeSwitcher({ currentTheme, onThemeChange }) {
  const [open, setOpen] = useState(false);
  const darkThemes = themes.filter((item) => item.type === 'dark');
  const lightThemes = themes.filter((item) => item.type === 'light');
  const selectedTheme = themes.find((item) => item.id === currentTheme) || themes[0];

  function chooseTheme(themeId) {
    onThemeChange(themeId);
    setOpen(false);
  }

  return (
    <div className="theme-switcher">
      <button className="theme-toggle-btn" type="button" title="Theme menu" aria-label="Theme menu" onClick={() => setOpen(!open)}>
        <span className="theme-toggle-swatch" style={{ backgroundColor: selectedTheme.color }}></span>
      </button>
      <div className={`theme-menu ${open ? 'active' : ''}`}>
        <ThemeGroup title="Dark Themes" items={darkThemes} currentTheme={currentTheme} onSelect={chooseTheme} />
        <ThemeGroup title="Light Themes" items={lightThemes} currentTheme={currentTheme} onSelect={chooseTheme} />
      </div>
    </div>
  );
}

function ThemeGroup({ title, items, currentTheme, onSelect }) {
  const groupClass = title.startsWith('Light') ? 'theme-group-light' : 'theme-group-dark';

  return (
    <div className={`theme-group ${groupClass}`}>
      <div className="theme-group-title">{title}</div>
      {items.map((item) => (
        <button
          className={`theme-option ${currentTheme === item.id ? 'active' : ''}`}
          data-theme={item.id}
          key={item.id}
          onClick={() => onSelect(item.id)}
          title={item.name}
          type="button"
        >
          <span style={{ backgroundColor: item.color }}></span>
          {item.name}
        </button>
      ))}
    </div>
  );
}

function AuthModal({ title, onClose, onSubmit, submitText, switchText, onSwitch, register = false }) {
  return (
    <div className="modal active" onMouseDown={(event) => event.target.classList.contains('modal') && onClose()}>
      <div className="modal-content glass-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          {register && <div className="form-group"><label>Full Name</label><input name="name" type="text" placeholder="Enter your full name" required minLength="2" /></div>}
          <div className="form-group"><label>Email</label><input name="email" type="email" placeholder="Enter your email" required /></div>
          <div className="form-group"><label>Password</label><input name="password" type="password" placeholder={register ? 'Create a password' : 'Enter your password'} required minLength="6" /></div>
          {register && <div className="form-group"><label>Confirm Password</label><input name="confirm" type="password" placeholder="Confirm your password" required minLength="6" /></div>}
          <button type="submit" className="btn btn-primary full-width">{submitText}</button>
        </form>
        <p className="modal-link"><button className="button-link inline-link" onClick={onSwitch}>{switchText}</button></p>
      </div>
    </div>
  );
}

// ==================== AI CHAT WIDGET ====================

const CHAT_KB = [
  // Services
  {
    patterns: ['service', 'offer', 'provide', 'do you', 'what can', 'available', 'options'],
    answer: "We offer four core services:\n• **Express Wash** – wash & fold in 24 hours\n• **Dry Cleaning** – expert care for delicate fabrics\n• **Ironing Service** – perfectly pressed clothes\n• **Stain Removal** – professional-grade stain treatment\n\nYou can book any of these from the Book Now section!"
  },
  // Pricing
  {
    patterns: ['price', 'pricing', 'cost', 'how much', 'plan', 'basic', 'premium', 'elite', 'monthly', 'annual', 'cheap', 'expensive', 'fee'],
    answer: "We have three simple plans:\n• **Basic** – $29/month (1 pickup/week, express wash, free folding)\n• **Premium** – $59/month ⭐ Most Popular (2 pickups/week, dry cleaning + ironing included)\n• **Elite** – $99/month (unlimited pickups, all services, priority processing, 24/7 support)\n\nAnnual billing saves you ~17%! Toggle to Annual on the Pricing section."
  },
  // Booking
  {
    patterns: ['book', 'schedule', 'pickup', 'appointment', 'reserve', 'order', 'request'],
    answer: "Booking is easy! Scroll down to the **Book Now** section or click the Book Now button. Fill in your name, email, phone, service type, and preferred pickup date — and we'll take care of the rest. 🧺"
  },
  // Contact / Location
  {
    patterns: ['contact', 'phone', 'call', 'reach', 'number', 'email', 'address', 'location', 'where', 'area', 'lahore', 'umt', 'service area'],
    answer: "Here's how to reach us:\n📞 **Phone:** +92 370 4747292\n📧 **Email:** support@lunawash.com\n📍 **Location:** UMT, Lahore\n🕒 **Hours:** Mon–Fri 8am–8pm, Sat 10am–6pm"
  },
  // Hours
  {
    patterns: ['hour', 'open', 'close', 'time', 'when', 'sunday', 'saturday', 'monday', 'weekend', 'available'],
    answer: "Our service hours are:\n• **Monday – Friday:** 8:00 AM – 8:00 PM\n• **Saturday:** 10:00 AM – 6:00 PM\n• **Sunday:** Closed\n\nBookings can be submitted anytime online!"
  },
  // How it works
  {
    patterns: ['how', 'work', 'process', 'step', 'pickup', 'deliver', 'collect'],
    answer: "Here's how LÜNA WASH works in 4 simple steps:\n1. **Schedule Pickup** – Book online, choose your date & time\n2. **We Pick Up** – Our driver collects your laundry professionally\n3. **Professional Care** – Expert cleaning tailored to each item\n4. **Delivery** – Fresh, folded clothes delivered back to you 🚚"
  },
  // Delivery / Turnaround
  {
    patterns: ['deliver', 'return', 'turnaround', 'fast', 'quick', 'long', 'take', 'ready'],
    answer: "Our Express Wash has a **24-hour turnaround**. Other services like dry cleaning and ironing may take 48–72 hours depending on volume. Your driver will give you an estimated return time at pickup."
  },
  // Registration / Account
  {
    patterns: ['account', 'register', 'sign up', 'login', 'sign in', 'profile', 'my bookings', 'password'],
    answer: "You can create a free account by clicking **Register** in the top right corner. Once signed in, you can track all your bookings right in the **My Bookings** section at the bottom of the page!"
  },
  // Testimonials / Reviews
  {
    patterns: ['review', 'testimonial', 'customer', 'feedback', 'rating', 'satisfied', 'happy', 'experience'],
    answer: "Our customers love us! ⭐⭐⭐⭐⭐\n\nHere's what they say:\n• \u201cCompletely transformed my laundry routine!\u201d – Muhammad Abbas\n• \u201cExceptional dry cleaning quality.\u201d – Junaid Khan\n• \u201cProfessional, reasonable, and convenient.\u201d – Usman Farhan\n• \u201cThe stain removal is fantastic!\u201d – Muhammad Awais"
  },
  // Theme / appearance
  {
    patterns: ['theme', 'color', 'dark', 'light', 'mode', 'appearance', 'style', 'purple', 'ocean', 'forest'],
    answer: "LÜNA WASH supports **13 beautiful themes** including dark, light, ocean blue, forest green, sunset, purple, arctic, coral, mint, crimson, rose, and sky! 🎨\n\nClick the colored circle button in the top navigation to switch themes."
  },
  // Social media
  {
    patterns: ['social', 'facebook', 'instagram', 'twitter', 'follow', 'media'],
    answer: "Follow us on social media!\n• **Facebook:** Luna_Wash.Fb\n• **Instagram:** Luna_wash.IG\n• **Twitter:** Luna_wash.tweets\n\nStay updated with our latest offers and tips!"
  },
  // About / Who
  {
    patterns: ['about', 'who', 'luna', 'lüna', 'company', 'brand', 'business', 'founded', 'made by'],
    answer: "**LÜNA WASH** is a premium laundry service delivering fresh, clean clothes right to your door. We serve the UMT, Lahore area and are focused on making laundry completely hassle-free.\n\nThe website was made by Muhammad Abdullah Bhatti. 🌙"
  },
  // Dry cleaning
  {
    patterns: ['dry clean', 'delicate', 'fabric', 'suit', 'formal', 'silk', 'wool'],
    answer: "Our **Dry Cleaning** service offers professional care for delicate fabrics — suits, silk, wool, and formal wear. It's included in the **Premium** and **Elite** plans, or you can book it individually."
  },
  // Stain
  {
    patterns: ['stain', 'spot', 'remove', 'tough', 'permanent', 'dirty'],
    answer: "Our **Stain Removal** service uses professional-grade solutions to tackle even the toughest stains — ones you thought were permanent! Book it from the Book Now section and let us handle it. 💪"
  },
  // Payment
  {
    patterns: ['pay', 'payment', 'cash', 'card', 'online', 'billing', 'invoice'],
    answer: "Payment details are confirmed at the time of service. Our team will provide billing information when your booking is confirmed. For plan subscriptions, billing is handled monthly or annually."
  },
  // Hello / Hi
  {
    patterns: ['hi', 'hello', 'hey', 'greet', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup'],
    answer: "Hey there! 👋 Welcome to **LÜNA WASH**! I'm your laundry assistant. Ask me anything about our services, pricing, booking, or how we work!"
  },
  // Thanks
  {
    patterns: ['thank', 'thanks', 'appreciate', 'great', 'awesome', 'perfect', 'helpful'],
    answer: "You're welcome! 😊 If you have any other questions about LÜNA WASH, I'm right here. Ready to book? Head to the **Book Now** section!"
  }
];

const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "How much does it cost?",
  "How does the pickup work?",
  "Where are you located?",
  "How do I book a service?"
];

function getChatResponse(input) {
  const text = input.toLowerCase().trim();
  if (!text) return null;

  for (const entry of CHAT_KB) {
    if (entry.patterns.some((p) => text.includes(p))) {
      return entry.answer;
    }
  }

  return "I'm not sure about that one, but I'm here to help with anything about LÜNA WASH! Try asking about our **services**, **pricing**, **how it works**, or **how to book**. 😊";
}

function formatChatText(text) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Handle newlines
    return part.split('\n').map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: "Hi! 👋 I'm the LÜNA WASH assistant. Ask me about our services, pricing, booking, or anything else!"
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const lastBotId = messages.filter((m) => m.from === 'bot').at(-1)?.id;

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, typing]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  function sendMessage(text) {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    window.setTimeout(() => {
      const answer = getChatResponse(trimmed);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: 'bot',
        text: answer
      }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-widget" ref={panelRef}>
      {/* Bubble button */}
      <button
        className={`chat-bubble-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
        title="Chat with LÜNA WASH"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {!open && <span className="chat-bubble-badge" aria-hidden="true">1</span>}
      </button>

      {/* Panel — always in the DOM, shown/hidden via CSS class to avoid animation replays */}
      <div
        className={`chat-panel glass-card ${open ? 'chat-panel--open' : ''}`}
        role="dialog"
        aria-label="LÜNA WASH Chat Assistant"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-avatar">🌙</div>
          <div>
            <p className="chat-header-name">LÜNA WASH Assistant</p>
            <p className="chat-header-status"><span className="chat-status-dot"></span>Online</p>
          </div>
          <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages" role="log" aria-live="polite">
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <div className={`chat-msg chat-msg--${msg.from}`}>
                {msg.from === 'bot' && <div className="chat-msg-avatar">🌙</div>}
                <div className="chat-msg-bubble">{formatChatText(msg.text)}</div>
              </div>
              {/* Show suggestion chips only below the latest bot message and not while typing */}
              {msg.from === 'bot' && msg.id === lastBotId && !typing && (
                <div className="chat-suggestions">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button key={q} className="chat-suggestion-btn" onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}

          {typing && (
            <div className="chat-msg chat-msg--bot">
              <div className="chat-msg-avatar">🌙</div>
              <div className="chat-msg-bubble chat-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-row">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            aria-label="Chat message input"
            maxLength={300}
          />
          <button
            className="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <ChatWidget />
  </>
);
