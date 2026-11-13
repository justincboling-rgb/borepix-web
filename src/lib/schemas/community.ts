import { z } from "zod";
import { community } from "@/data/community";

export const PLEDGE_AMOUNT_MESSAGE = "Enter a whole-dollar amount of at least $1, or choose a tier.";
export const PLEDGE_ITEMS_MESSAGE = "Choose at least one item to pledge.";

export const pledgeCadenceSchema = z.enum(["one-time", "monthly"]);

/** The optional supporter name: trimmed, and recorded as null when empty. */
const pledgeNameSchema = z.string().trim().transform((name) => name || null);

/** Whole dollars, $1 or more. A missing amount (no tier chosen, custom field empty or not a number) fails too. */
export const pledgeAmountSchema = z
  .number({ error: PLEDGE_AMOUNT_MESSAGE })
  .int(PLEDGE_AMOUNT_MESSAGE)
  .min(1, PLEDGE_AMOUNT_MESSAGE);

/** A money pledge: offered while commerce is live. */
export const moneyPledgeSchema = z.object({
  kind: z.literal("money"),
  amount: pledgeAmountSchema,
  cadence: pledgeCadenceSchema,
  name: pledgeNameSchema,
});

/** An in-kind pledge of items from the drive list: offered during the Alpha/Beta preview instead. */
export const inKindPledgeSchema = z.object({
  kind: z.literal("in-kind"),
  items: z.array(z.enum(community.driveItems)).min(1, PLEDGE_ITEMS_MESSAGE),
  cadence: pledgeCadenceSchema,
  name: pledgeNameSchema,
});

export const pledgeSchema = z.discriminatedUnion("kind", [moneyPledgeSchema, inKindPledgeSchema]);

/** The branch the widget offers: money tiers while commerce is enabled, drive items while it is not. */
export function pledgeSchemaFor(commerceEnabled: boolean) {
  return commerceEnabled ? moneyPledgeSchema : inKindPledgeSchema;
}

export type MoneyPledgeInput = z.input<typeof moneyPledgeSchema>;
export type InKindPledgeInput = z.input<typeof inKindPledgeSchema>;
export type PledgeInput = z.input<typeof pledgeSchema>;
export type PledgeData = z.output<typeof pledgeSchema>;
