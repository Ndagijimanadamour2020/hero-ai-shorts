import React from "react"; import {AbsoluteFill, Sequence} from "remotion"; import {Scene} from "./Scene"; import type {VideoPlan} from "./types";
export const ShortVideo: React.FC<VideoPlan> = (plan) => <AbsoluteFill>{plan.scenes.map(s => <Sequence key={s.id} from={Math.round(s.start*30)} durationInFrames={Math.round(s.duration*30)}><Scene scene={s}/></Sequence>)}</AbsoluteFill>;
