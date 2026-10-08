import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene as SceneType } from "./types";
export const Scene: React.FC<{scene: SceneType}> = ({scene}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, Math.min(12, scene.duration*fps/4), scene.duration*fps], [0,1,1], {extrapolateRight:"clamp"});
  const scale = interpolate(frame, [0, scene.duration*fps], [1.06,1], {extrapolateRight:"clamp"});
  return <AbsoluteFill style={{opacity, transform:`scale(${scale})`, background:"linear-gradient(135deg,#071a33,#0b2d52 55%,#06111f)", color:"white", padding:80, justifyContent:"center", fontFamily:"Arial"}}>
    {scene.imageUrl && <Img src={scene.imageUrl} style={{position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:.34}} />}
    <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.75))"}} />
    <div style={{position:"relative", zIndex:2}}><div style={{fontSize:42,fontWeight:800,lineHeight:1.08}}>{scene.headline}</div>{scene.subheadline && <div style={{fontSize:28,marginTop:22,opacity:.9}}>{scene.subheadline}</div>}</div>
    {scene.caption && <div style={{position:"absolute",zIndex:3,bottom:110,left:70,right:70,fontSize:34,fontWeight:700,textAlign:"center",textShadow:"0 3px 10px #000"}}>{scene.caption}</div>}
  </AbsoluteFill>;
};
