import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Search } from 'lucide-react';
import ToolCard from '../components/ToolCard.jsx';
import FaqList from '../components/FaqList.jsx';
import ContactMethods from '../components/ContactMethods.jsx';
import { NumberField, SlipRow } from '../components/ui.jsx';
import { filterTools, toolGroups, tools } from '../config/tools.js';
import { services } from '../config/pricing.js';
import { formatPrice, priceNote } from '../lib/pricing.js';
import { parseMoney, parseNumber, formatINR } from '../lib/format.js';
import { discount } from '../lib/percentage.js';

const POPULAR = [
  { label: 'Sale price after a 20% discount', to: '/tools/percentage-calculator?mode=discount' },
  { label: 'Plan this month’s budget', to: '/tools/budget-planner' },
  { label: 'Acres to square feet', to: '/tools/unit-converter?category=area&from=acre&to=sqft' },
  { label: 'Salary hike or price rise as a percentage', to: '/tools/percentage-calculator?mode=change' },
  { label: 'Kilograms to pounds', to: '/tools/unit-converter?category=weight&from=kg&to=lb' },
  { label: 'Marks as a percentage', to: '/tools/percentage-calculator?mode=share' },
];

const STEPS = [
  { title: 'Use a free tool', text: 'Try the calculators as much as you like. They are free in full, with no sign-up.' },
  { title: 'Ask for something personal', text: 'If you want a spreadsheet, report or calculator built around your own numbers, send an enquiry by email or WhatsApp.' },
  { title: 'Confirm the scope', text: 'You get the exact deliverable, price and delivery date in writing. Nothing is charged yet.' },
  { title: 'Pay', text: 'Payment instructions are sent only after you agree the scope.' },
  { title: 'Receive your file and give feedback', text: 'Your file is delivered by email or WhatsApp. Revisions are included as listed on each service.' },
];

const FAQ = [
  {
    q: 'Are the calculators really free?',
    a: 'Yes. The budget planner, percentage calculator and unit converter are free to use in full, with no sign-up, and results are never hidden behind a payment. That includes the PDF from the budget planner.',
  },
  {
    q: 'Is the money I type into the tools uploaded anywhere?',
    a: 'No. The calculators run in your browser, and the numbers you type are not sent to us. If you contact us by email or WhatsApp, you share only what you choose to write there. The Privacy notice has the details.',
  },
  {
    q: 'What do the paid services add?',
    a: 'A person prepares something around your own numbers, such as a spreadsheet laid out for your categories, a written PDF summary, or a custom calculator. The free tools do not depend on any of this.',
  },
  {
    q: 'How do I pay, and when?',
    a: 'Only after we have agreed the scope, price and delivery date. We then send payment instructions from the same email address or WhatsApp number you used to enquire. We never ask for a UPI PIN, OTP, card details or passwords.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. The calculators and reports describe your own numbers. They do not recommend products, predict returns or replace a qualified adviser.',
  },
  {
    q: 'What if I am not happy with the result?',
    a: 'Each service includes the revision rounds listed on the Services page. The Terms explain what happens if we cannot deliver what was agreed.',
  },
];

