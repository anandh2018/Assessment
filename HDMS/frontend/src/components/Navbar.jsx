import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/tickets', label: 'All Tickets' },
  { to: '/tickets/new', label: 'Create Ticket' },
];

function Navbar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  const styles = {
    nav: {
      backgroundColor: '#1a56db',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    inner: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      height: '60px',
      gap: '8px',
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginRight: 'auto',
    },
    brandIcon: {
      width: '32px',
      height: '32px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '700',
      color: '#1a56db',
    },
    brandText: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: '16px',
      letterSpacing: '0.3px',
    },
    brandSub: {
      color: '#bfdbfe',
      fontSize: '11px',
      fontWeight: '400',
    },
    links: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    link: (isActive, isHovered) => ({
      padding: '8px 14px',
      borderRadius: '6px',
      color: isActive ? '#ffffff' : '#bfdbfe',
      fontWeight: isActive ? '600' : '500',
      fontSize: '14px',
      backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
      transition: 'all 0.15s ease',
      whiteSpace: 'nowrap',
    }),
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>HD</div>
          <div>
            <div style={styles.brandText}>HDMS</div>
            <div style={styles.brandSub}>Helpdesk Management</div>
          </div>
        </div>
        <div style={styles.links}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={styles.link(
                location.pathname === link.to,
                hovered === link.to
              )}
              onMouseEnter={() => setHovered(link.to)}
              onMouseLeave={() => setHovered(null)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
