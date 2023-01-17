import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { FetchExchangeRateResponse } from "$lib/canisters/nns-dapp/nns-dapp.types";

export const fetchExchangeRate = async ({
  identity,
}: {
  identity: Identity;
}): Promise<FetchExchangeRateResponse> => {
  logWithTimestamp(`Fetch exchange rate call...`);

  const {
    canister: { fetchExchangeRate: fetchExchangeRateCanister },
  } = await nnsDappCanister({ identity });

  const response = await fetchExchangeRateCanister();

  logWithTimestamp(`Fetch exchange rate complete.`);

  return response;
};
