declare module 'isomorphic-dompurify' {
  const Purify: {
    sanitize: (dirty: string, options?: any) => string;
  };
  export default Purify;
} 