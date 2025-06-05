"use client";
import { ReactNode, useState, createContext, useContext } from "react";

interface TabsContextValue{ value:string; setValue:(v:string)=>void; }
const TabsContext = createContext<TabsContextValue|null>(null);

export function Tabs({defaultValue,children,className=""}:{defaultValue:string;children:ReactNode;className?:string}){
  const [value,setValue]=useState(defaultValue);
  return <TabsContext.Provider value={{value,setValue}}>
    <div className={className}>{children}</div>
  </TabsContext.Provider>;
}

export function TabsList({children, className=""}:{children:ReactNode; className?:string}){
  return <div className={`flex gap-2 mb-4 ${className}`}>{children}</div>;
}

export function TabsTrigger({value,children}:{value:string;children:ReactNode}){
  const ctx=useContext(TabsContext)!;
  const active = ctx.value===value;
  return <button onClick={()=>ctx.setValue(value)} className={`px-3 py-1 rounded-full text-sm border ${active?"bg-purple-600 text-white":"hover:bg-gray-100"}`}>{children}</button>;
}

export function TabsContent({value,children,asChild}:{value:string;children:ReactNode;asChild?:boolean}){
  const ctx=useContext(TabsContext)!;
  if(ctx.value!==value) return null;
  return <div>{children}</div>;
} 
