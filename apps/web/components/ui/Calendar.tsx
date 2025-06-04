"use client";
import { InputHTMLAttributes } from "react";
export function Calendar({selected,onSelect}:any){
  return <input type="date" className="p-2 border" value={selected.toISOString().substring(0,10)} onChange={e=>onSelect(new Date(e.target.value))}/>;
}
export default Calendar; 
