import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import { CopyButton, PageIntro } from '../components/ui.jsx';
import Callout from '../components/Callout.jsx';
import { services, getService } from '../config/pricing.js';
import { hasContactMethod, site } from '../config/site.js';
import { formatPrice, priceNote } from '../lib/pricing.js';
import { formatDateLong, toISODate } from '../lib/format.js';
import { ORDER_LIMITS, buildEnquiryMessage, buildMailtoUrl, buildWhatsAppUrl, validateOrder } from '../lib/orderMessage.js';

const FIELD_IDS = {
  serviceId: 'order-service-first',
  name: 'order-name',
  contact: 'order-contact',
  requirements: 'order-requirements',
  deadline: 'order-deadline',
  consent: 'order-consent',
};

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-danger">
      {children}
    </p>
  );
}

export default function Order() {
  const [params] = useSearchParams();
  const [fields, setFields] = useState(() => ({
    serviceId: getService(params.get('service')) ? params.get('service') : '',
    name: '',
    contact: '',
    requirements: '',
    deadline: '',
    consent: false,
  }));
  const [errors, setErrors] = useState({});
  const [prepared, setPrepared] = useState(null);
  const summaryRef = useRef(null);
  const readyRef = useRef(null);

  const todayISO = toISODate(new Date());
  const service = getService(fields.serviceId);
  const errorEntries = useMemo(() => Object.entries(errors), [errors]);

  const set = (key, value) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    setPrepared(null);
  };

  function focusField(key) {
    document.getElementById(FIELD_IDS[key])?.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateOrder(fields, { services, todayISO });
    if (!result.valid) {
      setErrors(result.errors);
      setPrepared(null);
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    setErrors({});
    const chosen = getService(result.values.serviceId);
    const [y, m, d] = result.values.deadline ? result.values.deadline.split('-').map(Number) : [];
    const message = buildEnquiryMessage({
      service: chosen,
      priceText: formatPrice(chosen.price),
      values: result.values,
      deadlineText: result.values.deadline ? formatDateLong(new Date(y, m - 1, d)) : undefined,
    });
    const subject = `Enquiry: ${chosen.title}`;
    setPrepared({
      message,
      mailto: site.contact.email ? buildMailtoUrl(site.contact.email, subject, message) : '',
      whatsapp: site.contact.whatsappDigits ? buildWhatsAppUrl(site.contact.whatsappDigits, message) : '',
    });
    setTimeout(() => readyRef.current?.focus(), 0);
  }

  return (
    <div className="wrap py-10 sm:py-14">
      <PageIntro title="Order a service">
        Tell us what you need and we will prepare a message you can send by email or WhatsApp. This page does not send anything by itself, and
        you pay nothing until the scope and price are agreed.
      </PageIntro>

      {!hasContactMethod && (
        <Callout tone="warn" title="Contact details are not set up on this site yet" className="mt-8 max-w-3xl">
          You can still prepare and copy your message below, but the “send” buttons need an email address or WhatsApp number to be configured
          by the site owner (see the README).
        </Callout>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <form onSubmit={handleSubmit} noValidate className="card space-y-7 p-5 sm:p-6" aria-labelledby="form-heading">
          <h2 id="form-heading" className="sr-only">
            Enquiry form
          </h2>

          {errorEntries.length > 0 && (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-card border border-danger/30 bg-danger-soft p-4 text-sm text-danger outline-none">
              <p className="font-semibold">Please fix {errorEntries.length === 1 ? 'this' : 'these'} before continuing:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errorEntries.map(([key, message]) => (
                  <li key={key}>
                    <a
                      href={`#${FIELD_IDS[key]}`}
                      className="underline underline-offset-2"
                      onClick={(e) => {
                        e.preventDefault();
                        focusField(key);
                      }}
                    >
                      {message}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <fieldset>
            <legend className="label">Service</legend>
            <div className="space-y-2.5" role="radiogroup" aria-describedby={errors.serviceId ? 'order-service-error' : undefined}>
              {services.map((s, i) => (
                <label key={s.id} className="relative block">
                  <input
                    type="radio"
                    name="service"
                    value={s.id}
                    checked={fields.serviceId === s.id}
                    onChange={() => set('serviceId', s.id)}
                    className="peer sr-only"
                    id={i === 0 ? 'order-service-first' : undefined}
                  />
                  <span className="flex cursor-pointer items-center justify-between gap-4 rounded-card border border-line bg-surface p-4 transition-colors hover:bg-sunken peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                    <span className="font-medium text-ink">{s.title}</span>
                    <span className="shrink-0 font-semibold text-accent-ink">{formatPrice(s.price)}</span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError id="order-service-error">{errors.serviceId}</FieldError>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={FIELD_IDS.name} className="label">
                Your name
              </label>
              <input
                id={FIELD_IDS.name}
                type="text"
                autoComplete="name"
                maxLength={ORDER_LIMITS.name}
                className={`input ${errors.name ? 'input-error' : ''}`}
                value={fields.name}
                onChange={(e) => set('name', e.target.value)}
                aria-invalid={errors.name ? 'true' : undefined}
                aria-describedby={errors.name ? 'order-name-error' : undefined}
              />
              <FieldError id="order-name-error">{errors.name}</FieldError>
            </div>
            <div>
              <label htmlFor={FIELD_IDS.contact} className="label">
                Email or WhatsApp number
              </label>
              <input
                id={FIELD_IDS.contact}
                type="text"
                autoComplete="off"
                maxLength={ORDER_LIMITS.contact}
                className={`input ${errors.contact ? 'input-error' : ''}`}
                value={fields.contact}
                onChange={(e) => set('contact', e.target.value)}
                aria-invalid={errors.contact ? 'true' : undefined}
                aria-describedby={errors.contact ? 'order-contact-error' : 'order-contact-hint'}
              />
              {errors.contact ? (
                <FieldError id="order-contact-error">{errors.contact}</FieldError>
              ) : (
                <p id="order-contact-hint" className="hint mt-1.5">
                  So we know where to reply.
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor={FIELD_IDS.requirements} className="label">
              What do you need?
            </label>
            <textarea
              id={FIELD_IDS.requirements}
              rows={6}
              maxLength={ORDER_LIMITS.requirements}
              className={`input min-h-[9rem] ${errors.requirements ? 'input-error' : ''}`}
              value={fields.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              aria-invalid={errors.requirements ? 'true' : undefined}
              aria-describedby={errors.requirements ? 'order-requirements-error' : 'order-requirements-hint'}
            />
            {errors.requirements ? (
              <FieldError id="order-requirements-error">{errors.requirements}</FieldError>
            ) : (
              <p id="order-requirements-hint" className="hint mt-1.5">
                Describe the task, your categories or the numbers you will share. Don’t include bank account numbers, card details or
                passwords. {fields.requirements.length}/{ORDER_LIMITS.requirements}
              </p>
            )}
          </div>

          <div className="sm:max-w-xs">
            <label htmlFor={FIELD_IDS.deadline} className="label">
              Preferred deadline (optional)
            </label>
            <input
              id={FIELD_IDS.deadline}
              type="date"
              min={todayISO}
              className={`input ${errors.deadline ? 'input-error' : ''}`}
              value={fields.deadline}
              onChange={(e) => set('deadline', e.target.value)}
              aria-invalid={errors.deadline ? 'true' : undefined}
              aria-describedby={errors.deadline ? 'order-deadline-error' : undefined}
            />
            <FieldError id="order-deadline-error">{errors.deadline}</FieldError>
          </div>

          <div className="rounded-card border border-line bg-sunken p-4 text-sm leading-6 text-muted">
            <p className="font-semibold text-ink">Privacy notice</p>
            <p className="mt-1">
              What you type here stays in this page until you choose to send it. This site has no server that receives it. When you send the
              message, it travels through your email or WhatsApp provider to us, and we use it only to answer your enquiry. Read the full{' '}
              <Link to="/privacy" className="font-medium text-accent underline underline-offset-2">
                privacy notice
              </Link>
              .
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-3 text-ink">
              <input
                id={FIELD_IDS.consent}
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
                checked={fields.consent}
                onChange={(e) => set('consent', e.target.checked)}
                aria-invalid={errors.consent ? 'true' : undefined}
                aria-describedby={errors.consent ? 'order-consent-error' : undefined}
              />
              <span>I have read the privacy notice.</span>
            </label>
            <FieldError id="order-consent-error">{errors.consent}</FieldError>
          </div>

          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Prepare my enquiry
          </button>
        </form>

        {/* ---------- Price summary ---------- */}
        <aside aria-labelledby="summary-heading" className="self-start lg:sticky lg:top-24">
          <div className="slip">
            <h2 id="summary-heading" className="slip-head">
              Price summary
            </h2>
            {service ? (
              <div className="space-y-3 px-4 py-4 text-sm">
                <p className="font-medium text-ink">{service.title}</p>
                <p className="font-serif text-3xl font-semibold text-accent">{formatPrice(service.price)}</p>
                <p className="text-muted">{priceNote(service.price)}</p>
                <p className="text-muted">
                  <span className="font-medium text-ink">Delivery:</span> {service.delivery}
                </p>
                <p className="text-muted">
                  <span className="font-medium text-ink">Revisions:</span> {service.revisions}
                </p>
                <p className="border-t border-dashed border-line pt-3 text-muted">
                  <span className="font-medium text-ink">Due now: ₹0.</span> Payment is requested only after we confirm the scope.
                </p>
                <Link to={`/services#${service.id}`} className="inline-block font-medium text-accent underline underline-offset-2">
                  See what’s included
                </Link>
              </div>
            ) : (
              <p className="px-4 py-6 text-sm text-muted">Choose a service to see its price and what’s included.</p>
            )}
          </div>
        </aside>
      </div>

      {/* ---------- Prepared message ---------- */}
      {prepared && (
        <section ref={readyRef} tabIndex={-1} aria-labelledby="ready-heading" className="card mt-10 max-w-3xl p-5 outline-none sm:p-6">
          <h2 id="ready-heading" className="text-2xl font-semibold">
            Your enquiry is ready, but it has not been sent
          </h2>
          <p className="mt-2 text-muted">Check the message, then send it using one of the options below. We only receive it once you send it.</p>
          <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-card border border-line bg-sunken p-4 font-sans text-sm leading-6 text-ink">
            {prepared.message}
          </pre>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {prepared.mailto && (
              <a href={prepared.mailto} className="btn btn-primary">
                <Mail size={18} aria-hidden="true" />
                Send by email
              </a>
            )}
            {prepared.whatsapp && (
              <a href={prepared.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <MessageCircle size={18} aria-hidden="true" />
                Send on WhatsApp
              </a>
            )}
            <CopyButton text={prepared.message} label="Copy message" />
          </div>
          {!prepared.mailto && !prepared.whatsapp && (
            <Callout tone="warn" className="mt-4">
              No email address or WhatsApp number is configured on this site yet, so there is nowhere to send this. Copy the message and send it
              once contact details are available.
            </Callout>
          )}

          <h3 className="mt-8 text-lg font-semibold">What happens next</h3>
          <ol className="prose-ec mt-2">
            <li>You send the message. Until you do, we have not received anything.</li>
            <li>We reply as soon as we can to confirm the scope, the final price and a delivery date. There is no guaranteed reply time.</li>
            <li>If you agree, we send payment instructions. If you do not, you owe nothing.</li>
            <li>After we have confirmed your payment, we deliver the file by email or WhatsApp.</li>
          </ol>
          <p className="hint mt-3">We never ask for a UPI PIN, OTP, card details or passwords.</p>
        </section>
      )}
    </div>
  );
}
