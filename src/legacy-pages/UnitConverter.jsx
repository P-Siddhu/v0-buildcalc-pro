import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight, RotateCcw, Ruler } from 'lucide-react';
import { CopyButton, NumberField, PageIntro, SelectField, SlipRow } from '../components/ui.jsx';
import FaqList from '../components/FaqList.jsx';
import RelatedTools from '../components/RelatedTools.jsx';
import AdSlot from '../components/AdSlot.jsx';
import { UNIT_CATEGORIES, getCategory, unitLabel } from '../lib/units.js';
import { UNIT_EXAMPLES, describeConversion } from '../lib/unitView.js';
import { formatNumber, parseNumber } from '../lib/format.js';

const FAQ = [
  {
    q: 'Which gallon does this use?',
    a: 'The US gallon (3.785411784 litres). The imperial gallon used in the UK is larger, at 4.54609 litres, and is not included here, so don’t use this converter for imperial gallons.',
  },
  {
    q: 'Which acre and mile are these?',
    a: 'The international acre (4,046.8564224 square metres, or 43,560 square feet) and the international mile (1,609.344 metres). These are the standard modern definitions.',
  },
  {
    q: 'What about bigha, gunta, cent or katha?',
    a: 'Those land units differ from state to state, and sometimes within a state, so a single converter would be wrong for many people. If you need one for your area, a custom calculator can be built around the local definition you confirm.',
  },
  {
    q: 'Why can’t I enter a negative number?',
    a: 'Length, area, weight and volume are not negative amounts, so the converter asks for 0 or more.',
  },
];

function initialState(params) {
  const category = getCategory(params.get('category')) ?? UNIT_CATEGORIES[0];
  const has = (id) => category.units.some((u) => u.id === id);
  const from = has(params.get('from')) ? params.get('from') : category.defaults.from;
  const to = has(params.get('to')) ? params.get('to') : category.defaults.to;
  const rawValue = params.get('value');
  const value = rawValue && parseNumber(rawValue).ok ? rawValue : '1';
  return { categoryId: category.id, value, from, to };
}

