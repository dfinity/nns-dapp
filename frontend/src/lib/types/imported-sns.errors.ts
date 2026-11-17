export type ImportedSnsErrorReason =
  // The root canister does not list a governance, ledger, index or swap canister.
  | "missing-canisters"
  // The controllers do not link the canisters to the root canister.
  | "controllers"
  // The ledger does not mint to the governance canister.
  | "minting-account"
  // The governance canister is not in `Normal` mode.
  | "governance-mode";

export class ImportedSnsError extends Error {
  constructor(public readonly reason: ImportedSnsErrorReason) {
    super(`The imported SNS failed the check: ${reason}`);
  }
}
