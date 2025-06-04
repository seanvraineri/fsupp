"use client";
import { ButtonHTMLAttributes } from "react";
export function Button({children, className="", ...props}:ButtonHTMLAttributes<HTMLButtonElement>){
  return <button className={`inline-flex items-center px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}
export default Button; 