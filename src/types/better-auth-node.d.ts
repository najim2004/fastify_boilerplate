/**
 * TypeScript module declaration for `better-auth/node`.
 *
 * `better-auth` ships only ESM (`.mjs`) files. This project compiles to
 * CommonJS, but targets Node.js 22+ where `require()` of synchronous ESM
 * modules is fully supported (Node.js RFC: https://nodejs.org/api/esm.html).
 *
 * This declaration teaches the TypeScript compiler about `better-auth/node`'s
 * public API so the import resolves at type-check time. At runtime Node.js
 * resolves `require('better-auth/node')` to the correct `.mjs` file via the
 * package's `exports` map.
 */
declare module 'better-auth/node' {
  import type {
    IncomingMessage,
    ServerResponse,
    IncomingHttpHeaders,
  } from 'http';

  /**
   * Converts Node.js `IncomingHttpHeaders` to the Web-standard `Headers`
   * object required by Better Auth's internal API methods.
   */
  export function fromNodeHeaders(nodeHeaders: IncomingHttpHeaders): Headers;

  /**
   * Wraps a Better Auth handler and returns a native Node.js HTTP handler.
   * Useful when integrating with Express or the bare `node:http` module.
   */
  export function toNodeHandler(
    auth:
      | { handler: (request: Request) => Promise<Response> }
      | ((request: Request) => Promise<Response>),
  ): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
}
