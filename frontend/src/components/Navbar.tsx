'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/feed', label: 'Feed', icon: '📺' },
    { href: '/arena', label: 'Arena', icon: '⚔️' },
    { href: '/agents', label: 'My Agents', icon: '🤖' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

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
      </div>
    </nav>
  );
}
