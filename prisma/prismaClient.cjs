// runtime wrapper to load the generated Prisma client (CommonJS)
// This avoids TypeScript resolution errors when running with ts-node.
const clientModule = require('../src/generated/prisma') || {};

// The generated client exposes `PrismaClient` as a named export. Support
// a few shapes just in case.
const PrismaClient = clientModule.PrismaClient || (clientModule.default && clientModule.default.PrismaClient) || clientModule.default;

module.exports = { PrismaClient };
