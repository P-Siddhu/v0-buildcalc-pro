import { Link } from 'react-router-dom';
import { PageIntro } from '../components/ui.jsx';
import { site } from '../config/site.js';

export default function Privacy() {
  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="Privacy notice">
        Short version: the calculators run in your browser and the numbers you type are not sent to us. This page explains the rest.
      </PageIntro>
      <div className="prose-ec mt-8">
        <p className="text-sm text-muted">Last updated: {site.policiesUpdated}</p>

        <h2>The calculators and PDFs</h2>
        <p>
          The budget planner, percentage calculator and unit converter do their maths on your device. The figures you type are not sent to
          our servers and are not saved by this site, so reloading the page clears them. PDF reports are also created in your browser and
          saved to your device by your browser.
        </p>

        <h2>What is stored on your device</h2>
        <ul>
          <li>
            If you use the light/dark switch, your choice is saved in your browser’s local storage (under the name <code>ec-theme</code>) so
            it is remembered next time. You can clear it in your browser settings.
          </li>
          <li>This site does not set cookies of its own.</li>
        </ul>

        <h2>Analytics, advertising and third parties</h2>
        <p>
          This site does not include analytics, advertising or tracking scripts, and it does not load fonts or code from third-party
          servers. If that changes, this notice will be updated before the change goes live.
        </p>
        <p>
          Like any website, it is delivered by a hosting provider, which processes technical request information (such as IP address,
          browser type and the page requested) to serve pages and keep the service secure. That processing is under the provider’s own
          policies.
        </p>

        <h2>When you send an enquiry</h2>
        <p>
          The order page prepares a message but does not send it. If you choose to send it, it goes through your email app or WhatsApp. We
          then receive what you wrote (your name, your email address or phone number, your requirements and any deadline) along with the
          details your provider attaches, such as your email address or WhatsApp number.
        </p>
        <ul>
          <li>We use this only to reply to you, agree the scope, deliver the work and keep basic records of it.</li>
          <li>We keep enquiry messages only as long as needed for those purposes.</li>
          <li>We don’t sell your details or use them for unrelated marketing.</li>
          <li>Your email provider and WhatsApp handle messages under their own privacy policies.</li>
        </ul>
        <p>Please don’t include bank account numbers, card details, OTPs or passwords in any message.</p>

        <h2>Your choices</h2>
        <p>
          You can ask us to delete the messages you sent, or ask what we hold about you, by writing to us on the{' '}
          <Link to="/contact">contact page</Link>.
        </p>

        <h2>Changes</h2>
        <p>We will update the date at the top of this page when the notice changes.</p>
      </div>
    </div>
  );
}
