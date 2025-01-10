import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import type { AccountIdentifierString } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";

export const createSubAccount = async ({
  name,
  identity,
}: {
  name: string;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Creating SubAccount ${hashCode(name)} call...`);

  const { canister } = await nnsDappCanister({ identity });

  await canister.createSubAccount({
    subAccountName: name,
  });

  logWithTimestamp(`Creating SubAccount ${hashCode(name)} complete.`);
};

export const renameSubAccount = async ({
  newName,
  identity,
  subIcpAccountIdentifier,
}: {
  newName: string;
  identity: Identity;
  subIcpAccountIdentifier: AccountIdentifierString;
}): Promise<void> => {
  logWithTimestamp(
    `Renaming SubAccount ${hashCode(subIcpAccountIdentifier)} call...`
  );

  const { canister } = await nnsDappCanister({ identity });

  await canister.renameSubAccount({
    new_name: newName,
    account_identifier: subIcpAccountIdentifier,
  });

  logWithTimestamp(
    `Renaming SubAccount ${hashCode(subIcpAccountIdentifier)} complete.`
  );
};
