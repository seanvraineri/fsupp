"use client";
import { InputHTMLAttributes } from "react";
export function Input(props:InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={"border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 "+(props.className??"")} />;
}
export { Input as default } from "./Input"; 
