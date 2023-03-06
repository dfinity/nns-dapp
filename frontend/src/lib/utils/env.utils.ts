import { NNS_IC_ORG_ALTERNATIVE_ORIGIN } from "$lib/constants/origin.constants";

export const isNnsAlternativeOrigin = (): boolean => {
  const {
    location: { origin },
  } = window;

  return origin === NNS_IC_ORG_ALTERNATIVE_ORIGIN;
};
