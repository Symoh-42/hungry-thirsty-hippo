import { useEffect } from "react";
import { Link } from "react-router-dom";
import credits from "../../public/images/credits.json";
import { siteConfig } from "../../siteConfig";
import { img } from "@/lib/utils";

type Credit = { title: string; name: string; link: string; source: string; license: string };

export function PhotoCredits() {
  useEffect(() => {
    document.title = `Photo credits | ${siteConfig.name}`;
  }, []);
  return (
    <div className="container-x pt-28 pb-24 sm:pt-32">
      <p className="eyebrow">Photo credits</p>
      <h1 className="display mt-4 text-forest">Photography</h1>
      <p className="mt-4 max-w-2xl text-muted">
        The logo comes from {siteConfig.name}'s own menu. Every photo on this concept is openly licensed demonstration imagery from Wikimedia
        Commons. None of them show the property itself, and they should be replaced with the establishment's own photography.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(credits as Record<string, Credit>).map(([file, c]) => (
          <li key={file} className="card overflow-hidden">
            <img src={img(file)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <div className="p-4 text-sm">
              <a href={c.link} target="_blank" rel="noreferrer" className="font-semibold text-forest hover:underline">
                {c.title}
              </a>
              <p className="mt-1 text-muted">
                {c.name} · {c.license} · {c.source}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotFound() {
  useEffect(() => {
    document.title = `Page not found | ${siteConfig.name}`;
  }, []);
  return (
    <div className="container-x flex min-h-[70svh] flex-col items-center justify-center pt-28 pb-20 text-center">
      <img src={img("hippo-icon.png")} alt="" className="h-20 w-20 object-contain" />
      <h1 className="display mt-6 text-forest">This page wandered off</h1>
      <p className="mt-3 text-muted">Like a hippo heading back to the lake.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          Home
        </Link>
        <Link to="/review" className="btn btn-ghost">
          Leave a review
        </Link>
      </div>
    </div>
  );
}
