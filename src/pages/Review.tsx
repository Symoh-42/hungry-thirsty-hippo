import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, Lock, MapPin, Pencil, X } from "lucide-react";
import { siteConfig } from "../../siteConfig";
import {
  generalQuestions,
  offeredServices,
  qrLocations,
  serviceById,
  slugAliases,
  type ServiceId,
} from "@/data/services";
import { delightReasons, enjoyedOptions, improveOptions, issueReasons, NOTHING_TO_IMPROVE, ratingScale } from "@/data/feedback";
import { addReview, DuplicateReviewError } from "@/lib/store";
import type { ReviewDraft } from "@/lib/types";
import { cn, img } from "@/lib/utils";
import { DemoBanner } from "@/components/Layout";
import { BigFaceScale, FaceRow, OptionPill } from "@/components/RatingInputs";
import { Face, Logo, ServiceIcon } from "@/components/ui";

/* ---------- State ---------- */

const DRAFT_KEY = "hth.draft.v1";

const emptyDraft = (): ReviewDraft => ({
  services: [],
  source: undefined,
  overall: 0,
  ratings: {},
  enjoyed: [],
  improve: [],
  issueReasons: [],
  delightReasons: [],
  comment: "",
  guest: { name: "", email: "", phone: "" },
});

function loadDraft(): ReviewDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? { ...emptyDraft(), ...(JSON.parse(raw) as ReviewDraft) } : null;
  } catch {
    return null;
  }
}
function saveDraft(d: ReviewDraft | null) {
  try {
    if (d) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

const guestSchema = z.object({
  name: z.string().trim().max(60, "Please keep your name under 60 characters."),
  email: z.union([z.literal(""), z.string().trim().email("That email address doesn't look right. Check it or leave it blank.")]),
  phone: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{9,18}$/, "Use digits only, e.g. 0712 345 678 or +254 712 345 678. Or leave it blank."),
  ]),
});
type GuestForm = z.infer<typeof guestSchema>;

type Screen =
  | { id: "services"; phase: 0 }
  | { id: "overall"; phase: 1 }
  | { id: `svc:${ServiceId}`; phase: 1; service: ServiceId }
  | { id: "general"; phase: 1 }
  | { id: "sorry"; phase: 1 }
  | { id: "delight"; phase: 1 }
  | { id: "enjoyed"; phase: 2 }
  | { id: "improve"; phase: 2 }
  | { id: "guest"; phase: 3 }
  | { id: "summary"; phase: 4 };

const phases = ["Services", "Ratings", "Feedback", "About you", "Submit"];

function buildScreens(d: ReviewDraft): Screen[] {
  const lowArea = Object.values(d.ratings).some((v) => v <= 2);
  const s: Screen[] = [{ id: "services", phase: 0 }, { id: "overall", phase: 1 }];
  for (const id of d.services) if (serviceById[id].questions.length) s.push({ id: `svc:${id}`, phase: 1, service: id });
  s.push({ id: "general", phase: 1 });
  if ((d.overall > 0 && d.overall <= 2) || lowArea) s.push({ id: "sorry", phase: 1 });
  if (d.overall === 5) s.push({ id: "delight", phase: 1 });
  s.push({ id: "enjoyed", phase: 2 }, { id: "improve", phase: 2 }, { id: "guest", phase: 3 }, { id: "summary", phase: 4 });
  return s;
}

/* ---------- Page ---------- */

