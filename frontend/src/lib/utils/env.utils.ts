import { building } from "$app/environment";
import { NNS_IC_ORG_ALTERNATIVE_ORIGIN } from "$lib/constants/origin.constants";

export const isNnsAlternativeOrigin = (): boolean => {
  if (building) {
    return false;
  }

  const {
    location: { origin },
  } = window;

  return origin.includes(NNS_IC_ORG_ALTERNATIVE_ORIGIN);
};
