"use client";
import { InputHTMLAttributes } from "react";
export function Slider({value,onChange,min=1,max=5,step=1}:any){
  return <input type="range" min={min} max={max} step={step} value={value[0]} onChange={e=>onChange([parseInt(e.target.value)])} className="w-full accent-purple-600"/>;
}
export default Slider; 