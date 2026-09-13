import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, ShieldCheck, Terminal, Layers, Cpu, Award, CheckCircle2 } from 'lucide-react';
import BrandLogo from '../../common/BrandLogo/BrandLogo';
import logoLightImg from '../../../assets/logo-light.png';
import { companyInfo } from '../../../data/company';
import './Hero.css';

export default function Hero() {
  const waUrl = "https://wa.me/917358533721?text=Hi%2C%20I%27m%20interested%20in%20AAA%20Tech%20Solutions%20services%20and%20courses.";

  return (
    <section className="hero-section" aria-label="Introduction">
      {/* Background Canvas & Particle Effects */}
      <div className="hero-canvas" aria-hidden="true">
        <div className="hero-grid-lines"></div>
        <div className="hero-particles">
          <div className="hp hp1"></div>
          <div className="hp hp2"></div>
          <div className="hp hp3"></div>
          <div className="hp hp4"></div>
        </div>
      </div>

      <div className="container hero-container">
        {/* Left Content Column */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span>Enterprise Engineering & Practical Learning</span>
          </div>

          <h1 className="hero-title">
            Empowering Your <span className="text-gradient">Digital Growth</span> with Intelligent Solutions.
          </h1>

          <p className="hero-subtitle">
            We build scalable, enterprise-grade software applications and equip the next generation
            of tech professionals with hands-on, industry-tested technical expertise.
          </p>

          <div className="hero-cta-group">
            <Link to="/services" className="btn btn-primary btn-lg">
              <span>🚀 Explore Services</span>
            </Link>
            <Link to="/courses" className="btn btn-outline-white btn-lg">
              <span>🎓 Explore Courses</span>
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-lg">
              <MessageSquare size={17} />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Quick Metrics Counter Row */}
          <div className="hero-stats-row">
            <div className="hs-item">
              <div className="hs-number">20+</div>
              <div className="hs-label">Course Tracks</div>
            </div>
            <div className="hs-item">
              <div className="hs-number">100%</div>
              <div className="hs-label">Online & Flexible</div>
            </div>
            <div className="hs-item">
              <div className="hs-number">MSME</div>
              <div className="hs-label">Govt. Certified</div>
            </div>
            <div className="hs-item">
              <div className="hs-number">99.9%</div>
              <div className="hs-label">Reliable SLA</div>
            </div>
          </div>
        </div>

        {/* Right Visual Column with Orbital Tech Composition */}
        <div className="hero-visual" aria-hidden="true">
          <div className="orbital-system-wrap">
            <div className="orbit orbit-outer"></div>
            <div className="orbit orbit-inner"></div>

            <div className="hero-center-logo-wrap">
              <div className="hero-center-inner">
                <img
                  src={logoLightImg}
                  alt="AAA Tech Solutions"
                  className="hero-logo-img"
                />
              </div>
            </div>

            {/* Overlaid Floating Credential Badges */}
            <div className="float-badge fb-top">
              <ShieldCheck size={16} className="fb-icon fb-icon-cyan" />
              <div>
                <div className="fb-title">Production Grade</div>
                <div className="fb-sub">WCAG & ISO Standards</div>
              </div>
            </div>

            <div className="float-badge fb-bottom">
              <Terminal size={16} className="fb-icon fb-icon-gold" />
              <div>
                <div className="fb-title">Active Engineers</div>
                <div className="fb-sub">Practitioner Mentors</div>
              </div>
            </div>

            <div className="float-badge fb-left">
              <Layers size={16} className="fb-icon fb-icon-blue" />
              <div>
                <div className="fb-title">Full Lifecycle</div>
                <div className="fb-sub">Design to Deployment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
