import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { createMockSnsNeuron } from "../../tests/mocks/sns-neurons.mock";

export const mockSnsNeurons: SnsNeuron[] = [
  { stake: BigInt(1_000_000_000), id: [1, 5, 3, 9, 9, 3, 2] },
  {
    stake: BigInt(3_400_000_000),
    id: [1, 5, 3, 7, 8, 2, 2],
    state: NeuronState.LOCKED,
  },
  {
    stake: BigInt(18_000_000_000),
    id: [1, 5, 3, 0, 7, 3, 2, 9],
    state: NeuronState.DISSOLVING,
  },
].map(createMockSnsNeuron);