export default function UnitConverter() {
  const [params] = useSearchParams();
  const [state, setState] = useState(() => initialState(params));
  const category = getCategory(state.categoryId);
  const view = useMemo(
    () => describeConversion({ categoryId: state.categoryId, value: state.value, fromId: state.from, toId: state.to }),
    [state],
  );

  const options = category.units.map((u) => ({ value: u.id, label: unitLabel(u) }));
  const changeCategory = (id) => {
    const next = getCategory(id);
    setState((s) => ({ ...s, categoryId: id, from: next.defaults.from, to: next.defaults.to }));
  };
  const swap = () => setState((s) => ({ ...s, from: s.to, to: s.from }));
  const reset = () => setState({ categoryId: 'length', value: '1', from: 'km', to: 'mi' });
  const applyExample = (ex) => setState({ categoryId: ex.categoryId, value: ex.value, from: ex.fromId, to: ex.toId });

  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="Unit converter" icon={Ruler}>
        Convert length, area, weight and volume using exact conversion factors. Switch the units with one tap and copy the result.
      </PageIntro>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="converter-heading" className="card p-5 sm:p-6">
          <h2 id="converter-heading" className="sr-only">
            Converter
          </h2>
          <fieldset>
            <legend className="label">What are you measuring?</legend>
            <div className="flex flex-wrap gap-2">
              {UNIT_CATEGORIES.map((c) => (
                <label key={c.id} className="relative">
                  <input type="radio" name="unit-category" value={c.id} checked={state.categoryId === c.id} onChange={() => changeCategory(c.id)} className="peer sr-only" />
                  <span className="chip cursor-pointer peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent-ink peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                    {c.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6">
            <NumberField
              id="unit-value"
              label="Value"
              placeholder="1"
              value={state.value}
              onChange={(v) => setState((s) => ({ ...s, value: v }))}
              error={view.status === 'invalid' || view.status === 'error' ? view.error : null}
            />
          </div>

          <div className="mt-5 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <SelectField id="unit-from" label="From" value={state.from} onChange={(v) => setState((s) => ({ ...s, from: v }))} options={options} />
            <button type="button" className="btn btn-secondary justify-self-center" onClick={swap} aria-label="Swap the two units">
              <ArrowLeftRight size={18} aria-hidden="true" />
              <span className="sm:sr-only">Swap units</span>
            </button>
            <SelectField id="unit-to" label="To" value={state.to} onChange={(v) => setState((s) => ({ ...s, to: v }))} options={options} />
          </div>

          <p className="hint mt-3">{category.note}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Try an example:</span>
            {UNIT_EXAMPLES.map((ex) => (
              <button key={ex.label} type="button" className="chip" onClick={() => applyExample(ex)}>
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

        <section aria-labelledby="converter-result" aria-live="polite" className="self-start">
          <div className="slip">
            <h2 id="converter-result" className="slip-head">
              Result
            </h2>
            {view.status === 'ok' ? (
              <dl>
                <SlipRow label={view.lineText.split(' = ')[0]} value={`${view.resultText} ${view.symbol}`} tone="accent" big />
                <SlipRow label="Conversion factor" value={view.factorText} />
              </dl>
            ) : (
              <p className="px-4 py-6 text-sm text-muted">
                {view.status === 'empty' && 'Enter a value to convert.'}
                {(view.status === 'invalid' || view.status === 'error') && 'Fix the highlighted value to see the result.'}
              </p>
            )}
          </div>

          {view.status === 'ok' && (
            <>
              <div className="mt-4">
                <CopyButton text={view.lineText} />
              </div>
              <div className="slip mt-6">
                <h3 className="slip-head">The same value in every {category.label.toLowerCase()} unit</h3>
                <dl>
                  {view.table.map((row) => (
                    <SlipRow key={row.id} label={row.label} value={row.text} />
                  ))}
                </dl>
              </div>
            </>
          )}
        </section>
      </div>

      <AdSlot id="ad-unit-converter" />

      <div className="prose-ec mt-14">
        <h2>How the converter works</h2>
        <p>
          Every unit is stored as a fixed fraction of one base unit for its type: the metre for length, the square metre for area, the
          kilogram for weight and the cubic metre for volume. To convert, your value is multiplied by the “from” unit’s size and divided by
          the “to” unit’s size.
        </p>
        <div className="formula">Result = value × size of “from” unit ÷ size of “to” unit</div>
        <p>
          For example, 1 acre is 4,046.8564224 m² and 1 sq ft is 0.09290304 m², so 1 acre = 4,046.8564224 ÷ 0.09290304 = 43,560 sq ft.
        </p>

        <h2>Exact factors used</h2>
        <p>These are the sizes behind every conversion. Most are exact by definition.</p>
      </div>

      <div className="mt-4 grid max-w-4xl gap-4 sm:grid-cols-2">
        {UNIT_CATEGORIES.map((c) => (
          <div key={c.id} className="overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <caption className="bg-sunken px-4 py-2.5 text-left text-sm font-semibold text-ink">
                {c.label} (in {c.base}s)
              </caption>
              <tbody className="divide-y divide-line">
                {c.units.map((u) => (
                  <tr key={u.id}>
                    <th scope="row" className="px-4 py-2.5 font-medium text-ink">
                      1 {u.symbol}
                    </th>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">{formatNumber(u.factor, { maxFractionDigits: 12 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="prose-ec mt-8">
        <h2>Good to know</h2>
        <ul>
          <li>Results show up to six decimal places, and more for very small values, with trailing noise removed.</li>
          <li>Indian digit grouping is used, so 1,00,000 means one lakh.</li>
          <li>Local land units such as bigha or gunta are not included because they vary by state.</li>
        </ul>
        <p>
          Converting prices or shares rather than units? The <Link to="/tools/percentage-calculator">percentage calculator</Link> handles
          discounts and increases.
        </p>
      </div>

      <section aria-labelledby="faq-heading" className="mt-12 max-w-3xl">
        <h2 id="faq-heading" className="mb-4 text-2xl font-semibold">
          Unit converter questions
        </h2>
        <FaqList items={FAQ} />
      </section>

      <RelatedTools currentId="unit-converter" />
    </div>
  );
}
