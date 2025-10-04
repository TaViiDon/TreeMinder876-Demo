declare module "../src/generated/prisma" {
  // Minimal ambient declarations for the generated Prisma client used in
  // runtime-only scripts (seed). This file prevents ts-node from failing
  // due to missing type declarations in the generated client folder.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export class PrismaClient { constructor(); $disconnect(): Promise<void>; }
  export { PrismaClient as default };
}
