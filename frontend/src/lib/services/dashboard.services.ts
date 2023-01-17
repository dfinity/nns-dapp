import {
  fetchExchangeRate as fetchExchangeRateApi,
  getExchangeRate,
} from "$lib/api/dashboard.api";
import { getAnonymousIdentity } from "$lib/services/auth.services";

export const fetchExchangeRate = async () => {
  const identity = getAnonymousIdentity();
  const response = await fetchExchangeRateApi({ identity });

  // TODO: handle errors too
  console.log(response);
};

export const getExchangeRateICPToUsd = async () => {
  const identity = getAnonymousIdentity();
  const response = await getExchangeRate({ identity, key: "ICP-USD" });

  // TODO: handle errors too
  console.log(response);
};
