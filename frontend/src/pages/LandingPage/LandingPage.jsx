import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import '@/shared/styles/home.css';

const AnimatedCounter = ({ target, suffix, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end)) return;

    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return (
    <span ref={elementRef}>
      {count}
      {suffix}
    </span>
  );
};

import headerImage from '@/assets/landingpage/header_image.png';
import doctorsOrdersSvg from '@/assets/landingpage/undraw_doctors-orders.svg';
import medicalCareSvg from '@/assets/landingpage/undraw_medical-care.svg';
import Navbar from '@/shared/components/Navbar';
import AIChatbot from '@/shared/components/AIChatbot';

const CardioIllustration = () => (
  <svg viewBox="0 0 400 200" className="svg-illustration">
    <rect width="400" height="200" fill="var(--md-sys-color-surface-container)" />
    <path className="path-draw" d="M 50 100 L 150 100 L 175 50 L 225 150 L 250 100 L 350 100" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="200" cy="100" r="40" fill="var(--md-sys-color-tertiary-container)" className="anim-pulse" style={{ mixBlendMode: 'multiply' }} />
  </svg>
);

const PediatricsIllustration = () => (
  <svg viewBox="0 0 400 200" className="svg-illustration">
    <rect width="400" height="200" fill="var(--md-sys-color-surface-container)" />
    <g className="anim-float">
      <rect x="140" y="70" width="40" height="40" rx="8" fill="var(--md-sys-color-primary)" opacity="0.9" />
      <text x="160" y="98" fill="white" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">A</text>
    </g>
    <g className="anim-float-delayed">
      <rect x="190" y="100" width="40" height="40" rx="8" fill="var(--md-sys-color-tertiary)" opacity="0.9" />
      <text x="210" y="128" fill="white" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">B</text>
    </g>
    <g className="anim-pulse">
      <rect x="220" y="50" width="40" height="40" rx="8" fill="var(--md-sys-color-secondary)" opacity="0.9" />
      <text x="240" y="78" fill="white" fontSize="24" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">C</text>
    </g>
  </svg>
);

const LabIllustration = () => (
  <svg viewBox="0 0 400 200" className="svg-illustration">
    <rect width="400" height="200" fill="var(--md-sys-color-surface-container)" />
    <g className="anim-float">
      <path d="M 180 150 C 180 150, 160 100, 180 50 L 220 50 C 240 100, 220 150, 220 150 Z" fill="var(--md-sys-color-primary-container)" />
      <path d="M 180 150 C 180 150, 160 100, 180 50 L 220 50 C 240 100, 220 150, 220 150 Z" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="4" />
      <path d="M 175 50 L 225 50" stroke="var(--md-sys-color-primary)" strokeWidth="6" strokeLinecap="round" />

      <circle cx="190" cy="130" r="6" fill="var(--md-sys-color-primary)" className="anim-float-delayed" />
      <circle cx="210" cy="110" r="4" fill="var(--md-sys-color-primary)" className="anim-float" />
      <circle cx="200" cy="90" r="8" fill="var(--md-sys-color-primary)" className="anim-pulse" />
    </g>
  </svg>
);
const faqData = [
  {
    question: "How long does patient onboarding & booking take?",
    answer: (
      <>
        <p>Most patients can complete registration and book their first slot in <strong>1-2 minutes</strong> and see active confirmation immediately.</p>
        <p>For more complex clinical services — such as specialized surgeries, diagnostics, or multi-department referrals — scheduling can extend to <strong>1-2 business days</strong> for department coordination. We typically send pre-visit instructions early so you see doctor advice and prepare in advance.</p>
      </>
    )
  },
  {
    question: "What insurance and payment channels does Rising Hospital support?",
    answer: <p>We support all major national insurance carriers, corporate health plans, and digital payment gateways. Direct cashless billing is integrated for approved providers.</p>
  },
  {
    question: "Does Rising Hospital work with our insurance network?",
    answer: <p>Yes, we partner with a vast network of health insurance providers. You can check your eligibility instantly by entering your policy details during the portal registration.</p>
  },
  {
    question: "What if my family has unique medical requirements?",
    answer: <p>Our portal allows you to upload past medical history, designate pediatric or cardiac preferences, and add custom notes for the doctors prior to your appointment.</p>
  },
  {
    question: "How does the hospital handle emergency exceptions?",
    answer: <p>Emergency cases bypass standard queues. Our 24/7 critical care unit has dedicated slots and emergency staff to handle immediate medical arrivals without booking.</p>
  },
  {
    question: "How quickly do we see consultation reports & lab results?",
    answer: <p>Routine blood work and outpatient consultation summaries are uploaded to your portal in <strong>2-4 hours</strong>. Advanced radiology and special diagnostic tests may take up to <strong>24-48 hours</strong>.</p>
  },
  {
    question: "What online services does the portal replace vs. augment?",
    answer: <p>The patient portal replaces paper-based scheduling and manual billing lines, while augmenting in-person consultations with virtual updates and digital records.</p>
  },
  {
    question: "Is our automated scheduling autonomous or supervised?",
    answer: <p>While the slot selection and reminder systems are fully automated for convenience, all final booking confirmations and rescheduling requests are audited by our medical desk.</p>
  }
];

const FaqItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}>
      <button
        onClick={onToggle}
        className="faq-trigger"
        type="button"
      >
        <span className="faq-question-text">{question}</span>
        <div className="faq-icon-wrapper">
          <div className="faq-icon-line-h"></div>
          <div className="faq-icon-line-v"></div>
        </div>
      </button>
      <div className="faq-content-wrapper">
        <div className="faq-content-inner">
          <div className="faq-answer-text">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const reviewsData = [
  {
    id: "aisha",
    name: "Aisha Rahman",
    role: "Cardiac Patient",
    rating: 5,
    text: "The cardiologists here saved my life. Their swift response and advanced screening were top-notch.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "sarah",
    name: "Sarah Jenkins",
    role: "Mother of two",
    rating: 5,
    text: "The pediatric team at Rising Hospital was exceptional. They made my daughter feel so comfortable during her treatment.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  },
  {
    id: "michael",
    name: "Michael Chen",
    role: "Local Resident",
    rating: 5,
    text: "State-of-the-art facilities and an incredibly caring staff. I wouldn't trust my family's healthcare with anyone else.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "david",
    name: "David Miller",
    role: "Father",
    rating: 5,
    text: "As a father, finding reliable emergency pediatric care was crucial. Rising Hospital exceeded all expectations.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "kenji",
    name: "Kenji Tanaka",
    role: "Software Engineer",
    rating: 5,
    text: "Superb digital portal. The appointment booking is autonomous, fast, and transparent.",
    img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "rajesh",
    name: "Rajesh Patel",
    role: "Senior Citizen",
    rating: 5,
    text: "The online portal makes rescheduling and checking lab reports so easy for elderly patients like me.",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "james",
    name: "James Wilson",
    role: "Corporate Client",
    rating: 5,
    text: "Excellent corporate health packages. Quick diagnostics and very minimal waiting times.",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "emily",
    name: "Emily Watson",
    role: "Teacher",
    rating: 5,
    text: "I had my diagnostic tests done here. The report was delivered to my portal in just two hours!",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "elena",
    name: "Elena Rostova",
    role: "Maternity Patient",
    rating: 5,
    text: "The maternity wing is incredible. The nurses were so patient, kind, and supportive throughout my stay.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "marcus",
    name: "Marcus Aurelius",
    role: "Fitness Coach",
    rating: 5,
    text: "Their sports medicine and orthopedic consultation helped me recover from a major knee injury in record time.",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "kevin",
    name: "Kevin Sanders",
    role: "Outpatient",
    rating: 5,
    text: "Very clean facilities and extremely professional staff. The billing process was completely direct and hassle-free.",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "amara",
    name: "Dr. Amara Okoro",
    role: "Medical Researcher",
    rating: 5,
    text: "A clinical infrastructure that rivals the best in the world. Exceptional sanitation and technology.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=180&q=80"
  },
  {
    id: "chloe",
    name: "Chloe Dupont",
    role: "Patient",
    rating: 5,
    text: "Booking an appointment through the new portal was completely seamless. We got to see a specialist the very next day.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=180&q=80"
  }
];

const collageColumns = [
  {
    id: 1,
    cards: [
      { type: 'placeholder' },
      { type: 'image', review: reviewsData[0] }, // Aisha
      { type: 'image', review: reviewsData[1] }  // Sarah
    ]
  },
  {
    id: 2,
    cards: [
      { type: 'image', review: reviewsData[2] }, // Michael
      { type: 'image', review: reviewsData[3] }  // David
    ]
  },
  {
    id: 3,
    cards: [
      { type: 'placeholder' },
      { type: 'image', review: reviewsData[4] }  // Kenji
    ]
  },
  {
    id: 4,
    cards: [
      { type: 'image', review: reviewsData[5] } // Rajesh
    ]
  },
  {
    id: 5,
    cards: [
      { type: 'placeholder' },
      { type: 'image', review: reviewsData[6] }  // James
    ]
  },
  {
    id: 6,
    cards: [
      { type: 'image', review: reviewsData[7] } // Emily
    ]
  },
  {
    id: 7,
    cards: [
      { type: 'placeholder' },
      { type: 'image', review: reviewsData[8] }  // Elena
    ]
  },
  {
    id: 8,
    cards: [
      { type: 'image', review: reviewsData[9] }, // Marcus
      { type: 'image', review: reviewsData[10] } // Kevin
    ]
  },
  {
    id: 9,
    cards: [
      { type: 'placeholder' },
      { type: 'image', review: reviewsData[11] }, // Amara
      { type: 'image', review: reviewsData[12] }  // Chloe
    ]
  }
];

export default function LandingPage() {
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    const handleGlobalClick = () => {
      setSelectedReviewId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleCardClick = (e, reviewId) => {
    if (window.innerWidth <= 1024) {
      e.stopPropagation();
      setSelectedReviewId(selectedReviewId === reviewId ? null : reviewId);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  return (
    <div style={{ backgroundColor: 'var(--md-sys-color-background)' }}>
      <Navbar />

      <section className="hero-viewport-landing">

        <div className="expressive-blob blob-1"></div>
        <div className="expressive-blob blob-2"></div>
        <div className="expressive-blob blob-3"></div>

        <div className="container">
          <div className="hero-split">
            <div className="hero-content-left">

              <h1 className="hero-title-expressive">
                Best hospital<br />
                <span className="highlight-text">services</span> you<br />
                can trust
              </h1>
              <p className="hero-desc-expressive">
                If you are looking for a reliable doctor in town, we are here to help. We are known for the best, affordable, and painless  treatments with quick appointments and timely solutions.
              </p>
              <div className="hero-actions-row">
                <Link to="/register" className="hero-btn-primary">
                  Book an Appointment
                  <span className="material-symbols-rounded hero-arrow-icon" style={{ fontSize: '18px' }}>arrow_forward</span>
                </Link>
                <a href="#services" className="hero-btn-secondary">
                  Explore Services
                </a>
              </div>
            </div>
            <div className="hero-image-right">
              <div className="hero-image-wrapper">

                <div className="image-shape-bg"></div>

                <img
                  src={headerImage}
                  className="hero-img-expressive"
                  alt="Services"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />

                <div className="hero-floating-card widget-doctors">
                  <div className="widget-header">
                    <div className="pulse-dot"></div>
                    <span className="widget-tag">24/7 Available</span>
                  </div>
                  <div className="widget-body">
                    <div className="avatar-group">
                      <div className="widget-avatar avatar-1">Dr</div>
                      <div className="widget-avatar avatar-2">Pt</div>
                      <div className="widget-avatar avatar-3">St</div>
                      <div className="widget-avatar-more">+15</div>
                    </div>
                    <span className="widget-text">Active Doctors</span>
                  </div>
                </div>

                <div className="hero-floating-card widget-booking">
                  <div className="widget-icon-box">
                    <span className="material-symbols-rounded">calendar_today</span>
                  </div>
                  <div className="widget-info">
                    <span className="widget-label">Quick Booking</span>
                    <span className="widget-value">Next slot in 10m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="full-viewport-section" style={{ backgroundColor: 'var(--md-sys-color-surface)' }}>
        <div className="container">
          <div style={{ marginBottom: '56px' }}>
            <h2 className="md-display-medium" style={{ color: 'var(--md-sys-color-on-surface)', marginBottom: '12px', fontWeight: '800', fontFamily: 'var(--md-sys-typescale-brand-font)', letterSpacing: '-1.5px', fontSize: '48px' }}>
              Modern care, tailored for your family.
            </h2>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '20px', fontFamily: 'var(--md-sys-typescale-plain-font)', fontWeight: '400', opacity: 0.85 }}>
              Discover specialized medical care with instant booking. Clear consulting fees.
            </p>
          </div>
          <div className="services-bento-grid">

            <div className="bento-card bento-card-yellow">
              <div className="bento-yellow-left-col">
                <div>
                  <h3 className="bento-card-title">Pediatric Care</h3>
                  <p className="bento-card-subtitle">Holistic healthcare for infants, children, and adolescents focusing on growth & development.</p>


                </div>

                <Link to="/login" className="bento-pill-btn">
                  Book visit
                </Link>
              </div>

              <div className="bento-yellow-right-col">
                <img src={doctorsOrdersSvg} className="bento-yellow-img" alt="Pediatric Care Illustration" />
              </div>
            </div>

            <Link to="/login" className="bento-card bento-card-teal">
              <div>
                <h3 className="bento-card-title">Cardiology</h3>
                <p className="bento-card-subtitle">Advanced cardiac screening & specialist procedures.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>

                <div className="bento-arrow-btn">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link to="/login" className="bento-card bento-card-pink">
              <div>
                <h3 className="bento-card-title">Diagnostic Lab</h3>
                <p className="bento-card-subtitle">High-precision testing & biochemistry reports.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                <div className="bento-arrow-btn">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link to="/login" className="bento-card bento-card-beige">
              <div>
                <h3 className="bento-card-title">Emergency Care</h3>
                <p className="bento-card-subtitle">Critical care unit and trauma response available 24/7.</p>
              </div>

              <div className="bento-card-illustration-center">
                <img src={medicalCareSvg} className="bento-card-img-centered" alt="Emergency Care Illustration" />
              </div>

              <div className="bento-arrow-btn" style={{ position: 'absolute', bottom: '32px', left: '32px' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)' }}>
        <div className="container stats-grid">
          <div style={{ textAlign: 'center' }}>
            <div className="md-display-large" style={{ fontWeight: '700', marginBottom: '8px' }}>
              <AnimatedCounter target="15" suffix="k+" />
            </div>
            <div className="md-title-medium" style={{ opacity: 0.9 }}>Happy Patients</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="md-display-large" style={{ fontWeight: '700', marginBottom: '8px' }}>
              <AnimatedCounter target="50" suffix="+" />
            </div>
            <div className="md-title-medium" style={{ opacity: 0.9 }}>Expert Doctors</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="md-display-large" style={{ fontWeight: '700', marginBottom: '8px' }}>
              <AnimatedCounter target="24" suffix="/7" />
            </div>
            <div className="md-title-medium" style={{ opacity: 0.9 }}>Emergency Care</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="md-display-large" style={{ fontWeight: '700', marginBottom: '8px' }}>
              <AnimatedCounter target="12" suffix="+" />
            </div>
            <div className="md-title-medium" style={{ opacity: 0.9 }}>Specialties</div>
          </div>
        </div>
      </section>

      <section id="why-us" className="bento-showcase-section">
        <div className="container">
          <div className="bento-section-header">
            <h2 className="bento-section-title">Why Families Trust Rising Hospital</h2>
          </div>

          <div className="bento-showcase-grid">

            <div className="bento-showcase-card bento-card-wide">
              <div className="bento-card-left-col">
                <span className="bento-card-label">Quality Care</span>
                <h3 className="bento-card-title">Expert Doctors</h3>
                <p className="bento-card-desc">
                  Unmatched medical expertise, with board-certified specialists dedicated to your family's health and wellness journey.
                </p>
              </div>
              <div className="bento-card-right-col">
                <div className="phone-mockup-quality">
                  <div className="phone-header">
                    <span>9:41</span>
                    <span style={{ display: 'flex', gap: '3px' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '10px' }}>wifi</span>
                      <span className="material-symbols-rounded" style={{ fontSize: '10px' }}>battery_full</span>
                    </span>
                  </div>
                  <div className="phone-notification-feed">
                    <div className="phone-notification-card">
                      <span className="notif-title">Dr. Sarah Jenkins</span>
                      <span className="notif-desc">Your lab report has been uploaded. Click to review.</span>
                    </div>
                    <div className="phone-notification-card">
                      <span className="notif-title">Rising Portal</span>
                      <span className="notif-desc">Appointment with Dr. Wilson is confirmed for tomorrow.</span>
                    </div>
                    <div className="phone-notification-card">
                      <span className="notif-title">Lab Update</span>
                      <span className="notif-desc">Radiology results are ready for department review.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-showcase-card">
              <div>
                <span className="bento-card-label">Fast turnaround</span>
                <h3 className="bento-card-title">Quick Reports</h3>
                <p className="bento-card-desc">
                  We process lab tests and upload reports to your portal within 2 hours, Monday to Sunday.
                </p>
              </div>
              <div className="huge-text-graphic">
                2<span style={{ fontSize: '60px' }}>h</span>
              </div>
            </div>

            <div className="bento-showcase-card">
              <div>
                <span className="bento-card-label">No booking limits</span>
                <h3 className="bento-card-title">Unlimited Bookings</h3>
                <p className="bento-card-desc">
                  Enjoy the freedom of scheduling unlimited follow-ups and specialist appointments for all family members.
                </p>
              </div>
              <div className="bento-graphic-container">
                <div className="overlapping-phones-container">
                  <div className="phone-screen-back">
                    <div className="mock-form-row" style={{ width: '60%' }}></div>
                    <div className="mock-form-row"></div>
                    <div className="mock-form-row" style={{ width: '80%' }}></div>
                    <div className="mock-form-row"></div>
                  </div>
                  <div className="phone-screen-front">
                    <div className="mock-form-row" style={{ width: '40%' }}></div>
                    <div className="mock-check-circle">
                      <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check</span>
                    </div>
                    <div className="mock-form-row" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-showcase-card">
              <div>
                <span className="bento-card-label">Secure Messaging</span>
                <h3 className="bento-card-title">Always in sync</h3>
                <p className="bento-card-desc">
                  Stay in sync with real-time updates and seamless chat communication with your clinic desk.
                </p>
              </div>
              <div className="bento-graphic-container">
                <div className="chat-dialog-box">
                  <div className="chat-row">
                    <div className="chat-avatar">Pt</div>
                    <div className="chat-bubble">Is my appointment confirmed?</div>
                  </div>
                  <div className="chat-row reply-row">
                    <div className="chat-avatar">Dr</div>
                    <div className="chat-bubble bubble-reply">Yes, see you tomorrow!</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-showcase-card">
              <div>
                <span className="bento-card-label">Flexible Control</span>
                <h3 className="bento-card-title">Cancel or Pause</h3>
                <p className="bento-card-desc">
                  Manage your health timeline dynamically—reschedule or pause active treatment plans anytime.
                </p>
              </div>
              <div className="bento-graphic-container">
                <div className="papers-scheduling-container">
                  <div className="paper-sheet paper-sheet-back">
                    <div className="mock-form-row" style={{ width: '40%' }}></div>
                    <div className="mock-form-row"></div>
                  </div>
                  <div className="paper-sheet paper-sheet-front">
                    <div className="mock-form-row" style={{ width: '70%' }}></div>
                    <div className="mock-form-row" style={{ width: '50%' }}></div>
                    <div className="mock-form-row"></div>
                  </div>
                  <div className="badge-scheduling-dollar">
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>event_busy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-showcase-card">
              <div>
                <span className="bento-card-label">Our Promise</span>
                <h3 className="bento-card-title">Clinical Excellence</h3>
                <p className="bento-card-desc">
                  Deep medical expertise combined with patient-first ethics and advanced diagnostic systems.
                </p>
              </div>
              <div className="bento-graphic-container">
                <div className="venn-diagram-container">
                  <div className="venn-circle circle-1">Doctors</div>
                  <div className="venn-circle circle-2">Patients</div>
                  <div className="venn-circle circle-3">Tech</div>
                  <div className="venn-center-star">
                    <span className="material-symbols-rounded filled" style={{ fontSize: '20px' }}>star</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-showcase-card">
              <div>
                <span className="bento-card-label">No caps / limits</span>
                <h3 className="bento-card-title">Unlimited Records</h3>
                <p className="bento-card-desc">
                  Access and download your complete medical history and consultation logs without any limit.
                </p>
              </div>
              <div className="bento-graphic-container">
                <div className="records-stack-container">
                  <div className="record-page page-1">
                    <div className="record-line" style={{ width: '80%' }}></div>
                    <div className="record-line"></div>
                  </div>
                  <div className="record-page page-2">
                    <div className="record-line" style={{ width: '50%' }}></div>
                    <div className="record-line" style={{ width: '70%' }}></div>
                    <div className="record-line"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-showcase-card">
              <div>
                <span className="bento-card-label">Our health stack</span>
                <h3 className="bento-card-title">Integrated Care</h3>
                <p className="bento-card-desc">
                  Unified dashboard linking diagnostics, pharmacy prescriptions, billing, and consultations.
                </p>
              </div>
              <div className="bento-graphic-container">
                <div className="health-stack-grid">
                  <div className="health-stack-icon active-icon">
                    <span className="material-symbols-rounded">local_pharmacy</span>
                  </div>
                  <div className="health-stack-icon">
                    <span className="material-symbols-rounded">cardiology</span>
                  </div>
                  <div className="health-stack-icon">
                    <span className="material-symbols-rounded">biotech</span>
                  </div>
                  <div className="health-stack-icon">
                    <span className="material-symbols-rounded">medical_services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-collage-section">
        <div className="testimonial-collage-container">
          {collageColumns.map((col) => (
            <div key={col.id} className="collage-column">
              {col.cards.map((card, idx) => (
                card.type === 'placeholder' ? (
                  <div key={idx} className="collage-card placeholder-card" style={{ height: '80px' }}></div>
                ) : (
                  <div
                    key={card.review.id}
                    className="collage-card image-card"
                    onClick={(e) => handleCardClick(e, card.review.id)}
                  >
                    <img src={card.review.img} alt={card.review.name} />
                    <div className={`review-tooltip ${selectedReviewId === card.review.id ? 'review-tooltip-open' : ''}`}>
                      <div className="tooltip-stars">
                        {Array.from({ length: card.review.rating }).map((_, i) => (
                          <span key={i} className="material-symbols-rounded filled" style={{ fontSize: '14px' }}>star</span>
                        ))}
                      </div>
                      <p className="tooltip-text">"{card.review.text}"</p>
                      <div className="tooltip-author">{card.review.name}</div>
                      <div className="tooltip-role">{card.review.role}</div>
                    </div>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>

        <div className="testimonials-center-content">
          <div className="testimonials-pill-badge">Testimonials</div>
          <h2 className="testimonials-title">
            Trusted by patients <br />
            <span>from all walks of life</span>
          </h2>
          <p className="testimonials-subtitle">
            Learn why families trust our specialized care and digital portal to manage their health journeys.
          </p>
          <button
            type="button"
            className="testimonials-cta-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsReviewsModalOpen(true);
            }}
          >
            Read Patient Stories
            <span className="material-symbols-rounded cta-arrow-icon" style={{ fontSize: '18px', marginLeft: '4px' }}>arrow_forward</span>
          </button>
        </div>

        {isReviewsModalOpen && (
          <div className="modal-overlay" onClick={() => setIsReviewsModalOpen(false)}>
            <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsReviewsModalOpen(false)}
              >
                <span className="material-symbols-rounded">close</span>
              </button>
              <div className="modal-header">
                <h3 className="modal-title">Patient Stories</h3>
                <p className="modal-subtitle">Hear directly from the patients and families we care for.</p>
              </div>
              <div className="modal-grid">
                {reviewsData.map((review) => (
                  <div key={review.id} className="modal-review-card">
                    <div>
                      <div className="modal-review-header">
                        <img src={review.img} alt={review.name} className="modal-reviewer-img" />
                        <div className="modal-reviewer-info">
                          <div className="modal-reviewer-name">{review.name}</div>
                          <div className="modal-reviewer-role">{review.role}</div>
                        </div>
                      </div>
                      <p className="modal-review-body">"{review.text}"</p>
                    </div>
                    <div className="modal-review-stars">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="material-symbols-rounded filled" style={{ fontSize: '16px' }}>star</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReviewId && (() => {
          const activeReview = reviewsData.find(r => r.id === selectedReviewId);
          if (!activeReview) return null;
          return (
            <div
              className="mobile-review-backdrop lg:hidden"
              onClick={() => setSelectedReviewId(null)}
            >
              <div className="mobile-review-card-popup" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-3">
                  <div className="tooltip-stars flex gap-0.5">
                    {Array.from({ length: activeReview.rating }).map((_, i) => (
                      <span key={i} className="material-symbols-rounded filled" style={{ fontSize: '16px', color: '#f59e0b' }}>star</span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedReviewId(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label="Close review"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
                <p className="tooltip-text" style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px', color: '#4a4a4a', fontStyle: 'italic' }}>
                  "{activeReview.text}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <img src={activeReview.img} alt={activeReview.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="tooltip-author" style={{ fontSize: '14px', fontWeight: '700', color: '#121212' }}>{activeReview.name}</div>
                    <div className="tooltip-role" style={{ fontSize: '12px', color: '#777777' }}>{activeReview.role}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      <section id="faq" className="faq-section">
        <div className="container faq-section-grid">
          <div className="faq-left-col">
            <h2 className="faq-title-brand">
              Frequently <br />
              <span>asked questions</span>
            </h2>
            <Link to="/faq" className="testimonials-cta-btn">
              Explore All
              <span className="material-symbols-rounded cta-arrow-icon" style={{ fontSize: '18px', marginLeft: '4px' }}>arrow_forward</span>
            </Link>
          </div>

          <div className="faq-accordion">
            {faqData.map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={activeFaqIndex === index}
                onToggle={() => toggleFaq(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <footer id="footer-contact" style={{ backgroundColor: 'var(--md-sys-color-on-surface)', color: 'var(--md-sys-color-surface)', padding: '80px 0 32px 0' }}>
        <div className="container">
          <div className="footer-layout" style={{ marginBottom: '64px' }}>

            <div className="footer-left-side">
              <div className="md-title-large font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--md-sys-color-surface-container-lowest)' }}>
                <svg className="w-6 h-6 text-[var(--md-sys-color-primary-container)]" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M420-260h120v-100h100v-120H540v-100H420v100H320v120h100v100ZM280-120q-33 0-56.5-23.5T200-200v-440q0-33 23.5-56.5T280-720h400q33 0 56.5 23.5T760-640v440q0 33-23.5 56.5T680-120H280Zm0-80h400v-440H280v440Zm-40-560v-80h480v80H240Zm40 120v440-440Z" />
                </svg>
                Rising Hospital
              </div>
              <p className="md-body-medium" style={{ opacity: 0.7, maxWidth: '280px', lineHeight: '1.6' }}>
                Setting the standard in specialized healthcare with a commitment to excellence, integrity, and patient-first care.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <a href="#" className="footer-social-btn" title="Facebook">
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>public</span>
                </a>
                <a href="#" className="footer-social-btn" title="Twitter">
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>language</span>
                </a>
                <a href="#" className="footer-social-btn" title="LinkedIn">
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>share</span>
                </a>
              </div>
            </div>

            <div className="footer-right-side">

              <div>
                <h3 className="md-title-medium" style={{ marginBottom: '24px', color: 'var(--md-sys-color-primary-container)' }}>Specialties</h3>
                <ul className="md-list" style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
                  <li><a href="#services" className="footer-link md-body-medium">Cardiology</a></li>
                  <li><a href="#services" className="footer-link md-body-medium">Pediatric Care</a></li>
                  <li><a href="#services" className="footer-link md-body-medium">Diagnostic Lab</a></li>
                  <li><a href="#why-us" className="footer-link md-body-medium">Emergency Care</a></li>
                </ul>
              </div>

              <div>
                <h3 className="md-title-medium" style={{ marginBottom: '24px', color: 'var(--md-sys-color-primary-container)' }}>Patient Portal</h3>
                <ul className="md-list" style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
                  <li><Link to="/register" className="footer-link md-body-medium">Book Appointment</Link></li>
                  <li><Link to="/login" className="footer-link md-body-medium">Patient Login</Link></li>
                  <li><Link to="/login?role=doctor" className="footer-link md-body-medium">Doctor Portal</Link></li>
                  <li><a href="#faq" className="footer-link md-body-medium">FAQs</a></li>
                </ul>
              </div>

              <div>
                <h3 className="md-title-medium" style={{ marginBottom: '24px', color: 'var(--md-sys-color-primary-container)' }}>Contact Us</h3>
                <ul className="md-list" style={{ gap: '16px', display: 'flex', flexDirection: 'column' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px', opacity: 0.7, marginTop: '2px' }}>location_on</span>
                    <span className="md-body-medium" style={{ opacity: 0.7 }}>24, ABC Layout, Bengaluru, Karnataka, 560001</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px', opacity: 0.7 }}>call</span>
                    <span className="md-body-medium" style={{ opacity: 0.7 }}>080-567890900</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '20px', opacity: 0.7 }}>mail</span>
                    <span className="md-body-medium" style={{ opacity: 0.7 }}>contact@risinghospital.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', opacity: 0.6 }}>
            <p className="md-body-medium">&copy; {new Date().getFullYear()} Rising Hospital. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" className="footer-link md-body-medium" style={{ fontSize: '12px' }}>Privacy Policy</a>
              <a href="#" className="footer-link md-body-medium" style={{ fontSize: '12px' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      <AIChatbot type="support" />
    </div>
  );
}
