import { ResolvedProduct } from "./resolver.ts";

export interface Claim { text:string; }

function fromHtml(html:string):Claim[]{
  const claims:Claim[]=[];
  const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
  let m;
  while((m=liRegex.exec(html))!==null){
    const text = m[1].replace(/<[^>]+>/g,"").trim();
    if(text.length>5 && text.length<160) claims.push({text});
    if(claims.length>=5) break;
  }
  return claims;
}

export async function getClaims(prod:ResolvedProduct):Promise<Claim[]>{
  if(prod.html){
    const claims = fromHtml(prod.html);
    if(claims.length) return claims.slice(0,5);
  }
  const generic = [`Helps support overall wellness of ${prod.name.split(" ")[0]}`];
  return generic.map(t=>({text:t}));
} 