import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BedDouble, Car, Clock, Coffee, Luggage, Wifi } from "lucide-react";
import { siteConfig } from "../../siteConfig";
import { menu } from "@/data/menu";
import { offeredServices, qrLocations } from "@/data/services";
import { img } from "@/lib/utils";
import { delay, SectionHeading, ServiceIcon, Txt } from "@/components/ui";

const amenities = [
  { icon: BedDouble, text: "10 rooms: double, twin and triple (confirm)" },
  { icon: Wifi, text: "Free Wi-Fi in rooms and public areas (confirm)" },
  { icon: Car, text: "Free on-site parking (confirm)" },
  { icon: Coffee, text: siteConfig.contact.breakfast },
  { icon: Luggage, text: "Luggage storage and front desk (confirm)" },
  { icon: Clock, text: `${siteConfig.contact.checkIn.replace(" (confirm)", "")} · ${siteConfig.contact.checkOut}` },
];

export default function Services() {
  useEffect(() => {
    document.title = `Services & Menu | ${siteConfig.name}`;
  }, []);
  return (
    <>
      <section className="relative isolate flex min-h-[62svh] items-end overflow-hidden bg-forest-deep pt-32 pb-14 text-white">
        <img src={img("nyama-bbq.jpg")} alt="Nyama choma on a grill" className="kenburns absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-deep via-forest-deep/55 to-forest-deep/20" />
        <div className="container-x">
          <p className="rise eyebrow text-champagne-light">Stay · Eat · Drink</p>
          <h1 className="rise display mt-4 max-w-3xl" style={delay(100)}>
            Our services
          </h1>
          <p className="rise mt-4 max-w-xl text-lg text-white/80" style={delay(200)}>
            {siteConfig.tagline}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {offeredServices
            .filter((s) => s.id !== "other")
            .map((s) => {
              const slug = qrLocations.find((l) => l.service === s.id)?.slug;
              return (
                <article key={s.id} className="card overflow-hidden">
                  <img src={img(s.image)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                  <div className="p-6">
                    <ServiceIcon name={s.icon} className="h-6 w-6 text-champagne-deep" />
                    <h2 className="mt-3 text-3xl font-medium text-forest">{s.label.split(" / ")[0]}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      <Txt>{s.blurb}</Txt>
                    </p>
                    <Link to={slug ? `/review/${slug}` : "/review"} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-champagne-deep">
                      Review {s.short.toLowerCase()} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
        </div>
        <div className="container-x mt-10">
          <ul className="grid gap-3 rounded-3xl bg-cream/70 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
            {amenities.map((a) => (
              <li key={a.text} className="flex items-start gap-3 text-sm">
                <a.icon className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
                <span>
                  <Txt>{a.text}</Txt>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="texture bg-cream/50 py-16 sm:py-24" id="menu">
        <div className="container-x">
          <SectionHeading
            eyebrow={siteConfig.restaurantName}
            title="On the menu"
            intro="From masala chai and mandazi at breakfast to kienyeji chicken and weekend sharing platters. Prices in Kenya shillings."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {menu.map((sec) => (
              <article key={sec.id} className="card overflow-hidden sm:grid sm:grid-cols-[0.42fr_0.58fr]">
                <div className="relative">
                  <img src={img(sec.image)} alt="" loading="lazy" className="h-44 w-full object-cover sm:h-full" />
                  <span className="absolute bottom-2 left-2 rounded bg-black/40 px-1.5 py-0.5 text-[0.55rem] text-white/80">Illustrative photo</span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-[1.75rem] font-medium text-forest">{sec.title}</h3>
                  {sec.note && <p className="text-xs font-semibold text-champagne-deep">{sec.note}</p>}
                  <ul className="mt-3 space-y-2">
                    {sec.items.map((it) => (
                      <li key={it.name} className="text-sm">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">{it.name}</span>
                          <span className="flex-1 border-b border-dotted border-line" aria-hidden="true" />
                          <span className="font-semibold whitespace-nowrap text-forest tabular-nums">KSh {it.price}</span>
                        </div>
                        {it.note && <p className="text-xs text-muted">{it.note}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center sm:py-20">
        <div className="container-x">
          <h2 className="h2 text-forest">Enjoyed something today?</h2>
          <Link to="/review" className="btn btn-primary mt-6">
            Leave a Review <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
