import {
  createCanisterCjs,
  type CreateCanisterCjsParams,
} from "$lib/utils/cjs.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import { IcrcLedgerCanister, type IcrcAccount } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";

export const getIcrcBalance = async ({
  identity,
  certified,
  account,
  canisterId,
}: {
  identity: Identity;
  certified: boolean;
  account: IcrcAccount;
  canisterId: Principal;
}): Promise<bigint> => {
  logWithTimestamp(
    `Getting balance from Ledger canister ID ${canisterId.toText()}...`
  );

  const { balance } = await createCanister({ identity, canisterId });

  const result = await balance({ certified, ...account });

  logWithTimestamp(
    `Getting balance from Ledger canister ID ${canisterId.toText()} complete.`
  );

  return result;
};

const createCanister = ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<IcrcLedgerCanister> =>
  createCanisterCjs<IcrcLedgerCanister>({
    identity,
    canisterId,
    create: ({ agent, canisterId }: CreateCanisterCjsParams) =>
      IcrcLedgerCanister.create({
        agent,
        canisterId,
      }),
  });
