import type { CountryCode } from "$lib/types/location";
import {
  installImplAndBlockRest,
  makePausable,
} from "$tests/utils/module.test-utils";
import { isNullish } from "@dfinity/utils";

const modulePath = "$lib/api/location.api";
const fakeFunctions = {
  queryUserCountryLocation,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

let countryCode: CountryCode | undefined | Error = undefined;

////////////////////////
// Fake implementations:
////////////////////////

async function queryUserCountryLocation(): Promise<CountryCode> {
  if (isNullish(countryCode)) {
    throw new Error("Country code not set in fake");
  }
  if (countryCode instanceof Error) {
    throw countryCode;
  }
  return countryCode;
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const {
  pause,
  resume,
  reset: resetPaused,
  pausableFunctions: implementedFunctions,
} = makePausable(fakeFunctions);

const reset = () => {
  countryCode = undefined;
  resetPaused();
};

export { pause, resume };

export const setCountryCode = (newCountryCode: CountryCode | Error): void => {
  countryCode = newCountryCode;
};

// Call this inside a describe() block outside beforeEach() because it defines
// its own beforeEach() and afterEach().
export const install = () => {
  beforeEach(() => {
    reset();
  });
  installImplAndBlockRest({
    modulePath,
    implementedFunctions,
  });
};
