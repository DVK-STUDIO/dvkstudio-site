// Serveur de développement AVEC les stand-ins (src/assets/standins/, jamais versionnés) : toute l'expérience photographique,
// pour le jugement visuel local. Les stand-ins sont refusés par tout build (voir src/lib/medias.ts).
//   npm run dev:standins            (options passées à astro dev, ex. -- --port 4321)
import { spawn } from "node:child_process";
const enfant = spawn("npx astro dev " + process.argv.slice(2).join(" "), { shell: true, stdio: "inherit", env: { ...process.env, DVK_STANDINS: "1" } });
enfant.on("exit", (code) => process.exit(code ?? 0));
