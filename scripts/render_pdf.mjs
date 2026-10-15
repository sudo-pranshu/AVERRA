// Renders docs/AVERRA_Pitch_Script.html to PDF with Playwright's Chromium.
import { chromium } from "playwright";
import { pathToFileURL } from "url";
import path from "path";
const src = path.resolve("docs/AVERRA_Pitch_Script.html");
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(src).href); await p.pdf({ path: "docs/AVERRA_Pitch_Script.pdf", format: "A4", printBackground: true, margin: { top: "18mm", bottom: "16mm", left: "18mm", right: "18mm" } });
await b.close(); console.log("pdf written");
