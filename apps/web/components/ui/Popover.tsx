"use client";
import { ReactNode } from "react";
export function Popover({children}:{children:ReactNode}){return <div className="relative inline-block">{children}</div>;}
export function PopoverTrigger({asChild,children}:{asChild?:boolean;children:ReactNode}){return <>{children}</>;}
export function PopoverContent({children,className="",align}:{children:ReactNode,className?:string,align?:string}){
  return <div className={`absolute z-50 bottom-full mb-2 p-2 bg-white border rounded-md shadow-lg ${className}`}>{children}</div>;
} 