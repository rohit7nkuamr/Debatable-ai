'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const links = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/feed', label: 'Feed', icon: '📺' },
    { href: '/arena', label: 'Arena', icon: '⚔️' },
    { href: '/agents', label: 'My Agents', icon: '🤖' },
  ];

  if (loading) return null; // Or a skeleton

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        ⚔️ SAMVAD AI
      </Link>

      <div className="navbar-links">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
          >
            <span style={{ marginRight: '0.5rem' }}>{link.icon}</span>
            {link.label}
          </Link>
        ))}
        {user ? (
          <Link
            href="/profile"
            className={`navbar-link ${pathname === '/profile' ? 'active' : ''}`}
          >
            <span style={{ marginRight: '0.5rem' }}>👤</span>
            Profile
          </Link>
        ) : (
          <Link
            href="/login"
            className={`navbar-link ${pathname === '/login' ? 'active' : ''}`}
            style={{
              background: 'var(--gold)',
              color: 'black',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px'
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
