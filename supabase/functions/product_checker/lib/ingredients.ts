import { ResolvedProduct } from "./resolver.ts";

export interface Ingredient { name:string; amount?:string; quality:"good"|"questionable" }

const badFillers = [
  "titanium dioxide","red 40","blue 1","yellow 6","magnesium stearate","propylene glycol","talc","bht"
];

export async function getIngredients(prod:ResolvedProduct):Promise<Ingredient[]>{
  if(/^[0-9]+$/.test(prod.id)){
    const url = `https://dsld.od.nih.gov/dsld/json_ingred.jsp?prodno=${prod.id}`;
    const r = await fetch(url);
    if(r.ok){
      const j:any = await r.json();
      if(j?.ingredients?.length){
        return j.ingredients.map((i:any)=>{
          const name:string = i.ingrednm;
          const amt:string|undefined = i.strngth ? `${i.strngth}`:undefined;
          return { name, amount:amt, quality: badFillers.some(b=>name.toLowerCase().includes(b))?"questionable":"good" };
        });
      }
    }
  }
  return [ { name:"Ingredient data unavailable", quality:"questionable" } ];
} 