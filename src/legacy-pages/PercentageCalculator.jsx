import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Percent, RotateCcw } from 'lucide-react';
import { CopyButton, NumberField, PageIntro, SlipRow } from '../components/ui.jsx';
import FaqList from '../components/FaqList.jsx';
import RelatedTools from '../components/RelatedTools.jsx';
import AdSlot from '../components/AdSlot.jsx';
import { EMPTY_VALUES, PERCENT_EXAMPLES, PERCENT_MODES, describePercentage, isPercentMode } from '../lib/percentageView.js';

const FAQ = [
  {
    q: 'Why do I get an error when the starting value is 0?',
    a: 'A percentage change compares the new value with the starting value. From zero, any change is infinitely large in percentage terms, so there is no meaningful answer. Use “What percent is X of Y” or look at the difference between the numbers instead.',
  },
  {
    q: 'Can a discount be more than 100%?',
    a: 'No. A 100% discount makes the item free, and anything above that would mean the shop pays you. The calculator asks you to enter a discount between 0 and 100.',
  },
  {
    q: 'What is the difference between “percent of” and “percentage change”?',
    a: '“X% of a number” finds a share of one number, such as 15% of 2,400. “Percentage change” compares two numbers, such as a salary going from ₹80,000 to ₹92,000.',
  },
  {
    q: 'How do I add GST to a price?',
    a: 'Work out the GST amount with “X% of a number”, then add it. For ₹1,000 at 18%, the GST is ₹180 and the total is ₹1,180. To remove GST from a GST-inclusive price, divide by 1.18 instead of subtracting 18%. GST rates differ by item, so check the current rate for yours.',
  },
];

export default function PercentageCalculator() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(() => (isPercentMode(params.get('mode')) ? params.get('mode') : 'of'));
  const [values, setValues] = useState(EMPTY_VALUES);

  const modeDef = PERCENT_MODES.find((m) => m.id === mode);
  const view = useMemo(() => describePercentage(mode, values[mode]), [mode, values]);

  const setField = (key, value) => setValues((all) => ({ ...all, [mode]: { ...all[mode], [key]: value } }));
  const setAll = (next) => setValues((all) => ({ ...all, [mode]: { ...next } }));
  const reset = () => setValues((all) => ({ ...all, [mode]: { ...EMPTY_VALUES[mode] } }));

  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="Percentage calculator" icon={Percent}>
        Find a percentage of a number, a sale price after discount, a percentage increase or decrease, or what percent one number is of
        another. Each answer comes with its formula.
      </PageIntro>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="calc-heading" className="card p-5 sm:p-6">
          <h2 id="calc-heading" className="sr-only">
            Calculator
          </h2>
          <fieldset>
            <legend className="label">What do you want to work out?</legend>
            <div className="flex flex-wrap gap-2">
              {PERCENT_MODES.map((m) => (
                <label key={m.id} className="relative">
                  <input type="radio" name="percent-mode" value={m.id} checked={mode === m.id} onChange={() => setMode(m.id)} className="peer sr-only" />
                  <span className="chip cursor-pointer peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent-ink peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                    {m.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {modeDef.fields.map((field) => (
              <NumberField
                key={`${mode}-${field.key}`}
                id={`pct-${mode}-${field.key}`}
                label={field.label}
                prefix={field.prefix}
                suffix={field.suffix}
                placeholder={field.placeholder}
                value={values[mode][field.key]}
                onChange={(v) => setField(field.key, v)}
                error={view.fieldErrors[field.key]}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Try an example:</span>
            {PERCENT_EXAMPLES[mode].map((ex) => (
              <button key={ex.label} type="button" className="chip" onClick={() => setAll(ex.values)}>
                {ex.label}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <button type="button" className="btn btn-secondary" onClick={reset}>
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section aria-labelledby="result-heading" aria-live="polite" className="self-start">
          {view.status === 'ok' ? (
            <>
              <div className="slip">
                <h2 id="result-heading" className="slip-head">
                  Result
                </h2>
                <dl>
                  <SlipRow label={view.headline.label} value={view.headline.value} tone="accent" big />
                  {view.rows.map((row) => (
                    <SlipRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </dl>
              </div>
              <div className="formula mt-4">
                <p className="!my-0 text-sm font-semibold text-ink">How it was worked out</p>
                {view.formula.map((line) => (
                  <p key={line} className="!my-1 text-muted">
                    {line}
                  </p>
                ))}
              </div>
              <div className="mt-4">
                <CopyButton text={view.copyText} />
              </div>
            </>
          ) : (
            <div className="slip">
              <h2 id="result-heading" className="slip-head">
                Result
              </h2>
              <p className="px-4 py-6 text-sm text-muted">
                {view.status === 'empty' && (view.message ?? 'Enter your numbers to see the result.')}
                {view.status === 'invalid' && 'Fix the highlighted number to see the result.'}
                {view.status === 'error' && 'This combination can’t be calculated. See the message beside the highlighted number.'}
              </p>
            </div>
          )}
        </section>
      </div>

      <AdSlot id="ad-percentage" />

      <div className="prose-ec mt-14">
        <h2>How each calculation works</h2>

        <h3>X% of a number</h3>
        <div className="formula">Result = percentage ÷ 100 × number</div>
        <p>15% of 2,400 is 15 ÷ 100 × 2,400 = 360.</p>

        <h3>Discount and final price</h3>
        <div className="formula">
          <p className="!my-0">Discount amount = price × discount % ÷ 100</p>
          <p className="!my-0">Final price = price − discount amount</p>
        </div>
        <p>A 20% discount on ₹2,499 takes off ₹499.80, so you pay ₹1,999.20.</p>

        <h3>Percentage increase or decrease</h3>
        <div className="formula">Change % = (new value − starting value) ÷ |starting value| × 100</div>
        <p>
          A salary that goes from ₹80,000 to ₹92,000 changes by (92,000 − 80,000) ÷ 80,000 × 100 = 15%, an increase. A price that falls from
          500 to 425 changes by −15%, a decrease. The calculator divides by the size of the starting value, so the direction stays correct
          even when the starting value is negative.
        </p>

        <h3>What percent is X of Y</h3>
        <div className="formula">Percent = part ÷ total × 100</div>
        <p>If you scored 432 out of 600, that is 432 ÷ 600 × 100 = 72%.</p>

        <h2>Things worth knowing</h2>
        <ul>
          <li>
            <strong>Percentage points are not percent.</strong> If an interest rate moves from 6% to 8%, it rose by 2 percentage points, but it
            increased by 33.33% (2 ÷ 6).
          </li>
          <li>
            <strong>Up then down does not cancel.</strong> A 20% rise takes 100 to 120. A 20% fall from 120 gives 96, not 100.
          </li>
          <li>
            <strong>Zero as a starting point has no percentage change.</strong> The calculator tells you instead of showing a misleading
            number.
          </li>
          <li>Results are rounded for display only. Calculations use the full numbers you typed.</li>
        </ul>
        <p>
          Working out where your monthly money goes? Try the <Link to="/tools/budget-planner">budget planner</Link>, which shows each
          category as a percentage of your income.
        </p>
      </div>

      <section aria-labelledby="faq-heading" className="mt-12 max-w-3xl">
        <h2 id="faq-heading" className="mb-4 text-2xl font-semibold">
          Percentage questions
        </h2>
        <FaqList items={FAQ} />
      </section>

      <RelatedTools currentId="percentage-calculator" />
    </div>
  );
}
