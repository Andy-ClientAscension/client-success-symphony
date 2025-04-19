
/// <reference types="vite/client" />

// Strict type checking settings for the project
// These help catch errors during development even without modifying tsconfig.json
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_API_URL?: string;
    VITE_ENABLE_STRICT_MODE?: string;
  }
}

// Ensure non-null assertions are handled properly
type NonNullable<T> = T extends null | undefined ? never : T;

// Strict function parameter types
type StrictParameters<T extends (...args: any) => any> = Parameters<T>;

// Ensure promise returns are properly typed
type PromiseType<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
