import { siteConfig } from "../../siteConfig";
import { questionByKey, serviceById } from "@/data/services";
import { ratingLabel } from "@/data/feedback";
import type { Review } from "./types";
import { avg, fmt1 } from "./stats";
import { downloadFile, escapeHtml, formatDate } from "./utils";

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  // Guard against spreadsheet formula injection from guest-entered text.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function exportCsv(reviews: Review[]) {
  const ratingKeys = [...new Set(reviews.flatMap((r) => Object.keys(r.ratings)))].filter((k) => questionByKey[k]);
  const header = [
    "Date", "Guest", "Email", "Phone", "Services", "QR location", "Overall", "Overall label",
    ...ratingKeys.map((k) => `${questionByKey[k].service}: ${questionByKey[k].label}`),
    "Enjoyed", "Improve", "What went wrong", "What made it special", "Comment",
    "Resolved", "Response", "Sample data",
  ];
  const rows = reviews.map((r) => [
    formatDate(r.createdAt, true),
    r.guest.name || "Anonymous",
    r.guest.email,
    r.guest.phone,
    r.services.map((s) => serviceById[s].short).join("; "),
    r.source ?? "",
    r.overall,
    ratingLabel(r.overall),
    ...ratingKeys.map((k) => r.ratings[k] ?? ""),
    r.enjoyed.join("; "),
    r.improve.join("; "),
    r.issueReasons.join("; "),
    r.delightReasons.join("; "),
    r.comment,
    r.resolved ? "Yes" : "No",
    r.response?.text ?? "",
    r.sample ? "Yes" : "No",
  ]);
  const csv = "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  downloadFile(`guest-reviews-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8");
}

/** Opens a print-ready report; the browser's "Save as PDF" turns it into a PDF. */
export function exportPdf(reviews: Review[], filterSummary: string) {
  const w = window.open("", "_blank");
  if (!w) {
    alert("Please allow pop-ups for this site to export the PDF report.");
    return;
  }
  const average = fmt1(avg(reviews.map((r) => r.overall)));
  const rows = reviews
    .map(
      (r) => `<tr>
        <td>${escapeHtml(formatDate(r.createdAt))}</td>
        <td>${escapeHtml(r.guest.name || "Anonymous")}${r.sample ? ' <span class="tag">Sample</span>' : ""}</td>
        <td>${escapeHtml(r.services.map((s) => serviceById[s].short).join(", "))}</td>
        <td class="c">${"★".repeat(r.overall)}<span class="dim">${"★".repeat(5 - r.overall)}</span></td>
        <td>${escapeHtml([...r.issueReasons, ...r.improve].join(", "))}</td>
        <td>${escapeHtml(r.comment)}</td>
        <td>${r.resolved ? "Resolved" : "Open"}</td>
      </tr>`,
    )
    .join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Guest reviews report - ${escapeHtml(siteConfig.name)}</title>
  <style>
    body{font:12px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:#262624;margin:32px}
    h1{font:600 22px Georgia,serif;color:#1e3a2f;margin:0}
    .meta{color:#6b665d;margin:4px 0 18px}
    .kpis{display:flex;gap:24px;margin-bottom:18px}
    .kpis b{display:block;font:600 20px Georgia,serif;color:#1e3a2f}
    table{width:100%;border-collapse:collapse}
    th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#6b665d;border-bottom:2px solid #1e3a2f;padding:6px}
    td{border-bottom:1px solid #e4dacb;padding:6px;vertical-align:top}
    .c{white-space:nowrap;color:#9a7a40}.dim{color:#e4dacb}
    .tag{font-size:9px;background:#fef3c7;color:#78350f;padding:1px 4px;border-radius:3px}
    @media print{body{margin:12mm}}
  </style></head><body>
  <h1>${escapeHtml(siteConfig.name)} · Guest reviews</h1>
  <p class="meta">Generated ${escapeHtml(formatDate(new Date().toISOString(), true))} · ${escapeHtml(filterSummary)}</p>
  <div class="kpis"><div><b>${reviews.length}</b>reviews</div><div><b>${average}</b>average rating</div>
  <div><b>${reviews.filter((r) => r.overall >= 4).length}</b>rated 4-5</div><div><b>${reviews.filter((r) => r.overall <= 2).length}</b>rated 1-2</div></div>
  <table><thead><tr><th>Date</th><th>Guest</th><th>Services</th><th>Rating</th><th>Issues / improve</th><th>Comment</th><th>Status</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="7">No reviews match these filters.</td></tr>'}</tbody></table>
  <script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script>
  </body></html>`);
  w.document.close();
}
