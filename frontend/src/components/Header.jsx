import { useState } from 'react';

export default function Header({ activeSection, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { id: 'create', label: 'Create' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="header">
      <a href="#" className="header-brand" onClick={(e) => { e.preventDefault(); onNavigate('create'); }}>
        <div className="header-emblem">च</div>
        <div>
          <div className="header-title">Chitra</div>
          <div className="header-subtitle">Indian Miniature Painting Studio</div>
        </div>
      </a>
      <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
        {links.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className={activeSection === l.id ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(l.id);
              setMenuOpen(false);
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>
      <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        {menuOpen ? '✕' : '☰'}
      </button>
    </header>
  );
}
