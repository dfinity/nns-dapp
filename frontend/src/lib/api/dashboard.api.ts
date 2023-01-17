import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import type {
  ExchangeRate,
  FetchExchangeRateResponse,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";

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

export const getExchangeRate = async ({
  identity,
  key,
}: {
  identity: Identity;
  key: string;
}): Promise<ExchangeRate> => {
  logWithTimestamp(`Fetch exchange rate call...`);

  const {
    canister: { getExchangeRate: getExchangeRateCanister },
  } = await nnsDappCanister({ identity });

  const exchangeRate = await getExchangeRateCanister(key);

  logWithTimestamp(`Fetch exchange rate complete.`);

  return exchangeRate;
};
