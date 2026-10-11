import { Mail, MessageCircle } from 'lucide-react';
import { hasContactMethod, site } from '../config/site.js';
import Callout from './Callout.jsx';

/** Email and WhatsApp links from configuration. Shows an honest notice if none are configured. */
export default function ContactMethods({ className = '' }) {
  const { email, whatsappDigits, whatsappDisplay } = site.contact;
  if (!hasContactMethod) {
    return (
      <Callout tone="warn" title="Contact details are not set up yet" className={className}>
        The site owner has not added an email address or WhatsApp number. Set <code>VITE_CONTACT_EMAIL</code> and/or{' '}
        <code>VITE_WHATSAPP_NUMBER</code> and rebuild (see the README).
      </Callout>
    );
  }
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      {email && (
        <a className="btn btn-secondary justify-start" href={`mailto:${email}`}>
          <Mail size={18} aria-hidden="true" />
          <span>Email {email}</span>
        </a>
      )}
      {whatsappDigits && (
        <a className="btn btn-secondary justify-start" href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} aria-hidden="true" />
          <span>WhatsApp {whatsappDisplay}</span>
        </a>
      )}
    </div>
  );
}
