import type { ApiQueryParams } from "$lib/api/governance.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { installImplAndBlockRest } from "$tests/utils/module.test-utils";
import type { Identity } from "@dfinity/agent";
import type { KnownNeuron, NeuronInfo } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";

const modulePath = "$lib/api/governance.api";
const impl = {
  queryNeurons,
  queryKnownNeurons,
};

//////////////////////////////////////////////
// State and helpers for fake implementations:
//////////////////////////////////////////////

const neurons: Map<string, NeuronInfo[]> = new Map();

const mapKey = (identity: Identity) => identity.getPrincipal().toText();

const getNeurons = (identity: Identity) => {
  const key = mapKey(identity);
  let neuronList = neurons.get(key);
  if (isNullish(neuronList)) {
    neuronList = [];
    neurons.set(key, neuronList);
  }
  return neuronList;
};

////////////////////////
// Fake implementations:
////////////////////////

async function queryNeurons({
  identity,
  certified: _,
}: ApiQueryParams): Promise<NeuronInfo[]> {
  return getNeurons(identity);
}

async function queryKnownNeurons({
  identity: _,
  certified: __,
}: ApiQueryParams): Promise<KnownNeuron[]> {
  return [];
}

/////////////////////////////////
// Functions to control the fake:
/////////////////////////////////

const reset = () => {
  neurons.clear();
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
    impl,
  });
};
