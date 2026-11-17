import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, Printer } from "lucide-react";
import { siteConfig } from "../../../siteConfig";
import { qrLocations, serviceById } from "@/data/services";
import { img } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui";

export default function QrCodes() {
  const [base, setBase] = useState(() => (typeof window !== "undefined" ? window.location.origin : siteConfig.siteUrl));
  const [codes, setCodes] = useState<Record<string, string>>({});
  const cleanBase = base.trim().replace(/\/$/, "");

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      qrLocations.map(async (l) => [
        l.slug,
        await QRCode.toDataURL(`${cleanBase}/review/${l.slug}`, { width: 640, margin: 1, errorCorrectionLevel: "M", color: { dark: "#12261e", light: "#ffffff" } }),
      ]),
    ).then((entries) => !cancelled && setCodes(Object.fromEntries(entries)));
    return () => {
      cancelled = true;
    };
  }, [cleanBase]);

  return (
    <div className="space-y-6">
      <header className="no-print flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">QR review access</p>
          <h1 className="mt-2 text-4xl font-medium text-forest sm:text-5xl">Printable QR codes</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Each code opens the review with that service already selected. Place them at reception, in rooms and on tables. Print on card and laminate, or save each one as an image.
          </p>
        </div>
        <button type="button" onClick={() => window.print()} className="btn btn-primary self-start">
          <Printer className="h-4 w-4" aria-hidden="true" /> Print all
        </button>
      </header>

      <label className="no-print block max-w-xl">
        <span className="label">Website address used in the codes</span>
        <input value={base} onChange={(e) => setBase(e.target.value)} className="input text-sm" spellCheck={false} />
        <span className="mt-1 block text-xs text-muted">Set this to the live domain before printing. Currently the codes point to this browser's address.</span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-4">
        {qrLocations.map((l) => {
          const url = `${cleanBase}/review/${l.slug}`;
          const svc = l.service ? serviceById[l.service] : null;
          return (
            <article key={l.slug} className="flex break-inside-avoid flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card print:shadow-none">
              <div className="bg-forest-deep px-6 pt-6 pb-5 text-center text-white">
                <img src={img("hippo-icon.png")} alt="" className="mx-auto h-10 w-10 object-contain" />
                <p className="mt-2 font-script text-2xl leading-none text-champagne-light">The Hungry &amp; Thirsty Hippo</p>
                <p className="mt-3 font-display text-2xl leading-tight">How was your {svc ? svc.short.toLowerCase() : "visit"}?</p>
              </div>
              <div className="flex flex-1 flex-col items-center px-6 py-6 text-center">
                {codes[l.slug] ? (
                  <img src={codes[l.slug]} alt={`QR code linking to ${url}`} className="h-48 w-48" />
                ) : (
                  <div className="h-48 w-48 animate-pulse rounded-xl bg-cream" />
                )}
                <p className="mt-3 text-sm font-semibold text-forest">Scan to leave a 30-second review</p>
                <p className="mt-1 text-xs break-all text-muted">{url.replace(/^https?:\/\//, "")}</p>
              </div>
              <div className="no-print flex items-center justify-between gap-2 border-t border-line/70 bg-ivory px-4 py-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  <ServiceIcon name={svc?.icon ?? "Sparkles"} className="h-4 w-4 shrink-0 text-champagne-deep" />
                  <span className="truncate">
                    {l.label} <span className="font-normal text-muted">· {l.hint}</span>
                  </span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <a href={`/review/${l.slug}`} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink" aria-label={`Open ${l.label} review link`}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {codes[l.slug] && (
                    <a href={codes[l.slug]} download={`qr-review-${l.slug}.png`} className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink" aria-label={`Download ${l.label} QR code`}>
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
