import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";

export const isForceCallStrategy = (): boolean =>
  FORCE_CALL_STRATEGY === "query";

export const notForceCallStrategy = (): boolean => !isForceCallStrategy();
