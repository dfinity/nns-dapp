import { installImplAndBlockRest } from "$tests/utils/module.test-utils";

const modulePath = "$lib/api/sns.api";
const implementedFunctions = {
  increaseStakeNeuron,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

////////////////////////
// Fake implementations:
////////////////////////

async function increaseStakeNeuron(): Promise<void> {
  return undefined;
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const reset = () => {
  // Nothing to reset yet
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