export default function Review() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useMemo(() => {
    if (!slug) return undefined;
    const s = slugAliases[slug] ?? slug;
    return qrLocations.find((l) => l.slug === s);
  }, [slug]);

  const [draft, setDraft] = useState<ReviewDraft>(() => {
    if (location) {
      const d = emptyDraft();
      d.source = location.slug;
      if (location.service) d.services = [location.service];
      return d;
    }
    return loadDraft() ?? emptyDraft();
  });
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submitLock = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  const screens = useMemo(() => buildScreens(draft), [draft]);
  const screen = screens[Math.min(index, screens.length - 1)];

  useEffect(() => {
    if (!done) saveDraft(draft);
  }, [draft, done]);

  useEffect(() => {
    document.title = `Leave a Review | ${siteConfig.name}`;
  }, []);

  const update = (patch: Partial<ReviewDraft>) => {
    setError("");
    setDraft((d) => ({ ...d, ...patch }));
  };

  const go = (to: number) => {
    setDir(to > index ? 1 : -1);
    setError("");
    setIndex(Math.max(0, Math.min(to, screens.length - 1)));
    requestAnimationFrame(() => top.current?.scrollIntoView({ block: "start" }));
  };

  const validate = (): string => {
    if (screen.id === "services" && draft.services.length === 0) return "Please choose at least one service you used.";
    if (screen.id === "overall" && !draft.overall) return "Please tap a face to rate your overall experience.";
    return "";
  };

  const next = () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    go(index + 1);
  };

  const submit = async () => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 700)); // feels deliberate; replace with the API call
      addReview({
        ...draft,
        comment: draft.comment.trim(),
        guest: { name: draft.guest.name.trim(), email: draft.guest.email.trim(), phone: draft.guest.phone.trim() },
      });
      saveDraft(null);
      setDone(true);
    } catch (e) {
      if (e instanceof DuplicateReviewError) {
        saveDraft(null);
        setDone(true);
      } else {
        setError("Something went wrong saving your review. Please try again.");
        submitLock.current = false;
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return <ThankYou onHome={() => navigate("/")} />;

  const isGuest = screen.id === "guest";
  const isLast = screen.id === "summary";
  const progress = ((index + 1) / screens.length) * 100;

  return (
    <div className="flex min-h-svh flex-col bg-ivory">
      <DemoBanner />
      {/* Top bar */}
      <div ref={top} className="sticky top-0 z-40 border-b border-line/70 bg-ivory/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" aria-label="Back to home">
            <Logo compact />
          </Link>
          <Link to="/" className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink" aria-label="Exit review">
            <X className="h-5 w-5" />
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3 sm:px-6">
          <ol className="flex gap-1.5" aria-label="Progress">
            {phases.map((p, i) => (
              <li key={p} className="flex-1">
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-colors duration-500",
                    i < screen.phase ? "bg-forest" : i === screen.phase ? "bg-champagne" : "bg-sand",
                  )}
                />
                <span className={cn("mt-1.5 hidden text-[0.65rem] font-semibold tracking-wider uppercase sm:block", i === screen.phase ? "text-forest" : "text-muted/70")}>
                  {p}
                </span>
              </li>
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">
            Step {index + 1} of {screens.length}: {phases[screen.phase]}
          </p>
          <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-transparent sm:hidden">
            <div className="h-full bg-forest/30 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {location && index === 0 && (
        <div className="mx-auto mt-4 w-full max-w-3xl px-4 sm:px-6">
          <p className="flex items-center gap-2 rounded-xl bg-moss px-4 py-2.5 text-sm text-forest">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Scanned at <strong>{location.label}</strong>
              {location.service && " · we've selected it for you"}
            </span>
          </p>
        </div>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-36 sm:px-6 sm:pt-10">
        <div key={screen.id} className="step-in" style={{ "--dir": `${dir * 28}px` } as CSSProperties}>
          {screen.id === "services" && <ServicesStep draft={draft} update={update} />}
          {screen.id === "overall" && (
            <OverallStep
              value={draft.overall}
              onChange={(v) => {
                update({ overall: v });
                setTimeout(() => {
                  setDir(1);
                  setIndex((i) => (i === 1 ? 2 : i));
                }, 450);
              }}
            />
          )}
          {"service" in screen && <ServiceStep id={screen.service} draft={draft} update={update} />}
          {screen.id === "general" && (
            <StepShell eyebrow="Your visit overall" title="And generally speaking…" intro="Skip anything that doesn't apply.">
              <div className="space-y-3">
                {generalQuestions.map((q) => (
                  <FaceRow key={q.key} id={q.key} label={q.label} value={draft.ratings[q.key]} onChange={(v) => update({ ratings: setRating(draft.ratings, q.key, v) })} />
                ))}
              </div>
            </StepShell>
          )}
          {screen.id === "sorry" && (
            <StepShell
              eyebrow="We're listening"
              title="We're sorry your experience wasn't ideal. What went wrong?"
              intro="Choose anything that applies. A manager reviews every one of these."
              icon={<Face level={2} active size={52} />}
            >
              <OptionGrid options={issueReasons} selected={draft.issueReasons} onChange={(v) => update({ issueReasons: v })} tone="warm" />
              <CommentBox value={draft.comment} onChange={(v) => update({ comment: v })} label="Tell us more (optional)" />
            </StepShell>
          )}
          {screen.id === "delight" && (
            <StepShell
              eyebrow="Thank you"
              title="We're delighted you enjoyed your experience! What made it special?"
              icon={<Face level={5} active size={52} />}
            >
              <OptionGrid options={delightReasons} selected={draft.delightReasons} onChange={(v) => update({ delightReasons: v })} />
            </StepShell>
          )}
          {screen.id === "enjoyed" && (
            <StepShell eyebrow="Quick feedback" title="What did you enjoy most?" intro="Tap as many as you like.">
              <OptionGrid options={enjoyedOptions} selected={draft.enjoyed} onChange={(v) => update({ enjoyed: v })} />
            </StepShell>
          )}
          {screen.id === "improve" && (
            <StepShell eyebrow="Quick feedback" title="Is there anything we could improve?">
              <OptionGrid
                options={improveOptions}
                selected={draft.improve}
                onChange={(v) => {
                  const added = v.find((x) => !draft.improve.includes(x));
                  if (added === NOTHING_TO_IMPROVE) update({ improve: [NOTHING_TO_IMPROVE] });
                  else update({ improve: v.filter((x) => x !== NOTHING_TO_IMPROVE) });
                }}
              />
              {!screens.some((s) => s.id === "sorry") && (
                <CommentBox value={draft.comment} onChange={(v) => update({ comment: v })} label="Would you like to tell us anything else?" />
              )}
            </StepShell>
          )}
          {isGuest && (
            <GuestStep
              draft={draft}
              onValid={(g) => {
                update({ guest: { name: g.name, email: g.email, phone: g.phone } });
                go(index + 1);
              }}
            />
          )}
          {isLast && <Summary draft={draft} screens={screens} goTo={(id) => go(screens.findIndex((s) => s.id === id))} />}
        </div>
      </main>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          {error && (
            <p role="alert" className="mb-2 flex items-center gap-2 rounded-lg bg-[#fbeae6] px-3 py-2 text-sm font-medium text-r1">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0 || submitting} className="btn btn-ghost min-h-13 px-5">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
            <span className="hidden flex-1 text-center text-xs text-muted sm:block">
              Step {index + 1} of {screens.length}
            </span>
            {isGuest ? (
              <button type="submit" form="guest-form" className="btn btn-primary min-h-13 flex-1 sm:flex-none sm:px-8">
                Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : isLast ? (
              <button type="button" onClick={submit} disabled={submitting} className="btn btn-gold min-h-13 flex-1 text-base sm:flex-none sm:px-8">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                  </>
                ) : (
                  <>
                    Submit My Review <Check className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            ) : (
              <button type="button" onClick={next} className="btn btn-primary min-h-13 flex-1 sm:flex-none sm:px-8">
                {skipLabel(screen.id, draft)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function skipLabel(id: Screen["id"], d: ReviewDraft) {
  if (id === "enjoyed" && d.enjoyed.length === 0) return "Skip";
  if (id === "improve" && d.improve.length === 0 && !d.comment) return "Skip";
  if ((id === "sorry" && d.issueReasons.length === 0 && !d.comment) || (id === "delight" && d.delightReasons.length === 0)) return "Skip";
  return "Continue";
}

function setRating(r: Record<string, number>, key: string, v: number | undefined) {
  const next = { ...r };
  if (v === undefined) delete next[key];
  else next[key] = v;
  return next;
}

/* ---------- Steps ---------- */

function StepShell({ eyebrow, title, intro, icon, children }: { eyebrow: string; title: string; intro?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section>
      {icon && <div className="mb-4">{icon}</div>}
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 font-display text-[2rem] leading-[1.08] font-medium text-forest sm:text-5xl">{title}</h1>
      {intro && <p className="mt-3 text-base text-muted">{intro}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}

function ServicesStep({ draft, update }: { draft: ReviewDraft; update: (p: Partial<ReviewDraft>) => void }) {
  const toggle = (id: ServiceId) =>
    update({ services: draft.services.includes(id) ? draft.services.filter((s) => s !== id) : [...draft.services, id] });
  return (
    <StepShell eyebrow="Step 1" title="What brought you here?" intro="Select everything you enjoyed today.">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {offeredServices.map((s) => {
          const on = draft.services.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(s.id)}
              className={cn(
                "group relative isolate flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl p-4 text-left text-white transition-all duration-300 active:scale-[0.98] sm:min-h-48 sm:p-5",
                on ? "ring-4 ring-champagne ring-offset-2 ring-offset-ivory" : "ring-1 ring-line",
              )}
            >
              <img src={img(s.image)} alt="" className={cn("absolute inset-0 -z-10 h-full w-full object-cover transition duration-500", on ? "scale-105" : "group-hover:scale-105")} />
              <div className={cn("absolute inset-0 -z-10 transition", on ? "bg-forest-deep/55" : "bg-gradient-to-t from-forest-deep/90 via-forest-deep/45 to-forest-deep/10")} />
              <span
                className={cn(
                  "absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full border-2 transition",
                  on ? "border-champagne bg-champagne text-forest-deep" : "border-white/70 bg-black/10",
                )}
                aria-hidden="true"
              >
                {on && <Check className="h-4 w-4" strokeWidth={3} />}
              </span>
              <ServiceIcon name={s.icon} className="h-7 w-7 text-champagne-light" />
              <span className="mt-2 text-base leading-tight font-semibold sm:text-lg">{s.label}</span>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}

function OverallStep({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <StepShell eyebrow="Step 2" title="Overall, how was your experience?" intro="Tap a face.">
      <div className="rounded-3xl bg-cream/70 p-2 sm:p-4">
        <BigFaceScale value={value || undefined} onChange={onChange} label="Overall experience" />
      </div>
    </StepShell>
  );
}

function ServiceStep({ id, draft, update }: { id: ServiceId; draft: ReviewDraft; update: (p: Partial<ReviewDraft>) => void }) {
  const s = serviceById[id];
  const rated = s.questions.filter((q) => draft.ratings[q.key]).length;
  return (
    <section>
      <div className="relative isolate flex h-28 items-end overflow-hidden rounded-2xl p-4 text-white sm:h-36 sm:p-6">
        <img src={img(s.image)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-deep/90 to-forest-deep/20" />
        <div className="flex items-center gap-3">
          <ServiceIcon name={s.icon} className="h-7 w-7 text-champagne-light" />
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-champagne-light uppercase">Rate your</p>
            <h1 className="font-display text-3xl leading-none font-medium sm:text-4xl">{s.label.split(" / ")[1] ?? s.label}</h1>
          </div>
        </div>
        <span className="absolute top-3 right-3 rounded-full bg-black/30 px-2.5 py-1 text-xs backdrop-blur">
          {rated}/{s.questions.length} rated
        </span>
      </div>
      <p className="mt-4 text-sm text-muted">Tap a face for each. Skip anything that doesn't apply.</p>
      <div className="mt-4 space-y-3">
        {s.questions.map((q) => (
          <FaceRow key={q.key} id={q.key} label={q.label} value={draft.ratings[q.key]} onChange={(v) => update({ ratings: setRating(draft.ratings, q.key, v) })} />
        ))}
      </div>
    </section>
  );
}

function OptionGrid({ options, selected, onChange, tone }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; tone?: "forest" | "warm" }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((o) => (
        <OptionPill
          key={o}
          label={o}
          tone={tone}
          selected={selected.includes(o)}
          onToggle={() => onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o])}
        />
      ))}
    </div>
  );
}

function CommentBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const max = 600;
  return (
    <div className="mt-6">
      <label htmlFor="comment" className="label">
        {label} <span className="font-normal text-muted">(optional)</span>
      </label>
      <textarea
        id="comment"
        rows={3}
        maxLength={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input min-h-28 py-3"
        placeholder="Anything you'd like the team to know…"
      />
      <p className="mt-1 text-right text-xs text-muted tabular-nums">
        {value.length}/{max}
      </p>
    </div>
  );
}

function GuestStep({ draft, onValid }: { draft: ReviewDraft; onValid: (g: GuestForm) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestForm>({
    resolver: zodResolver(guestSchema),
    defaultValues: draft.guest,
  });

  return (
    <StepShell eyebrow="Step 4 · all optional" title="A little about you" intro="Leave these blank to stay anonymous. Your feedback goes to our management team only, and we'd only use your details to follow up with you.">
      <form id="guest-form" noValidate onSubmit={handleSubmit(onValid)} className="space-y-5">
        <Field label="Your name" error={errors.name?.message} htmlFor="g-name">
          <input id="g-name" autoComplete="given-name" className="input" placeholder="e.g. Wanjiru" {...register("name")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email address" error={errors.email?.message} htmlFor="g-email">
            <input id="g-email" type="email" inputMode="email" autoComplete="email" className="input" placeholder="you@example.com" {...register("email")} />
          </Field>
          <Field label="Phone number" error={errors.phone?.message} htmlFor="g-phone">
            <input id="g-phone" type="tel" inputMode="tel" autoComplete="tel" className="input" placeholder="07XX XXX XXX" {...register("phone")} />
          </Field>
        </div>

        <p className="flex items-start gap-2 text-xs text-muted">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Your details are seen only by our management team and are never shared.
        </p>
      </form>
    </StepShell>
  );
}

function Field({ label, error, htmlFor, children }: { label: string; error?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label} <span className="font-normal text-muted">(optional)</span>
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-r1">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

function Summary({ draft, screens, goTo }: { draft: ReviewDraft; screens: Screen[]; goTo: (id: Screen["id"]) => void }) {
  const ratedCount = Object.keys(draft.ratings).length;
  const improve = draft.improve;
  const extraHighlights = [...draft.delightReasons, ...draft.issueReasons];
  return (
    <StepShell eyebrow="Step 5" title="Here's your review" intro="Check it over, then send it to the team.">
      <div className="card divide-y divide-line/70">
        <Row label="Services" onEdit={() => goTo("services")}>
          <div className="flex flex-wrap gap-1.5">
            {draft.services.map((s) => (
              <span key={s} className="chip">
                <ServiceIcon name={serviceById[s].icon} className="h-3.5 w-3.5 text-champagne-deep" /> {serviceById[s].short}
              </span>
            ))}
          </div>
        </Row>
        <Row label="Overall" onEdit={() => goTo("overall")}>
          <span className="flex items-center gap-2 font-semibold">
            <Face level={draft.overall} active size={30} /> {ratingScale[draft.overall - 1]?.label}
          </span>
        </Row>
        <Row label="Ratings" onEdit={() => goTo(screens.find((s) => s.id.startsWith("svc:"))?.id ?? "general")}>
          <span className="text-sm text-muted">
            {ratedCount ? `${ratedCount} area${ratedCount === 1 ? "" : "s"} rated` : "None rated"}
          </span>
          {ratedCount > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(draft.ratings).map(([k, v]) => (
                <span key={k} title={k} className="inline-flex">
                  <Face level={v} active size={18} />
                </span>
              ))}
            </div>
          )}
        </Row>
        {extraHighlights.length > 0 && (
          <Row label={draft.issueReasons.length ? "What went wrong" : "What made it special"} onEdit={() => goTo(draft.issueReasons.length ? "sorry" : "delight")}>
            <Chips items={extraHighlights} />
          </Row>
        )}
        <Row label="Enjoyed most" onEdit={() => goTo("enjoyed")}>
          {draft.enjoyed.length ? <Chips items={draft.enjoyed} /> : <span className="text-sm text-muted">Nothing selected</span>}
        </Row>
        <Row label="Could improve" onEdit={() => goTo("improve")}>
          {improve.length ? <Chips items={improve} /> : <span className="text-sm text-muted">Nothing selected</span>}
        </Row>
        {draft.comment.trim() && (
          <Row label="Your comment" onEdit={() => goTo(screens.some((s) => s.id === "sorry") ? "sorry" : "improve")}>
            <p className="font-display text-lg leading-snug">“{draft.comment.trim()}”</p>
          </Row>
        )}
        <Row label="You" onEdit={() => goTo("guest")}>
          <p className="text-sm">
            {draft.guest.name.trim() || "Anonymous"}
            {(draft.guest.email.trim() || draft.guest.phone.trim()) && (
              <span className="ml-2 text-muted">· {[draft.guest.email.trim(), draft.guest.phone.trim()].filter(Boolean).join(" · ")}</span>
            )}
          </p>
        </Row>
      </div>
    </StepShell>
  );
}

function Row({ label, onEdit, children }: { label: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-[0.68rem] font-semibold tracking-[0.18em] text-muted uppercase">{label}</p>
        {children}
      </div>
      <button type="button" onClick={onEdit} className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-champagne-deep hover:bg-cream">
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
      </button>
    </div>
  );
}

const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((i) => (
      <span key={i} className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">
        {i}
      </span>
    ))}
  </div>
);

/* ---------- Thank you ---------- */

function ThankYou({ onHome }: { onHome: () => void }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        x: (Math.random() - 0.5) * 200,
        r: 360 + Math.random() * 720,
        t: 2.4 + Math.random() * 2,
        d: Math.random() * 600,
        c: ["#c9a96e", "#e8d7b0", "#1e3a2f", "#2e7d55", "#d77a3c"][i % 5],
        w: 6 + Math.random() * 6,
        round: Math.random() < 0.3,
      })),
    [],
  );
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Thank you | ${siteConfig.name}`;
  }, []);
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-forest-deep text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="confetti"
            style={
              {
                left: `${p.left}%`,
                width: p.w,
                height: p.round ? p.w : p.w * 0.45,
                background: p.c,
                borderRadius: p.round ? "50%" : 2,
                "--x": `${p.x}px`,
                "--r": `${p.r}deg`,
                "--t": `${p.t}s`,
                "--d": `${p.d}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <img src={img("naivasha-hippos.jpg")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="relative mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <svg viewBox="0 0 64 64" className="h-24 w-24" aria-hidden="true">
          <circle cx="32" cy="32" r="29" fill="none" stroke="var(--color-champagne)" strokeWidth="2.5" opacity="0.35" />
          <path className="draw" d="M19 33 L28 42 L46 23" fill="none" stroke="var(--color-champagne)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <img src={img("hippo-icon.png")} alt="" className="rise mt-6 h-14 w-14 object-contain" style={{ "--d": "300ms" } as CSSProperties} />
        <h1 className="rise mt-4 font-display text-4xl leading-tight font-medium sm:text-5xl" style={{ "--d": "400ms" } as CSSProperties}>
          Thank You for Sharing Your Experience!
        </h1>
        <p className="rise mt-4 text-lg text-white/80" style={{ "--d": "550ms" } as CSSProperties}>
          Your feedback helps us create even better experiences for every guest.
        </p>
        <div className="rise mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row" style={{ "--d": "700ms" } as CSSProperties}>
          <button type="button" onClick={onHome} className="btn btn-gold min-h-14 px-8 text-base">
            Return to Homepage
          </button>
        </div>
        <p className="mt-10 font-script text-3xl text-champagne-light">Asante sana!</p>
      </div>
    </div>
  );
}
