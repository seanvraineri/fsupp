"use client";
import { ReactNode, HTMLAttributes } from "react";
export function Card({children,className="",...props}:HTMLAttributes<HTMLDivElement>&{children:ReactNode,className?:string}){
  return <div {...props} className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow ${className}`}>{children}</div>;
}
export default Card; 
