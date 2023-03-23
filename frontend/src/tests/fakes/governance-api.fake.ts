import type { ApiQueryParams } from "$lib/api/governance.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { installImplAndBlockRest } from "$tests/utils/module.test-utils";
import type { Identity } from "@dfinity/agent";
import type { KnownNeuron, NeuronInfo } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";

const modulePath = "$lib/api/governance.api";
const implementedFunctions = {
  queryNeurons,
  queryKnownNeurons,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

// Maps a text principal of an identity to a list of neurons for that identity.
const neurons: Map<string, NeuronInfo[]> = new Map();

const mapKey = (identity: Identity) => identity.getPrincipal().toText();

// When the fake is paused, all calls to the fake will be queued until the fake
// is resumed.
let isPaused = false;
const pendingCalls: (() => void)[] = [];

const getNeurons = (identity: Identity) => {
  const key = mapKey(identity);
  let neuronList = neurons.get(key);
  if (isNullish(neuronList)) {
    neuronList = [];
    neurons.set(key, neuronList);
  }
  return neuronList;
};

/**
 * Calls the passed function and returns its result.
 * If the fake is paused, the function will be queued and an unresolved promise
 * is returned which will resolve when the fake is resumed and the function
 * called.
 */
const wrapMaybePaused = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (!isPaused) {
    return fn();
  }
  let resolve: (value: Promise<T>) => void;
  const responsePromise = new Promise<T>((res) => {
    resolve = res;
  });
  pendingCalls.push(() => {
    resolve(fn());
  });
  return responsePromise;
};

////////////////////////
// Fake implementations:
////////////////////////

function queryNeurons({
  identity,
  certified: _,
}: ApiQueryParams): Promise<NeuronInfo[]> {
  return wrapMaybePaused(async () => {
    return getNeurons(identity);
  });
}

function queryKnownNeurons({
  identity: _,
  certified: __,
}: ApiQueryParams): Promise<KnownNeuron[]> {
  return wrapMaybePaused(async () => {
    return [];
  });
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const reset = () => {
  neurons.clear();
  pendingCalls.length = 0;
  isPaused = false;
};

export const pause = () => {
  if (isPaused) {
    throw new Error("The fake was already paused");
  }
  isPaused = true;
};

export const resume = () => {
  if (!isPaused) {
    throw new Error("The fake wasn't paused.");
  }
  for (const call of pendingCalls) {
    call();
  }
  pendingCalls.length = 0;
  isPaused = false;
};

export const addNeuronWith = ({
  identity = mockIdentity,
  ...neuronParams
}: { identity?: Identity } & Partial<NeuronInfo>) => {
  getNeurons(identity).push({
    ...mockNeuron,
    ...neuronParams,
  });
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
