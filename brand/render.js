const sharp = require("sharp");
const fs = require("fs");
(async () => {
  const jobs = [["averra-mark-dark.svg", "averra-mark-dark-512.png", 512], ["averra-mark-light.svg", "averra-mark-light-512.png", 512],
    ["averra-lockup-white.svg", "averra-lockup-white.png", 1600], ["averra-lockup-navy.svg", "averra-lockup-navy.png", 1600],
    ["averra-wordmark-white.svg", "averra-wordmark-white.png", 1600], ["averra-mark-dark.svg", "favicon-32.png", 32]];
  for (const [i, o, w] of jobs) await sharp(Buffer.from(fs.readFileSync(i)), { density: 600 }).resize({ width: w }).png().toFile(o);
  // preview sheet
  const svgs = ["averra-lockup-white.svg"].map((f) => fs.readFileSync(f, "utf8"));
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="#0F172A"/>
  <rect x="0" y="420" width="1200" height="280" fill="#FFFFFF"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync("averra-lockup-white.svg")).toString("base64")}" x="200" y="120" width="800" height="140"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync("averra-mark-dark.svg")).toString("base64")}" x="200" y="300" width="64" height="64"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync("averra-mark-dark.svg")).toString("base64")}" x="290" y="316" width="32" height="32"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync("averra-mark-dark.svg")).toString("base64")}" x="340" y="324" width="16" height="16"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync("averra-lockup-navy.svg")).toString("base64")}" x="200" y="480" width="500" height="88"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync("averra-mark-light.svg")).toString("base64")}" x="800" y="480" width="96" height="96"/>
  </svg>`;
  await sharp(Buffer.from(sheet)).png().toFile("brand-sheet.png");
  console.log("ok");
})();
