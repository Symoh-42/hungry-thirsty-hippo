import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Menu, Phone, X } from "lucide-react";
import { demoBanner, siteConfig } from "../../siteConfig";
import { cn, demoWhatsapp } from "@/lib/utils";
import { Logo, Txt } from "./ui";

export function DemoBanner() {
  const [open, setOpen] = useState(true);
  if (!demoBanner.enabled || !open) return null;
  return (
    <div className="no-print relative z-[60] bg-forest-deep py-1.5 pr-12 pl-4 text-center text-[11px] leading-5 text-white/75 sm:px-12 sm:text-xs">
      <span className="sm:hidden">Concept by {demoBanner.name} · sample reviews ·</span>
      <span className="hidden sm:inline">
        Guest review platform concept for {siteConfig.name}, prepared by {demoBanner.name}. The dashboard uses sample reviews.
      </span>{" "}
      WhatsApp{" "}
      <a href={demoWhatsapp()} className="font-semibold text-white underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
        {demoBanner.whatsapp}
      </a>
      <span className="hidden md:inline">
        {" "}
        ·{" "}
        <a href={`mailto:${demoBanner.email}`} className="font-semibold text-white underline-offset-2 hover:underline">
          {demoBanner.email}
        </a>
      </span>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss demo banner"
        className="absolute top-0 right-0 grid h-full min-h-8 w-11 place-items-center text-base text-white/60 hover:text-white"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

function Header() {
  const { pathname } = useLocation();
  const overHero = pathname === "/" || pathname === "/services";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const solid = scrolled || !overHero || open;
  return (
    <header
      className={cn(
        "no-print sticky top-0 z-50 -mb-[4.5rem] transition-colors duration-500 sm:-mb-20",
        solid ? "bg-ivory/90 shadow-[0_1px_0_0_var(--color-line)] backdrop-blur-xl" : "bg-gradient-to-b from-black/40 to-transparent",
      )}
    >
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-4 sm:h-20">
        <Link to="/" aria-label={`${siteConfig.name} - home`}>
          <Logo light={!solid} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((n) => (
            <NavLink
              key={n.href}
              to={n.href}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  solid ? "text-ink hover:bg-cream" : "text-white/90 hover:bg-white/10",
                  isActive && (solid ? "bg-cream" : "bg-white/15"),
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
          <Link to="/review" className="btn btn-gold ml-2 min-h-11 px-5">
            Leave a Review <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
        <button
          type="button"
          className={cn("grid h-11 w-11 place-items-center rounded-full md:hidden", solid ? "text-forest" : "text-white")}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-ivory md:hidden">
          <nav aria-label="Mobile" className="container-x flex flex-col gap-1 py-4">
            {[{ label: "Home", href: "/" }, ...siteConfig.nav].map((n) => (
              <NavLink key={n.href} to={n.href} className="rounded-xl px-4 py-3 text-base font-medium text-ink hover:bg-cream">
                {n.label}
              </NavLink>
            ))}
            <Link to="/review" className="btn btn-primary mt-2">
              Leave a Review <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const c = siteConfig.contact;
  return (
    <footer className="no-print bg-forest-deep text-white/70">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{siteConfig.tagline}</p>
          <Link to="/review" className="btn btn-gold mt-6">
            Leave a Review <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-champagne uppercase">Visit</p>
          <p className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
            <span>
              <Txt>{c.location}</Txt>
            </span>
          </p>
          {c.phoneDisplay && (
            <p className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
              <a href={`tel:${c.phoneHref}`} className="hover:text-white">
                <Txt>{c.phoneDisplay}</Txt>
              </a>
            </p>
          )}
          <p className="flex gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
            <span>
              <Txt>{c.checkIn}</Txt>
              <br />
              <Txt>{c.checkOut}</Txt>
            </span>
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-champagne uppercase">Explore</p>
          <Link to="/services" className="block hover:text-white">
            Services &amp; menu
          </Link>
          <Link to="/review" className="block hover:text-white">
            Leave a review
          </Link>
          <Link to="/admin" className="block hover:text-white">
            Management login
          </Link>
          <Link to="/photo-credits" className="block hover:text-white">
            Photo credits
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-5 text-xs text-white/45">
          © {new Date().getFullYear()} {siteConfig.name}. Photography is openly licensed demonstration imagery, not the property itself.
        </p>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
