declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}
declare var process: {
  env: NodeJS.ProcessEnv;
};
declare var Buffer: {
  from(data: string, encoding?: string): {
    toString(encoding?: string): string;
  };
};

declare module 'node:test' {
  function test(name: string, fn: () => void | Promise<void>): void;
  export default test;
}

declare module 'node:assert/strict' {
  export function equal(actual: any, expected: any, message?: string): void;
  export function notEqual(actual: any, expected: any, message?: string): void;
  export function deepEqual(actual: any, expected: any, message?: string): void;
  export function ok(value: any, message?: string): void;
}
