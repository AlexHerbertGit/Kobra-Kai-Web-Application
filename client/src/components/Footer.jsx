import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <img
            src="/kobra-kai-logo.png"
            alt="Kobra Kai Community Kitchen logo"
            className="footer__logo"
          />
          <p className="footer__text">
            Kobra Kai Community Kitchen is committed to nourishing our neighbours
            with wholesome meals, kindness, and opportunities to connect.
          </p>
          <address className="footer__contact">
            <span>123 Sensei Way, Nelson, 7010</span>
            <a href="mailto:hello@kobrakai.community">hello@kobrakai.community</a>
            <a href="tel:+15551234567">(555) 123-4567</a>
          </address>

          <nav className="footer__links" aria-label="Footer links">
            <Link to="/about" className="footer__link">About</Link>
            <Link to="/contact" className="footer__link">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}