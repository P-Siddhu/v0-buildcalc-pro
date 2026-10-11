import { Link } from 'react-router-dom';
import { PageIntro } from '../components/ui.jsx';
import ContactMethods from '../components/ContactMethods.jsx';

export default function Contact() {
  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="Contact">
        Questions about a calculator, a wrong result you spotted, or a personalised service? Write to us by email or WhatsApp.
      </PageIntro>

      <ContactMethods className="mt-8 max-w-3xl" />

      <div className="prose-ec mt-10">
        <h2>Before you write</h2>
        <ul>
          <li>For a wrong result, tell us the calculator, the numbers you entered and what you expected.</li>
          <li>
            To order a service, use the <Link to="/order">order page</Link>. It prepares a complete message so we can reply faster.
          </li>
          <li>Please don’t send bank account numbers, card details, OTPs or passwords. We never need them.</li>
        </ul>

        <h2>Why there is no contact form</h2>
        <p>
          This site has no server to receive form data. Messages go through your own email or WhatsApp, which also keeps your details out of
          third-party form services.
        </p>

        <h2>What we can’t help with</h2>
        <p>
          We can’t give personal financial, tax, legal or investment advice, or recommend specific products. For that, speak to a qualified
          professional.
        </p>
        <p>We reply as soon as we can. There is no guaranteed reply time.</p>
      </div>
    </div>
  );
}
