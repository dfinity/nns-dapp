import type { CanisterId } from "$lib/types/canister";
import type { CanisterActorParams } from "$lib/types/worker";
import { mapCanisterId } from "$lib/utils/canisters.utils";
import {
  createCanisterCjs,
  type CreateCanisterCjsParams,
} from "$lib/worker-utils/canister.worker-utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { IcrcLedgerCanister, type IcrcAccount } from "@dfinity/ledger";

export const getIcrcBalance = async ({
  identity,
  certified,
  account,
  ledgerCanisterId,
  fetchRootKey,
  host,
}: {
  certified: boolean;
  account: IcrcAccount;
} & CanisterActorParams & {
    ledgerCanisterId: string;
  }): Promise<bigint> => {
  const canister_id = mapCanisterId(ledgerCanisterId);

  logWithTimestamp(
    `Getting balance from Ledger canister ID ${canister_id.toText()}...`
  );

  const { balance } = await createCanister({
    identity,
    canisterId: canister_id,
    fetchRootKey,
    host,
  });

  const result = await balance({ certified, ...account });

  logWithTimestamp(
    `Getting balance from Ledger canister ID ${canister_id.toText()} complete.`
  );

  return result;
};

const createCanister = (
  params: CanisterActorParams & { canisterId: CanisterId }
): Promise<IcrcLedgerCanister> =>
  createCanisterCjs<IcrcLedgerCanister>({
    ...params,
    create: ({ agent, canisterId }: CreateCanisterCjsParams) =>
      IcrcLedgerCanister.create({
        agent,
        canisterId: mapCanisterId(canisterId),
      }),
  });