function QuickSale() {
  const [price, setPrice] = useState('2499');
  const [percent, setPercent] = useState('20');
  const p = parseMoney(price);
  const d = parseNumber(percent);
  const priceError = !p.ok && !p.empty ? p.error : null;
  const percentError = !d.ok && !d.empty ? d.error : null;
  let result = null;
  let calcError = null;
  if (p.ok && d.ok) {
    const r = discount(p.value, d.value);
    if (r.ok) result = r;
    else calcError = r.error;
  }
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-xl font-semibold">Try it: sale price</h2>
      <p className="mt-1 text-sm text-muted">A working calculator, right here.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField id="quick-price" label="Price" prefix="₹" value={price} onChange={setPrice} error={priceError} />
        <NumberField id="quick-percent" label="Discount" suffix="%" value={percent} onChange={setPercent} error={percentError ?? calcError} />
      </div>
      <div className="slip mt-5" aria-live="polite">
        {result ? (
          <dl>
            <SlipRow label="You save" value={formatINR(result.discountAmount)} />
            <SlipRow label="You pay" value={formatINR(result.finalPrice)} tone="accent" big />
          </dl>
        ) : (
          <p className="px-4 py-4 text-sm text-muted">Enter a price and a discount to see the result.</p>
        )}
      </div>
      <Link to="/tools/percentage-calculator?mode=discount" className="mt-4 inline-block text-sm font-medium text-accent underline underline-offset-2 hover:text-accent-ink">
        Open the full percentage calculator
      </Link>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All');
  const visible = useMemo(() => filterTools(query, group), [query, group]);

  return (
    <>
      {/* Hero */}
      <section className="wrap grid items-center gap-8 py-10 sm:gap-10 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-24">
        <div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-5xl lg:text-6xl">Make everyday calculations simple.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            EverydayCalc is a set of free tools for money, percentages and measurements. Type your numbers, see the answer with its formula,
            and move on. There is nothing to sign up for, and your numbers stay in your browser.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#tools" className="btn btn-primary">
              Explore free tools
            </a>
            <Link to="/order?service=pdf-report" className="btn btn-secondary">
              Get a custom report
            </Link>
          </div>
          <ul className="mt-8 space-y-2 text-sm text-muted">
            {['All calculators are free to use in full', 'Calculations run on your device', 'No ads and no tracking scripts'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check size={16} className="text-accent" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <QuickSale />
      </section>

      {/* Tools */}
      <section id="tools" aria-labelledby="tools-heading" className="wrap scroll-mt-24 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="tools-heading" className="text-3xl font-semibold">
              Free tools
            </h2>
            <p className="mt-2 text-muted">Pick a calculator, or search by what you want to work out.</p>
          </div>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="tool-search" className="label">
              Search tools
            </label>
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="tool-search"
                type="search"
                className="input pl-10"
                placeholder="Try “discount” or “acre”"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter tools by type">
          {toolGroups.map((g) => (
            <button key={g} type="button" className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>
              {g}
            </button>
          ))}
        </div>

        <p role="status" aria-live="polite" className="mt-4 text-sm text-muted">
          Showing {visible.length} of {tools.length} tools
        </p>

        {visible.length > 0 ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((tool) => (
              <li key={tool.id}>
                <ToolCard tool={tool} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card mt-4 p-8 text-center">
            <p className="font-medium">No tools match “{query}”.</p>
            <p className="mt-1 text-sm text-muted">Try a simpler word such as “percent”, “budget” or “length”.</p>
            <button
              type="button"
              className="btn btn-secondary mt-4"
              onClick={() => {
                setQuery('');
                setGroup('All');
              }}
            >
              Show all tools
            </button>
          </div>
        )}
      </section>

      {/* Popular calculations */}
      <section aria-labelledby="popular-heading" className="wrap py-12">
        <h2 id="popular-heading" className="text-3xl font-semibold">
          Popular calculations
        </h2>
        <p className="mt-2 text-muted">Jump straight to a common question. The calculator opens already set up.</p>
        <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
          {POPULAR.map((item) => (
            <li key={item.label} className="border-t border-line">
              <Link to={item.to} className="flex min-h-[56px] items-center py-3 font-medium text-ink hover:text-accent">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="wrap py-12">
        <h2 id="how-heading" className="text-3xl font-semibold">
          How it works
        </h2>
        <p className="mt-2 max-w-2xl text-muted">The tools are free on their own. Steps 2 to 5 apply only if you want a personalised service.</p>
        <ol className="mt-8 grid gap-6 md:grid-cols-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative border-t-2 border-accent pt-4">
              <span className="font-serif text-2xl font-semibold text-accent">{i + 1}</span>
              <h3 className="mt-1 text-lg font-semibold leading-snug">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Services */}
      <section aria-labelledby="services-heading" className="wrap py-12">
        <h2 id="services-heading" className="text-3xl font-semibold">
          Personalised services and pricing
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Free: every calculator, including the PDF from the budget planner. Paid: a person prepares something around your own numbers.
          Prices are in rupees and are agreed before you pay.
        </p>
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.id} className="card flex h-full flex-col p-6">
              <h3 className="text-xl font-semibold leading-snug">{s.title}</h3>
              <p className="mt-3 font-serif text-3xl font-semibold text-accent">{formatPrice(s.price)}</p>
              <p className="text-sm text-muted">{priceNote(s.price)}</p>
              <p className="mt-4 text-sm leading-6 text-muted">{s.short}</p>
              <p className="mt-3 text-sm text-muted">
                <span className="font-medium text-ink">Delivery:</span> {s.delivery}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <Link to={`/order?service=${s.id}`} className="btn btn-primary">
                  Enquire
                </Link>
                <Link to="/services" className="btn btn-secondary">
                  See what’s included
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="wrap py-12">
        <h2 id="faq-heading" className="mb-6 text-3xl font-semibold">
          Frequently asked questions
        </h2>
        <div className="max-w-3xl">
          <FaqList items={FAQ} />
        </div>
      </section>

      {/* Contact */}
      <section aria-labelledby="contact-heading" className="wrap py-12">
        <div className="card p-6 sm:p-8">
          <h2 id="contact-heading" className="text-2xl font-semibold">
            Questions before you order?
          </h2>
          <p className="mt-2 max-w-2xl text-muted">Write to us. Tell us what you want to work out and we will say whether and how we can help.</p>
          <ContactMethods className="mt-5" />
          <p className="mt-4 text-sm text-muted">
            More options on the <Link className="font-medium text-accent underline underline-offset-2" to="/contact">contact page</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
