import type { Account } from "./account";

export type NewTransaction = {
  sourceAccount: Account;
  destinationAddress: string;
  amount: number;
};

export type ValidateAmountFn = (
  amount: number | undefined
) => string | undefined;
