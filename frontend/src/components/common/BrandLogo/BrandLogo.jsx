import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../../assets/logo.png';
import logoLightImg from '../../../assets/logo-light.png';
import './BrandLogo.css';

export default function BrandLogo({ variant = 'default', className = '' }) {
  const isDark = variant === 'dark' || variant === 'footer' || variant === 'navbar';
  const logoSrc = isDark ? logoLightImg : logoImg;

  return (
    <Link to="/" className={`brand-logo ${isDark ? 'brand-logo-dark' : ''} ${className}`} aria-label="AAA Tech Solutions Home">
      <img
        src={logoSrc}
        alt="AAA Tech Solutions"
        className="brand-logo-img"
      />
    </Link>
  );
}
