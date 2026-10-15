import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Plus, RotateCcw, Trash2, Wallet } from 'lucide-react';
import { NumberField, PageIntro, SlipRow } from '../components/ui.jsx';
import Callout from '../components/Callout.jsx';
import FaqList from '../components/FaqList.jsx';
import RelatedTools from '../components/RelatedTools.jsx';
import AdSlot from '../components/AdSlot.jsx';
import { LIMITS, SAMPLE_BUDGET, STARTER_CATEGORY_NAMES, cleanName, evaluateBudget } from '../lib/budget.js';
import { formatINR, formatPercent } from '../lib/format.js';
import { sanitizeText } from '../lib/orderMessage.js';
import { downloadBytes } from '../lib/download.js';
import { site } from '../config/site.js';

const FAQ = [
  {
    q: 'Is my budget saved or uploaded?',
    a: 'No. The numbers stay in this page, in your browser. Nothing is saved, so refreshing or closing the tab clears them. The PDF is also created on your device.',
  },
  {
    q: 'Why does the planner show a shortfall instead of savings?',
    a: 'When your expenses add up to more than your income, nothing is left over to save. The planner shows the gap as a shortfall and does not calculate a savings rate, so a negative balance is never presented as savings.',
  },
  {
    q: 'What does “counts as saving” do?',
    a: 'Money you move into a SIP, recurring deposit, PPF or an emergency fund is listed as an expense category, but it is not money spent. Tick the box on those rows and they are counted towards your savings and savings rate.',
  },
  {
    q: 'How should I handle yearly costs such as insurance premiums?',
    a: 'Divide the yearly amount by 12 and enter that as a monthly figure. A ₹24,000 yearly premium becomes ₹2,000 a month.',
  },
];

