import { queryNeurons, spawnNeuron } from "$lib/api/governance.api";
import { CACHE_EXPIRATION_SECONDS } from "$lib/constants/api-services.constants";
import { nowInSeconds } from "$lib/utils/date.utils";
import { nonNullish } from "$lib/utils/utils";
import type { Identity } from "@dfinity/agent";
import type { NeuronId, NeuronInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";

type CallParams = {
  identity: Identity;
};

type QueryParmas = {
  certified: boolean;
} & CallParams;

/**
 * Caches two types:
 * - Neurons
 * - List of neuron ids for a given principal. This is needed to know whether we have ALL neurons for a given principal.
 */
type NnsNeuronsCache = {
  // Store all neurons.
  neurons: {
    [neuronId: string]: {
      neuron: NeuronInfo;
      timestampSeconds: number;
      certified: boolean;
    };
  };
  // List of neurons for a given principal.
  list: {
    [principal: string]: {
      ids: NeuronId[];
      timestampSeconds: number;
      certified: boolean;
    };
  };
};

/**
 * Cached data.
 *
 * Rules:
 * - Certified data can be returned when asked for not certified data.
 * - Non certified data is ignored when asked for certified data.
 */
class Cache {
  private data: NnsNeuronsCache = {
    neurons: {},
    list: {},
  };

  constructor(private cacheExpirationSeconds: number) {}

  getNeurons({
    certified,
    principal,
  }: {
    principal: Principal;
    certified: boolean;
  }): NeuronInfo[] | undefined {
    const neuronIds = this.data.list[principal.toText()];
    const nowSeconds = nowInSeconds();
    if (
      neuronIds?.ids !== undefined &&
      (neuronIds.certified === certified || neuronIds.certified)
    ) {
      const neurons = neuronIds.ids
        .map((neuronId) => this.data.neurons[String(neuronId)])
        .filter(nonNullish)
        .filter(({ certified: c }) => c === certified || c)
        .filter(
          ({ timestampSeconds }) =>
            this.cacheExpirationSeconds > nowSeconds - timestampSeconds
        )
        .map(({ neuron }) => neuron);
      if (neurons.length === neuronIds.ids.length) {
        return neurons;
      }
    }
  }

  setNeurons({
    neurons,
    principal,
    certified,
  }: {
    neurons: NeuronInfo[];
    principal: Principal;
    certified: boolean;
  }) {
    const timestampSeconds = nowInSeconds();
    const neuronIds = neurons.map(({ neuronId }) => neuronId);
    this.data.list[principal.toText()] = {
      ids: neuronIds,
      timestampSeconds,
      certified,
    };
    neurons.forEach((neuron) => {
      this.data.neurons[String(neuron.neuronId)] = {
        neuron,
        timestampSeconds,
        certified,
      };
    });
  }

  reset() {
    this.data = {
      neurons: {},
      list: {},
    };
  }
}

/**
 * This is a service that interacts with api functions.
 *
 * It is a singleton that is shared across the app.
 *
 * Naming convention:
 * - getXxx: returns a cached value if it exists, otherwise calls the api function
 * - queryXxx: always calls the api function and updates the cache
 * - <verb>Neuron: calls the api function and removes the cached related values
 */
export const NnsNeuronsApiService = {
  cache: new Cache(CACHE_EXPIRATION_SECONDS),
  async getNeurons({
    identity,
    certified,
  }: QueryParmas): Promise<NeuronInfo[]> {
    const principal = identity.getPrincipal();
    const cachedNeurons = this.cache.getNeurons({
      principal,
      certified: certified,
    });
    if (cachedNeurons !== undefined) {
      return cachedNeurons;
    }
    const neurons = await queryNeurons({ identity, certified });
    this.cache.setNeurons({ neurons, principal, certified: certified });
    return neurons;
  },
  async queryNeurons({
    certified,
    identity,
  }: QueryParmas): Promise<NeuronInfo[]> {
    const principal = identity.getPrincipal();
    const neurons = await queryNeurons({ identity, certified });
    this.cache.setNeurons({ neurons, principal, certified });
    return neurons;
  },
  async spawnNeuron(
    params: {
      neuronId: NeuronId;
      percentageToSpawn?: number;
    } & CallParams
  ): Promise<NeuronId> {
    const newNeuronId = await spawnNeuron(params);
    this.cache.reset();
    return newNeuronId;
  },
};
