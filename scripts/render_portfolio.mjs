import { chromium } from "/opt/npm-tools/node_modules/playwright/index.mjs";
import { pathToFileURL } from "url"; import path from "path";
const name = process.argv[2] || "AVERRA_Practical_Portfolio"; const src = path.resolve(`portfolio/${name}.html`);
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(src).href); await p.waitForTimeout(300);
await p.pdf({ path: `portfolio/${name}.pdf`, format: "A4", printBackground: true, displayHeaderFooter: true,
  headerTemplate: `<div style="font:7.5px Arial;color:#64748B;width:100%;padding:0 15mm;display:flex;justify-content:space-between"><span>AVERRA — Biomedical Technology · Practical Portfolio${name.endsWith("SAMPLE") ? " · SAMPLE (illustrative data)" : ""}</span><span>SEC-ENT-301 · VJTI</span></div>`,
  footerTemplate: '<div style="font:7.5px Arial;color:#64748B;width:100%;padding:0 15mm;display:flex;justify-content:space-between"><span>Engineering better movement intelligence.</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
  margin: { top: "16mm", bottom: "16mm", left: "15mm", right: "15mm" } });
await b.close(); console.log("pdf written");
