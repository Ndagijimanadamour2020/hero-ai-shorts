import "dotenv/config"; import {readFile} from "node:fs/promises"; import {renderPlan} from "../lib/media/render";
const plan=JSON.parse(await readFile(process.argv[2]||"plan.json","utf8")); const audio=plan.audioFiles as string[]; console.log(await renderPlan(plan,audio,process.env.RENDER_DIR||"./generated"));
