"use client";
import { TextareaHTMLAttributes } from "react";
export function Textarea(props:TextareaHTMLAttributes<HTMLTextAreaElement>){
  return <textarea {...props} className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 ${props.className??''}`}></textarea>;
}
export default Textarea; 
