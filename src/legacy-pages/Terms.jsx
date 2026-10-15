import { Link } from 'react-router-dom';
import { PageIntro } from '../components/ui.jsx';
import { site } from '../config/site.js';

export default function Terms() {
  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="Terms of use">The plain-language rules for using the calculators and ordering a personalised service.</PageIntro>
      <div className="prose-ec mt-8">
        <p className="text-sm text-muted">Last updated: {site.policiesUpdated}</p>

        <h2>The free calculators</h2>
        <p>
          The calculators are free to use for personal and business use. They are provided “as is”, for general information. We test the
          formulas, but we can’t promise that every result is error-free or suitable for your situation. Check anything important against
          your own records.
        </p>

        <h2>Not professional advice</h2>
        <p>
          Nothing on this site, including calculator results, PDF reports and personalised services, is financial, tax, legal or investment
          advice. We don’t recommend products or predict returns. You are responsible for your own decisions.
        </p>

        <h2>Personalised services</h2>
        <ul>
          <li>The scope, the final price and the delivery date are agreed with you in writing before you pay.</li>
          <li>We send payment instructions only after you accept the scope. We never ask for a UPI PIN, OTP, card details or passwords.</li>
          <li>Work starts after we have confirmed your payment.</li>
          <li>Each service includes the revision rounds listed on the <Link to="/services">Services</Link> page. Work outside the agreed scope is quoted separately.</li>
          <li>Prices are in Indian rupees and are the amount you pay unless we tell you otherwise before you pay.</li>
          <li>You are responsible for the accuracy of the information you give us.</li>
        </ul>

        <h2>If something goes wrong</h2>
        <p>
          If we are unable to deliver what was agreed, we will refund the amount you paid for it. If you are unhappy with delivered work,
          tell us and we will use the revision rounds included in the service.
        </p>

        <h2>Ownership</h2>
        <p>
          Files we make for you are yours to use. The website, its design and its code remain ours. Your own numbers remain yours.
        </p>

        <h2>Liability</h2>
        <p>
          To the extent the law allows, we are not responsible for decisions you make using results from the site, or for indirect or
          consequential losses. Nothing in these terms limits rights you have under law that cannot be limited.
        </p>

        <h2>Changes and law</h2>
        <p>
          We may update these terms and will change the date above when we do. These terms are governed by the laws of India. For questions,
          see the <Link to="/contact">contact page</Link>.
        </p>
      </div>
    </div>
  );
}
