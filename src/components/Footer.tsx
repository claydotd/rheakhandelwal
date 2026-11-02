import { Link } from 'react-router-dom'
import './Footer.css'

// Update these when final details are ready
const EMAIL = 'hello@rheakhandelwaltherapy.co.uk'
const BACP_REGISTRATION = '000000'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__col site-footer__col--start">
          <p className="site-footer__copy">
            © {year} Rhea Khandelwal. All rights reserved.
          </p>
          <a className="site-footer__email" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <p className="site-footer__bacp">
            BACP Registration: {BACP_REGISTRATION}
          </p>
        </div>

        <div className="site-footer__col site-footer__col--center">
        </div>

        <div className="site-footer__col site-footer__col--end">
          <Link className="site-footer__link" to="/privacy">
            Privacy Policy
          </Link>
          <Link className="site-footer__link" to="/how-i-work#faq-heading">
            Frequently Asked Questions
          </Link>
          <span className="site-footer__credit">Built by <a className="site-footer__credit-link" href="https://analoguegonedigital.co.uk">Analogue Gone Digital</a></span>
        </div>
      </div>
    </footer>
  )
}
