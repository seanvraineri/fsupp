"use client";
import { ReactNode } from "react";

export function Popover({children}:{children:ReactNode}){
  return <div className="relative inline-block">{children}</div>;
}

export function PopoverTrigger({asChild,children}:{asChild?:boolean;children:ReactNode}){
  return <>{children}</>;
}

export function PopoverContent({
  children,
  className="",
  align="center",
  sideOffset = 4
}:{
  children:ReactNode,
  className?:string,
  align?: "start" | "center" | "end";
  sideOffset?: number;
}){
  let alignmentClasses = "";
  if (align === "start") {
    alignmentClasses = "left-0";
  } else if (align === "end") {
    alignmentClasses = "right-0";
  } else {
    alignmentClasses = "left-1/2 -translate-x-1/2";
  }

  return (
    <div
      style={{ marginTop: `${sideOffset}px` }}
      className={`absolute z-50 top-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg ${alignmentClasses} ${className}`}
    >
      {children}
    </div>
  );
}
