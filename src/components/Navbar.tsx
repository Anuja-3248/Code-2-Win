import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Ambulance } from 'lucide-react';
import { Logo } from './Logo';

export interface NavbarProps {
  isHospitalLoggedIn?: boolean;
  hospitalName?: string;
  onHospitalLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (isHome) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(186, 230, 253, 0.45)',
        boxShadow: '0 4px 20px -2px rgba(10, 25, 47, 0.05), inset 0 -1px 0 rgba(255, 255, 255, 0.6)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container-responsive"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
        }}
      >
        {/* Left: ResQLink Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo size="md" />
        </div>

        {/* Right Desktop Nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="desktop-nav"
        >
          <a
            href="#how-it-works"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToSection('how-it-works');
              }
            }}
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              transition: 'color var(--transition-fast)',
            }}
          >
            How It Works
          </a>

          <a
            href="#for-hospitals"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToSection('for-hospitals');
              }
            }}
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              transition: 'color var(--transition-fast)',
            }}
          >
            For Hospitals
          </a>

          <a
            href="#about"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToSection('about');
              }
            }}
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              transition: 'color var(--transition-fast)',
            }}
          >
            About
          </a>

          {/* Primary Action */}
          <Link
            to="/ambulance"
            className="btn btn-primary"
            style={{
              marginLeft: '0.5rem',
              padding: '0.6rem 1.25rem',
              fontSize: '0.9375rem',
              gap: '0.45rem',
            }}
          >
            <Ambulance size={16} />
            Find a Hospital
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          aria-label="Toggle Navigation Menu"
          style={{
            display: 'none',
            padding: '0.5rem',
            color: 'var(--text-main)',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-section)',
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-color)',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-md)',
          }}
          className="mobile-drawer"
        >
          <a
            href="#how-it-works"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToSection('how-it-works');
              } else {
                setMobileMenuOpen(false);
              }
            }}
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              padding: '0.4rem 0',
            }}
          >
            How It Works
          </a>

          <a
            href="#for-hospitals"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToSection('for-hospitals');
              } else {
                setMobileMenuOpen(false);
              }
            }}
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              padding: '0.4rem 0',
            }}
          >
            For Hospitals
          </a>

          <a
            href="#about"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                scrollToSection('about');
              } else {
                setMobileMenuOpen(false);
              }
            }}
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              padding: '0.4rem 0',
            }}
          >
            About
          </a>

          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/ambulance"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Ambulance size={16} />
              Find a Hospital
            </Link>

            <Link
              to="/hospital/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Hospital Portal
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};
