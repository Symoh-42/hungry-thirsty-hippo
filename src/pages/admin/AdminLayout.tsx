import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChart3, ExternalLink, Inbox, LayoutDashboard, Lock, LogOut, QrCode, RotateCcw, Trash2 } from "lucide-react";
import { demoBanner, siteConfig } from "../../../siteConfig";
import { clearSampleReviews, isAdmin, restoreSampleReviews, setAdmin, useReviews } from "@/lib/store";
import { cn } from "@/lib/utils";
import { DemoBanner } from "@/components/Layout";
import { Logo } from "@/components/ui";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/reviews", label: "Reviews", icon: Inbox },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/qr", label: "QR codes", icon: QrCode },
];

export default function AdminLayout() {
  const [authed, setAuthed] = useState(isAdmin());
  const reviews = useReviews();
  const pending = reviews.filter((r) => r.status === "pending" && r.publishConsent).length;
  const hasSample = reviews.some((r) => r.sample);
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = `Management | ${siteConfig.name}`;
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-svh bg-[#f6f3ed]">
      <DemoBanner />
      <div className="lg:flex">
        <aside className="no-print bg-forest-deep text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6 lg:py-6">
            <Link to="/" aria-label="View website">
              <Logo light compact />
            </Link>
            <button
              type="button"
              onClick={() => {
                setAdmin(false);
                setAuthed(false);
              }}
              className="grid h-10 w-10 place-items-center rounded-full text-white/70 hover:bg-white/10 lg:hidden"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <p className="hidden px-6 text-[0.65rem] font-semibold tracking-[0.25em] text-champagne uppercase lg:block">Management</p>
          <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-3 lg:flex-col lg:px-3">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 text-sm font-medium transition",
                    isActive ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
                  )
                }
              >
                <n.icon className="h-4.5 w-4.5" aria-hidden="true" />
                {n.label}
                {n.label === "Reviews" && pending > 0 && (
                  <span className="ml-auto rounded-full bg-champagne px-2 py-0.5 text-[0.65rem] font-bold text-forest-deep">{pending}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="hidden flex-1 lg:block" />
          <div className="hidden space-y-1 border-t border-white/10 p-3 text-sm lg:block">
            {siteConfig.sampleReviews && (
              <>
                <p className="px-3 pt-1 pb-2 text-[0.65rem] font-semibold tracking-[0.2em] text-white/40 uppercase">Demo data</p>
                {hasSample ? (
                  <button
                    type="button"
                    onClick={() => confirm("Remove all sample reviews? Reviews submitted on this device are kept.") && clearSampleReviews()}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-white/65 hover:bg-white/5 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear sample reviews
                  </button>
                ) : (
                  <button type="button" onClick={restoreSampleReviews} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-white/65 hover:bg-white/5 hover:text-white">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> Restore sample reviews
                  </button>
                )}
              </>
            )}
            <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-white/65 hover:bg-white/5 hover:text-white">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> View website
            </Link>
            <button
              type="button"
              onClick={() => {
                setAdmin(false);
                setAuthed(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-white/65 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {hasSample && (
            <p className="no-print mb-6 rounded-xl border border-amber-400/40 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Demo mode:</strong> the dashboard includes sample reviews so the charts have data. Reviews you submit at{" "}
              <Link to="/review" className="font-semibold underline">
                /review
              </Link>{" "}
              on this device appear here instantly.
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim() === siteConfig.adminPasscode) {
      setAdmin(true);
      onSuccess();
    } else {
      setError("That passcode isn't right. Please try again.");
    }
  };
  return (
    <div className="flex min-h-svh flex-col bg-forest-deep">
      <DemoBanner />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-ivory p-8 shadow-lift">
          <Logo />
          <div className="mt-8 flex items-center gap-2 text-forest">
            <Lock className="h-5 w-5" aria-hidden="true" />
            <h1 className="text-3xl font-medium">Management</h1>
          </div>
          <p className="mt-2 text-sm text-muted">Sign in to view guest feedback.</p>
          <label htmlFor="code" className="label mt-6">
            Passcode
          </label>
          <input
            id="code"
            type="password"
            autoComplete="current-password"
            className="input"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "code-err" : undefined}
          />
          {error && (
            <p id="code-err" role="alert" className="mt-2 text-sm text-r1">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full">
            Sign in
          </button>
          {demoBanner.enabled && (
            <p className="mt-5 rounded-lg bg-cream px-3 py-2 text-xs text-muted">
              Demo passcode: <code className="font-semibold text-ink">{siteConfig.adminPasscode}</code>. A live version uses individual staff accounts with roles.
            </p>
          )}
          <Link to="/" className="mt-4 block text-center text-sm text-muted hover:text-ink">
            ← Back to website
          </Link>
        </form>
      </div>
    </div>
  );
}
