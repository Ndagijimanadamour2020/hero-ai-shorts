import crypto from "node:crypto";
import { google } from "googleapis";
import { Readable } from "node:stream";

function oauth(){
  if(!process.env.YOUTUBE_CLIENT_ID||!process.env.YOUTUBE_CLIENT_SECRET||!process.env.YOUTUBE_REDIRECT_URI) throw new Error("YouTube OAuth environment variables are missing");
  return new google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID,process.env.YOUTUBE_CLIENT_SECRET,process.env.YOUTUBE_REDIRECT_URI);
}
function key(){const raw=process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY;if(!raw) throw new Error("YOUTUBE_TOKEN_ENCRYPTION_KEY is missing");return crypto.createHash("sha256").update(raw).digest();}
export function youtubeAuthUrl(state:string){return oauth().generateAuthUrl({access_type:"offline",prompt:"consent",scope:["https://www.googleapis.com/auth/youtube.upload"],state});}
export async function exchangeCode(code:string){const {tokens}=await oauth().getToken(code); return tokens.refresh_token;}
export function encryptToken(token:string){const iv=crypto.randomBytes(12),c=crypto.createCipheriv("aes-256-gcm",key(),iv);const enc=Buffer.concat([c.update(token,"utf8"),c.final()]);return `${iv.toString("base64url")}.${c.getAuthTag().toString("base64url")}.${enc.toString("base64url")}`;}
export function decryptToken(value:string){const [iv,tag,data]=value.split(".");const d=crypto.createDecipheriv("aes-256-gcm",key(),Buffer.from(iv,"base64url"));d.setAuthTag(Buffer.from(tag,"base64url"));return Buffer.concat([d.update(Buffer.from(data,"base64url")),d.final()]).toString("utf8");}
export async function uploadYoutubeVideo(refreshToken:string,video:Buffer,title:string,description:string,tags:string[]){const auth=oauth();auth.setCredentials({refresh_token:refreshToken});const yt=google.youtube({version:"v3",auth});const r=await yt.videos.insert({part:["snippet","status"],requestBody:{snippet:{title:title.slice(0,100),description,tags},status:{privacyStatus:"private",selfDeclaredMadeForKids:false}},media:{body:Readable.from(video)}});return r.data;}
