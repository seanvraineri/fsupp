declare module 'dompurify' {
  interface Config {
    ADD_ATTR?: string[];
  }
  function sanitize(dirty:string, config?:Config): string;
  export default { sanitize };
} 
