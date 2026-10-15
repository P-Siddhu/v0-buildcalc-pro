import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Download, X } from 'lucide-react';
import { PageIntro } from '../components/ui.jsx';
import Callout from '../components/Callout.jsx';
import { services } from '../config/pricing.js';
import { formatPrice, priceNote } from '../lib/pricing.js';
import { downloadBytes } from '../lib/download.js';

export default function Services() {
  const [sample, setSample] = useState({ state: 'idle', message: '' });

  async function downloadSample() {
    setSample({ state: 'working', message: 'Creating the sample…' });
    try {
      const { buildSampleBudgetReport } = await import('../lib/pdf/budgetReport.js');
      const { bytes } = await buildSampleBudgetReport(new Date());
      downloadBytes(bytes, 'everydaycalc-sample-budget-report.pdf', 'application/pdf');
      setSample({ state: 'done', message: 'The sample PDF was created. Check your downloads folder.' });
    } catch {
      setSample({ state: 'error', message: 'We couldn’t create the sample PDF. Please try again.' });
    }
  }

  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="Personalised services">
        Three clearly scoped services for when you want something built around your own numbers. The free calculators stay free. Nothing here
        is a subscription.
      </PageIntro>

      <Callout tone="info" title="Free and paid, side by side" className="mt-8 max-w-3xl">
        Free: all calculators, including the PDF report from the budget planner. Paid: a person prepares a spreadsheet, report or calculator
        for you. You pay only after you have agreed exactly what you will get.
      </Callout>

      <ul className="mt-10 space-y-8">
        {services.map((s) => (
          <li key={s.id} id={s.id} className="card scroll-mt-24 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold leading-snug">{s.title}</h2>
                <p className="mt-2 max-w-xl text-muted">{s.short}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-serif text-4xl font-semibold text-accent">{formatPrice(s.price)}</p>
                <p className="text-sm text-muted">{priceNote(s.price)}</p>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 border-y border-line py-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-ink">Delivery</dt>
                <dd className="mt-1 text-muted">{s.delivery}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Revisions</dt>
                <dd className="mt-1 text-muted">{s.revisions}</dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold">What’s included</h3>
                <ul className="mt-3 space-y-2.5">
                  {s.includes.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-6">
                      <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold">What’s not included</h3>
                <ul className="mt-3 space-y-2.5">
                  {s.excludes.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-6 text-muted">
                      <X size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-7">
              <Link to={`/order?service=${s.id}`} className="btn btn-primary">
                Enquire about this service
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="sample-heading" className="mt-14 max-w-3xl">
        <h2 id="sample-heading" className="text-2xl font-semibold">
          What a report looks like
        </h2>
        <p className="mt-3 leading-7 text-muted">
          This is a real PDF made by the free budget planner from sample numbers, so you can see the layout, the formulas and the
          assumptions list. A personalised report is written around your own figures, in the same clear style.
        </p>
        <div className="mt-4">
          <button type="button" className="btn btn-secondary" onClick={downloadSample} disabled={sample.state === 'working'}>
            <Download size={18} aria-hidden="true" />
            Download the sample report (PDF)
          </button>
          <p role="status" aria-live="polite" className={`mt-2 text-sm ${sample.state === 'error' ? 'font-medium text-danger' : 'text-muted'}`}>
            {sample.message}
          </p>
        </div>
        <p className="hint mt-2">
          Samples of the spreadsheet and custom-calculator services are not published. Ask in your enquiry if you would like to know more
          about how one would be laid out.
        </p>
      </section>

      <section aria-labelledby="order-steps" className="mt-14 max-w-3xl">
        <h2 id="order-steps" className="text-2xl font-semibold">
          How ordering and payment work
        </h2>
        <ol className="prose-ec mt-4">
          <li>Choose a service on the <Link to="/order">order page</Link> and describe what you need. This prepares a message for email or WhatsApp. Nothing is sent until you send it.</li>
          <li>We reply to confirm the scope, the final price and a delivery date.</li>
          <li>If you are happy, we send payment instructions. If not, you owe nothing.</li>
          <li>We confirm your payment ourselves, then deliver the file by email or WhatsApp.</li>
          <li>You can ask for the revisions listed above.</li>
        </ol>
        <Callout tone="warn" title="Stay safe when paying" className="mt-4">
          We never ask for your UPI PIN, an OTP, card details, net-banking passwords or screen sharing. Only pay using instructions sent from
          the email address or number you used to enquire.
        </Callout>
        <p className="hint mt-4">
          Reports describe your own numbers. They are not professional financial, tax or investment advice, and we do not promise any financial
          outcome.
        </p>
      </section>
    </div>
  );
}
