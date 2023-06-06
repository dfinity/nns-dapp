import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import {
  createCanisterCjs,
  type CreateCanisterCjsParams,
} from "$lib/utils/cjs.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import { IcrcIndexCanister } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";

export const getIcrcTransactions = async ({
  identity,
  canisterId,
  maxResults: max_results,
  start,
  account,
}: Omit<
  GetTransactionsParams,
  "getTransactions"
>): Promise<GetTransactionsResponse> => {
  logWithTimestamp(
    `Getting transactions from Index canister ID ${canisterId.toText()}...`
  );

  const { getTransactions } = await createCanister({ identity, canisterId });

  const { oldest_tx_id, ...rest } = await getTransactions({
    max_results,
    start,
    account,
  });

  logWithTimestamp(
    `Getting transactions from Index canister ID ${canisterId.toText()} complete.`
  );

  return {
    oldestTxId: fromNullable(oldest_tx_id),
    ...rest,
  };
};

const createCanister = ({
  identity,
  canisterId,
}: {
  identity: Identity;
  canisterId: Principal;
}): Promise<IcrcIndexCanister> =>
  createCanisterCjs<IcrcIndexCanister>({
    identity,
    canisterId,
    create: ({ agent, canisterId }: CreateCanisterCjsParams) =>
      IcrcIndexCanister.create({
        agent,
        canisterId,
      }),
  });
