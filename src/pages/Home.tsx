import { Link } from "react-router-dom";
import { ArrowRight, Hand, MousePointerClick, Smile, Timer } from "lucide-react";
import { siteConfig } from "../../siteConfig";
import { offeredServices, qrLocations } from "@/data/services";
import { publicReviews, useReviews } from "@/lib/store";
import { avg, distribution, fmt1, positiveShare } from "@/lib/stats";
import { img } from "@/lib/utils";
import { ReviewCard } from "@/components/ReviewCard";
import { delay, SampleTag, SectionHeading, ServiceIcon, Stars, Txt } from "@/components/ui";

const slugFor = (id: string) => qrLocations.find((l) => l.service === id)?.slug;

export default function Home() {
  const all = useReviews();
  const shown = publicReviews(all);
  const hasSample = shown.some((r) => r.sample);
  const average = avg(shown.map((r) => r.overall));
  const dist = distribution(shown);
  const maxCount = Math.max(1, ...dist.map((d) => d.count));
  const testimonials = shown
    .filter((r) => r.comment && r.overall >= 4)
    .sort((a, b) => b.overall - a.overall || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[min(92svh,860px)] items-end overflow-hidden bg-forest-deep pt-32 pb-12 text-white sm:items-center sm:pb-20">
        <img
          src={img("hero-hippo-dock.jpg")}
          alt="A hippo grazing on a green lawn beside Lake Naivasha"
          className="kenburns absolute inset-0 -z-10 h-full w-full object-cover object-[60%_center]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-deep via-forest-deep/60 to-forest-deep/10 sm:bg-gradient-to-r sm:from-forest-deep/90 sm:via-forest-deep/50 sm:to-transparent" />
        <div className="container-x grid items-end gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="rise eyebrow text-champagne-light">Karagita · Lake Naivasha</p>
            <h1 className="rise display mt-5 text-white" style={delay(100)}>
              How Was Your <em className="text-champagne-light">Experience?</em>
            </h1>
            <p className="rise mt-5 max-w-lg text-lg leading-relaxed text-white/80 sm:text-xl" style={delay(200)}>
              Your experience matters to us. Help us serve you better.
            </p>
            <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={delay(300)}>
              <Link to="/review" className="btn btn-gold min-h-14 px-8 text-base">
                Leave a Review <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link to="/services" className="btn btn-ghost-light min-h-14 px-8 text-base">
                Explore Our Services
              </Link>
            </div>
            <p className="rise mt-5 flex items-center gap-2 text-sm text-white/65" style={delay(400)}>
              <Timer className="h-4 w-4 text-champagne" aria-hidden="true" /> Takes about 30 seconds. No typing needed.
            </p>
          </div>

          {shown.length > 0 && (
            <Link
              to="/reviews"
              className="rise group rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md transition hover:bg-white/15"
              style={delay(500)}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.2em] text-champagne-light uppercase">Guest satisfaction</p>
                {hasSample && <SampleTag className="border-amber-300/50 bg-amber-100/90" />}
              </div>
              <div className="mt-3 flex items-end gap-3">
                <span className="font-display text-6xl leading-none">{fmt1(average)}</span>
                <div className="pb-1">
                  <Stars value={average} size={18} />
                  <p className="mt-1 text-xs text-white/70">
                    from {shown.length} {hasSample ? "sample " : ""}reviews
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/75">
                <strong className="text-white">{positiveShare(shown)}%</strong> rated their visit Good or Excellent
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-champagne-light">
                Read guest reviews <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          )}
        </div>
        <span className="absolute right-3 bottom-3 rounded bg-black/30 px-2 py-0.5 text-[0.6rem] text-white/70 backdrop-blur-sm">
          Demonstration photo: Lake Naivasha · Daniel Case, CC BY-SA 4.0
        </span>
      </section>

      {/* Welcome + how it works */}
      <section className="texture bg-cream/60 py-20 sm:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <img src={img("hippo-icon.png")} alt="" className="mx-auto h-16 w-16 object-contain" />
            <p className="mt-6 font-display text-[1.7rem] leading-snug text-forest sm:text-4xl">
              “Whether you stayed with us, enjoyed a meal, attended an event or simply visited, we'd love to hear about your experience.”
            </p>
            <p className="mt-5 font-script text-3xl text-hippo">The Hippo team</p>
          </div>
          <ol className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { icon: MousePointerClick, title: "Tap what you enjoyed", text: "Choose the services you used: your room, a meal, a drink." },
              { icon: Smile, title: "Rate with a face", text: "Five big faces, from Very Poor to Excellent. One tap each." },
              { icon: Hand, title: "Pick, don't write", text: "Select what you loved and what we could do better. Comments are optional." },
            ].map((s, i) => (
              <li key={s.title} className="card p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-forest text-champagne-light">
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-4xl text-champagne">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-forest">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 sm:py-28" id="services">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Our services" title="What did you enjoy with us?" intro="Tap a service to review it directly." />
            <Link to="/services" className="btn btn-ghost self-start sm:self-auto">
              Services &amp; menu <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offeredServices
              .filter((s) => s.id !== "other")
              .map((s) => (
                <Link
                  key={s.id}
                  to={slugFor(s.id) ? `/review/${slugFor(s.id)}` : "/review"}
                  className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl p-6 text-white shadow-card sm:aspect-[4/5]"
                >
                  <img src={img(s.image)} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-deep via-forest-deep/40 to-transparent" />
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 backdrop-blur">
                    <ServiceIcon name={s.icon} className="h-6 w-6 text-champagne-light" />
                  </span>
                  <h3 className="mt-4 text-3xl font-medium">{s.label.split(" / ")[0]}</h3>
                  <p className="mt-2 text-sm text-white/75">
                    <Txt>{s.blurb}</Txt>
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-champagne-light">
                    Rate this <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Ratings + testimonials */}
      {shown.length > 0 && (
        <section className="bg-forest py-20 text-white sm:py-28">
          <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow text-champagne">Guest satisfaction</p>
              <h2 className="h2 mt-4">In our guests' words</h2>
              {hasSample && (
                <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-100/10 p-3 text-sm text-amber-100">
                  These are <strong>sample reviews</strong> created to demonstrate the platform. Real guest reviews will replace them.
                </p>
              )}
              <div className="mt-8 flex items-end gap-4">
                <span className="font-display text-7xl leading-none">{fmt1(average)}</span>
                <div className="pb-2">
                  <Stars value={average} size={20} />
                  <p className="mt-1 text-sm text-white/70">{shown.length} published reviews</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2" aria-label="Rating distribution">
                {dist.map((d) => (
                  <li key={d.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-10 text-white/70">{d.stars} ★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-champagne" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                    </span>
                    <span className="w-8 text-right text-white/70 tabular-nums">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {testimonials.map((r, i) => (
                <ReviewCard key={r.id} review={r} compact className={i === 0 ? "sm:col-span-2" : ""} />
              ))}
              <Link to="/reviews" className="btn btn-gold sm:col-span-2 sm:justify-self-start">
                See all guest reviews <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="relative isolate overflow-hidden py-24 text-center text-white sm:py-32">
        <img src={img("naivasha-hippos.jpg")} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-forest-deep/75" />
        <div className="container-x">
          <h2 className="h2 mx-auto max-w-2xl">Thirty seconds. Five faces. A better stay for the next guest.</h2>
          <Link to="/review" className="btn btn-gold mt-8 min-h-14 px-8 text-base">
            Leave a Review <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <p className="mt-6 text-xs text-white/50">{siteConfig.name} · <Txt>{siteConfig.contact.location}</Txt></p>
        </div>
      </section>
    </>
  );
}
