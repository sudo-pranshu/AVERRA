// 17-slide deck that mirrors the website one-to-one: each slide is the website slide (2x render) with the script as speaker notes.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const K = JSON.parse(fs.readFileSync("../data/content.json", "utf8"));
const DIR = process.argv[2];
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; pres.title = "AVERRA — Pitch"; pres.author = "Pranshu Kumar"; pres.company = "AVERRA";
const mmss = (t) => Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
let t = 0;
K.script.forEach((sc, i) => {
  const s = pres.addSlide();
  s.background = { color: "0B1222" };
  s.addImage({ path: `${DIR}/s${String(i + 1).padStart(2, "0")}.png`, x: 0, y: 0, w: 13.333, h: 7.5 });
  s.addNotes(`${sc.speaker.toUpperCase()} · [${mmss(t)}–${mmss(t + sc.seconds)} | ${sc.seconds} s] ${sc.title}\n${sc.text}`);
  t += sc.seconds;
});
pres.writeFile({ fileName: "AVERRA_Pitch.pptx" }).then((f) => console.log("written", f, K.script.length, "slides"));
