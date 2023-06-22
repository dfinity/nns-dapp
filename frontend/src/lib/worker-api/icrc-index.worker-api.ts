import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import type { CanisterId } from "$lib/types/canister";
import type { CanisterActorParams } from "$lib/types/worker";
import { mapCanisterId } from "$lib/utils/canisters.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import {
  createCanisterWorker,
  type CreateCanisterWorkerParams,
} from "$lib/worker-utils/canister.worker-utils";
import { IcrcIndexCanister } from "@dfinity/ledger";
import { fromNullable } from "@dfinity/utils";

export const getIcrcTransactions = async ({
  identity,
  indexCanisterId,
  maxResults: max_results,
  start,
  account,
  fetchRootKey,
  host,
}: Omit<GetTransactionsParams, "getTransactions" | "identity" | "canisterId"> &
  CanisterActorParams & {
    indexCanisterId: string;
  }): Promise<GetTransactionsResponse> => {
  const canister_id = mapCanisterId(indexCanisterId);

  logWithTimestamp(
    `Getting transactions from Index canister ID ${canister_id.toText()}...`
  );

  const { getTransactions } = await createCanister({
    identity,
    canisterId: canister_id,
    fetchRootKey,
    host,
  });

  const { oldest_tx_id, ...rest } = await getTransactions({
    max_results,
    start,
    account,
  });

  logWithTimestamp(
    `Getting transactions from Index canister ID ${canister_id.toText()} complete.`
  );

  return {
    oldestTxId: fromNullable(oldest_tx_id),
    ...rest,
  };
};

const createCanister = (
  params: CanisterActorParams & { canisterId: CanisterId }
): Promise<IcrcIndexCanister> =>
  createCanisterWorker<IcrcIndexCanister>({
    ...params,
    create: ({ agent, canisterId }: CreateCanisterWorkerParams) =>
      IcrcIndexCanister.create({
        agent,
        canisterId: mapCanisterId(canisterId),
      }),
  });
