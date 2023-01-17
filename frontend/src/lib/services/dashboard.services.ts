import { fetchExchangeRate as fetchExchangeRateApi } from "$lib/api/dashboard.api";
import { getAnonymousIdentity } from "$lib/services/auth.services";

export const fetchExchangeRate = async () => {
  const identity = getAnonymousIdentity();
  const response = await fetchExchangeRateApi({ identity });

  // TODO: handle errors too
  console.log(response);
};
