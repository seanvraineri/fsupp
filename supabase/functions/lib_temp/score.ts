export function combineScore(science:number, personal:number):number{
  return Math.round(0.7*science + 0.3*personal);
}
export function emojiFor(s:number){
  if(s>=80) return "😊";
  if(s>=60) return "🙂";
  return "😟";
}