export default function BudgetPlanner() {
  const nextId = useRef(1);
  const makeCategory = (name = '', amount = '', isSaving = false) => ({ id: nextId.current++, name, amount, isSaving });

  const [income, setIncome] = useState('');
  const [period, setPeriod] = useState('');
  const [categories, setCategories] = useState(() => STARTER_CATEGORY_NAMES.map((name) => makeCategory(name)));
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [notice, setNotice] = useState('');
  const [pdf, setPdf] = useState({ state: 'idle', message: '' });
  const expensesHeading = useRef(null);

  const result = useMemo(() => evaluateBudget({ income, categories }), [income, categories]);
  const atLimit = categories.length >= LIMITS.maxCategories;

  function updateCategory(id, patch) {
    setCategories((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCategory(id) {
    const removed = categories.find((c) => c.id === id);
    setCategories((list) => list.filter((c) => c.id !== id));
    setNotice(`Removed ${cleanName(removed?.name) || 'category'}.`);
    expensesHeading.current?.focus();
  }

  function addCategory(event) {
    event.preventDefault();
    const name = cleanName(newName);
    if (!name) {
      setAddError('Enter a category name, for example “Tuition fees”.');
      return;
    }
    if (atLimit) {
      setAddError(`You can add up to ${LIMITS.maxCategories} categories.`);
      return;
    }
    setCategories((list) => [...list, makeCategory(name)]);
    setNewName('');
    setAddError('');
    setNotice(`Added ${name}. Enter its monthly amount.`);
  }

  function reset() {
    setIncome('');
    setPeriod('');
    setCategories(STARTER_CATEGORY_NAMES.map((name) => makeCategory(name)));
    setNewName('');
    setAddError('');
    setPdf({ state: 'idle', message: '' });
    setNotice('The planner was cleared.');
  }

  function loadSample() {
    setIncome(SAMPLE_BUDGET.income);
    setPeriod('Sample month');
    setCategories(SAMPLE_BUDGET.categories.map((c) => makeCategory(c.name, c.amount, c.isSaving)));
    setAddError('');
    setNotice('Sample numbers loaded. They are for illustration only.');
  }

  async function downloadPdf() {
    setPdf({ state: 'working', message: 'Creating your PDF…' });
    try {
      const { buildBudgetReport, budgetReportFilename } = await import('../lib/pdf/budgetReport.js');
      const now = new Date();
      const { bytes, replacedCharacters } = await buildBudgetReport({
        income,
        categories,
        periodLabel: sanitizeText(period, { maxLength: 40 }),
        generatedAt: now,
        siteLabel: site.url.replace(/^https?:\/\//, ''),
      });
      downloadBytes(bytes, budgetReportFilename(now), 'application/pdf');
      setPdf({
        state: 'done',
        message:
          replacedCharacters > 0
            ? 'Your PDF was created. Some characters in your category names (such as emoji or non-Latin scripts) can’t be shown in a PDF yet and appear as “?”.'
            : 'Your PDF was created. Check your downloads folder.',
      });
    } catch {
      setPdf({ state: 'error', message: 'We couldn’t create the PDF. Check the highlighted fields and try again.' });
    }
  }

  const shortfall = result.status === 'shortfall';
  const nameCounts = categories.length;
  const sortedRows = useMemo(() => [...result.rows].sort((a, b) => b.paise - a.paise), [result.rows]);

  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="Monthly budget planner" icon={Wallet}>
        Enter your income and the expense categories you actually use. See what is left each month, your savings rate, and download a PDF
        report. Everything is calculated in your browser.
      </PageIntro>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23.5rem]">
        {/* ---------- Inputs ---------- */}
        <section aria-labelledby="inputs-heading" className="card p-5 sm:p-6">
          <h2 id="inputs-heading" className="sr-only">
            Your income and expenses
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="income"
              label="Monthly income (after tax)"
              prefix="₹"
              placeholder="50000"
              value={income}
              onChange={setIncome}
              error={result.incomeError}
              hint="Money that reaches your account each month."
            />
            <div>
              <label htmlFor="period" className="label">
                Label for the report (optional)
              </label>
              <input
                id="period"
                type="text"
                className="input"
                maxLength={40}
                placeholder="October 2026"
                autoComplete="off"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
              <p className="hint mt-1.5">Printed at the top of the PDF.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 ref={expensesHeading} tabIndex={-1} className="text-xl font-semibold outline-none">
                Monthly expenses
              </h3>
              <p className="hint mt-1">
                {nameCounts} {nameCounts === 1 ? 'category' : 'categories'}. Leave a row blank if it doesn’t apply.
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={loadSample}>
                Load sample numbers
              </button>
              <button type="button" className="btn btn-secondary" onClick={reset}>
                <RotateCcw size={16} aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          {categories.length === 0 && (
            <p className="mt-5 rounded-card border border-dashed border-line p-5 text-center text-muted">
              No categories yet. Add one below, such as “Rent” or “Groceries”.
            </p>
          )}

          <ul className="mt-5 space-y-4">
            {categories.map((cat, index) => {
              const row = result.rows[index];
              const label = cleanName(cat.name) || `category ${index + 1}`;
              const nameId = `cat-name-${cat.id}`;
              const amountId = `cat-amount-${cat.id}`;
              const showNameError = Boolean(row.nameError);
              return (
                <li key={cat.id} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9.5rem_auto_auto] sm:items-start">
                  <div>
                    <label htmlFor={nameId} className="sr-only">
                      Category name
                    </label>
                    <input
                      id={nameId}
                      type="text"
                      className={`input ${showNameError ? 'input-error' : ''}`}
                      value={cat.name}
                      maxLength={LIMITS.maxNameLength}
                      placeholder="Category name"
                      autoComplete="off"
                      aria-invalid={showNameError ? 'true' : undefined}
                      onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor={amountId} className="sr-only">
                      Monthly amount for {label}
                    </label>
                    <div className="relative">
                      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                        ₹
                      </span>
                      <input
                        id={amountId}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="0"
                        value={cat.amount}
                        aria-invalid={row.amountError ? 'true' : undefined}
                        aria-describedby={row.amountError ? `${amountId}-error` : undefined}
                        className={`input pl-8 ${row.amountError ? 'input-error' : ''}`}
                        onChange={(e) => updateCategory(cat.id, { amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-accent"
                      checked={cat.isSaving}
                      onChange={(e) => updateCategory(cat.id, { isSaving: e.target.checked })}
                    />
                    Counts as saving
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost justify-self-start !px-3 sm:justify-self-end"
                    aria-label={`Remove ${label}`}
                    onClick={() => removeCategory(cat.id)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                    <span className="sm:sr-only">Remove</span>
                  </button>
                  {(row.amountError || showNameError) && (
                    <p id={`${amountId}-error`} className="text-sm font-medium text-danger sm:col-span-4">
                      {row.amountError || row.nameError}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <form onSubmit={addCategory} className="mt-6 border-t border-line pt-6" noValidate>
            <label htmlFor="new-category" className="label">
              Add your own category
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="new-category"
                type="text"
                className={`input ${addError ? 'input-error' : ''}`}
                value={newName}
                maxLength={LIMITS.maxNameLength}
                placeholder="For example: Tuition fees"
                autoComplete="off"
                aria-invalid={addError ? 'true' : undefined}
                aria-describedby={addError ? 'new-category-error' : undefined}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (addError) setAddError('');
                }}
              />
              <button type="submit" className="btn btn-primary shrink-0" disabled={atLimit}>
                <Plus size={18} aria-hidden="true" />
                Add category
              </button>
            </div>
            {addError && (
              <p id="new-category-error" className="mt-1.5 text-sm font-medium text-danger">
                {addError}
              </p>
            )}
            {atLimit && !addError && <p className="hint mt-1.5">You’ve reached the limit of {LIMITS.maxCategories} categories.</p>}
          </form>

          <p role="status" aria-live="polite" className="mt-4 min-h-[1.5rem] text-sm text-muted">
            {notice}
          </p>
        </section>

        {/* ---------- Results ---------- */}
        <aside aria-labelledby="results-heading" className="self-start lg:sticky lg:top-24">
          <div className="slip">
            <h2 id="results-heading" className="slip-head">
              Your month at a glance
            </h2>
            <dl>
              <SlipRow label="Income" value={result.incomeProvided ? formatINR(result.income) : '—'} />
              <SlipRow label="Total expenses" value={formatINR(result.totalExpenses)} />
              {result.status === 'no-income' && (
                <div className="px-4 py-4 text-sm text-muted">Enter your monthly income to see what is left and your savings rate.</div>
              )}
              {shortfall && <SlipRow label="Shortfall" value={formatINR(result.shortfall)} tone="danger" big />}
              {!shortfall && result.status !== 'no-income' && (
                <SlipRow label="Left after expenses" value={formatINR(result.remaining)} tone="accent" big />
              )}
              {result.savedByCategory > 0 && !shortfall && result.status !== 'no-income' && (
                <>
                  <SlipRow label="Counted as saving" value={formatINR(result.savedByCategory)} />
                  <SlipRow label="Total savings" value={formatINR(result.savings)} />
                </>
              )}
              {result.status !== 'no-income' && (
                <SlipRow
                  label="Savings rate"
                  value={
                    result.savingsRate !== null
                      ? formatPercent(result.savingsRate)
                      : shortfall
                        ? 'Not applicable'
                        : 'Needs income above 0'
                  }
                />
              )}
            </dl>
          </div>

          {shortfall && (
            <Callout tone="danger" title="Spending is higher than income" className="mt-4">
              Your expenses are {formatINR(result.shortfall)}
              {result.shortfallPercent !== null ? ` (${formatPercent(result.shortfallPercent)} of income)` : ''} above your income. That gap is a
              shortfall, not savings, so no savings rate is shown.
            </Callout>
          )}
          {result.status === 'balanced' && (
            <Callout tone="info" className="mt-4">
              Your expenses equal your income, so nothing is left over this month.
            </Callout>
          )}

          <BreakdownBar result={result} />

          <div className="mt-5">
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={downloadPdf}
              disabled={!result.canExport || pdf.state === 'working'}
              aria-describedby="pdf-help"
            >
              <Download size={18} aria-hidden="true" />
              {pdf.state === 'working' ? 'Creating PDF…' : 'Download PDF report'}
            </button>
            <p id="pdf-help" className="hint mt-2">
              {result.canExport
                ? 'Free. Created on your device, not uploaded.'
                : result.hasRowErrors
                  ? 'Fix the highlighted rows to enable the PDF.'
                  : 'Enter a valid monthly income to enable the PDF.'}
            </p>
            <p
              role={pdf.state === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={`mt-2 text-sm ${pdf.state === 'error' ? 'font-medium text-danger' : 'text-muted'}`}
            >
              {pdf.message}
            </p>
          </div>
        </aside>
      </div>

      {/* ---------- Breakdown table ---------- */}
      {result.totalExpenses > 0 && (
        <section aria-labelledby="breakdown-heading" className="mt-10">
          <h2 id="breakdown-heading" className="text-2xl font-semibold">
            Breakdown by category
          </h2>
          <div className="mt-4 overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <caption className="sr-only">Expenses by category, largest first</caption>
              <thead className="bg-sunken text-ink">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">% of income</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">% of expenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sortedRows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="px-4 py-3 font-medium text-ink">
                      {row.name || 'Unnamed category'}
                      {row.isSaving && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-ink">saving</span>}
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatINR(row.amount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.percentOfIncome === null ? 'n/a' : formatPercent(row.percentOfIncome)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.percentOfExpenses === null ? 'n/a' : formatPercent(row.percentOfExpenses)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-line bg-sunken font-semibold">
                <tr>
                  <th scope="row" className="px-4 py-3">Total expenses</th>
                  <td className="px-4 py-3 text-right tabular-nums">{formatINR(result.totalExpenses)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {result.income > 0 ? formatPercent((result.totalExpenses / result.income) * 100) : 'n/a'}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      <AdSlot id="ad-budget-planner" />

      {/* ---------- Explanation ---------- */}
      <div className="prose-ec mt-14">
        <h2>How the budget planner works</h2>
        <p>
          Type your monthly income, then enter an amount for each expense category. The totals update as you type. Rename, add or remove
          categories so the list matches how you really spend, whether that is “Tiffin”, “School van” or “Gold chit fund”.
        </p>
        <div className="formula">
          <p className="!my-0"><strong>Remaining balance</strong> = monthly income − total expenses</p>
          <p className="!my-0"><strong>Savings rate</strong> = savings ÷ monthly income × 100</p>
        </div>
        <p>
          The savings rate is only calculated when your income is above zero and your expenses do not exceed it. If you spend more than you
          earn, the planner shows a <strong>shortfall</strong> instead, because a negative balance is not savings.
        </p>

        <h2>A worked example</h2>
        <p>
          Suppose your income is ₹50,000 and your expenses total ₹38,500, including ₹5,000 into a SIP that you have ticked as “counts as
          saving”.
        </p>
        <ul>
          <li>Remaining balance: ₹50,000 − ₹38,500 = ₹11,500</li>
          <li>Savings: ₹11,500 left over + ₹5,000 SIP = ₹16,500</li>
          <li>Savings rate: ₹16,500 ÷ ₹50,000 × 100 = 33%</li>
        </ul>
        <p>
          Press “Load sample numbers” above to see this example in the planner. The sample is only an illustration, not a recommendation for
          how much anyone should save.
        </p>

        <h2>Getting more accurate numbers</h2>
        <ul>
          <li>Use the last two or three months of bank or UPI statements instead of memory.</li>
          <li>Spread yearly costs across 12 months: insurance premiums, school fees, festival spending.</li>
          <li>Keep an “Other” row for small things so they are not forgotten.</li>
          <li>Enter amounts in rupees with up to two decimal places. Commas such as 1,00,000 are fine.</li>
        </ul>
        <p>
          Want the same numbers laid out in a spreadsheet you can keep updating, or a report written around your situation? See the{' '}
          <Link to="/services">paid services</Link>. The planner and its PDF stay free.
        </p>
      </div>

      <section aria-labelledby="faq-heading" className="mt-12 max-w-3xl">
        <h2 id="faq-heading" className="mb-4 text-2xl font-semibold">
          Budget planner questions
        </h2>
        <FaqList items={FAQ} />
        <p className="hint mt-4">This planner is a calculator, not financial advice.</p>
      </section>

      <RelatedTools currentId="budget-planner" />
    </div>
  );
}

/** Where income goes: spent, saved, left. Labels and numbers make the colours optional. */
function BreakdownBar({ result }) {
  if (!result.incomeProvided || result.income <= 0 || result.status === 'shortfall') return null;
  const spendPct = (result.spending / result.income) * 100;
  const savedPct = (result.savedByCategory / result.income) * 100;
  const leftPct = (result.remaining / result.income) * 100;
  return (
    <div className="mt-4 rounded-card border border-line bg-surface p-4">
      <p className="text-sm font-semibold text-ink">Where your income goes</p>
      <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-sunken" role="img" aria-label={`Spent ${formatPercent(spendPct)}, saved ${formatPercent(savedPct)}, left over ${formatPercent(leftPct)} of income`}>
        <div className="bg-ink/70" style={{ width: `${spendPct}%` }} />
        <div className="bg-accent" style={{ width: `${savedPct}%` }} />
        <div className="bg-accent/30" style={{ width: `${leftPct}%` }} />
      </div>
      <ul className="mt-3 space-y-1 text-sm text-muted">
        <li><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-ink/70" aria-hidden="true" />Spent: {formatPercent(spendPct)}</li>
        {result.savedByCategory > 0 && (
          <li><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />Set aside as saving: {formatPercent(savedPct)}</li>
        )}
        <li><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-accent/30" aria-hidden="true" />Left over: {formatPercent(leftPct)}</li>
      </ul>
    </div>
  );
}
