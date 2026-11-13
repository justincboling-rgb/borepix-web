/**
 * The validation layer: one Zod schema per form or input, each encoding exactly the rules and messages
 * the form shows. Components validate through these, and every future server action or API route must
 * parse its input with the same schema before touching a store or a database (see README.md).
 */

export * from "./affiliate";
export * from "./auth";
export * from "./commerce";
export * from "./community";
export * from "./shared";
