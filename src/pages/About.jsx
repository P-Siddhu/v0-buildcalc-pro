import { Link } from 'react-router-dom';
import { PageIntro } from '../components/ui.jsx';

export default function About() {
  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="About EverydayCalc">
        A small collection of free calculators for everyday decisions, with optional personalised help when a calculator is not enough.
      </PageIntro>
      <div className="prose-ec mt-8">
        <h2>What it is</h2>
        <p>
          EverydayCalc started from a simple idea: the calculations people do most often, such as planning a month’s money, working out a
          discount or converting an area, should be quick, clear and free. Each tool shows its formula and a worked example so you can check
          the answer yourself.
        </p>

        <h2>How it is paid for</h2>
        <ul>
          <li>The calculators are free to use in full, with no sign-up.</li>
          <li>
            Some people want a spreadsheet, report or calculator built around their own numbers. That is offered as a paid, clearly scoped
            service. See <Link to="/services">Services</Link>.
          </li>
          <li>There are no advertisements on the site at the moment.</li>
        </ul>

        <h2>How it handles your numbers</h2>
        <p>
          The calculators run in your browser, and the figures you type are not sent to us. The{' '}
          <Link to="/privacy">privacy notice</Link> explains what is and isn’t stored.
        </p>

        <h2>What it is not</h2>
        <ul>
          <li>EverydayCalc is not a bank, an investment adviser or a tax or legal professional.</li>
          <li>It does not recommend financial products or predict returns.</li>
          <li>Results are only as good as the numbers you enter. Check anything important against your own records.</li>
        </ul>

        <h2>How the formulas are checked</h2>
        <p>
          The core calculations (percentages, unit conversions, budget totals) are covered by automated tests in the website’s source code,
          using values worked out independently. That reduces mistakes but cannot rule them out. If you spot a wrong result,{' '}
          <Link to="/contact">please tell us</Link>.
        </p>
      </div>
    </div>
  );
}
