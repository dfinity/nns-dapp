import { GovernanceCanister, ICP, LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import {
  increaseDissolveDelay,
  queryNeuron,
  queryNeurons,
  stakeNeuron,
} from "../../../lib/api/neurons.api";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";

describe("neurons-api", () => {
  const mockGovernanceCanister = mock<GovernanceCanister>();
  beforeEach(() => {
    mockGovernanceCanister.listNeurons.mockImplementation(
      jest.fn().mockResolvedValue([])
    );
    mockGovernanceCanister.stakeNeuron.mockImplementation(jest.fn());
    mockGovernanceCanister.getNeuron.mockImplementation(
      jest.fn().mockResolvedValue(mockNeuron)
    );
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation(() => mockGovernanceCanister);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("stakeNeuron creates a new neuron", async () => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());

    await stakeNeuron({
      stake: ICP.fromString("2") as ICP,
      identity: mockIdentity,
    });

    expect(mockGovernanceCanister.stakeNeuron).toBeCalled();
  });

  it("queryNeurons fetches neurons", async () => {
    expect(mockGovernanceCanister.listNeurons).not.toBeCalled();

    await queryNeurons({ identity: mockIdentity, certified: true });

    expect(mockGovernanceCanister.listNeurons).toBeCalled();
  });

  it("get neuron returns expected neuron", async () => {
    expect(mockGovernanceCanister.getNeuron).not.toBeCalled();

    const neuron = await queryNeuron({
      neuronId: mockNeuron.neuronId,
      identity: mockIdentity,
    });

    expect(mockGovernanceCanister.getNeuron).toBeCalled();
    expect(neuron).not.toBeUndefined();
    expect(neuron?.neuronId).toEqual(mockNeuron.neuronId);
  });

  it("updateDelay updates neuron", async () => {
    mockGovernanceCanister.increaseDissolveDelay.mockImplementation(
      jest.fn().mockResolvedValue({ Ok: null })
    );
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());

    await increaseDissolveDelay({
      neuronId: BigInt(10),
      dissolveDelayInSeconds: 12000,
      identity: mockIdentity,
    });

    expect(mockGovernanceCanister.increaseDissolveDelay).toBeCalled();
  });

  it("updateDelay throws error when updating neuron fails", async () => {
    const error = new Error();
    mockGovernanceCanister.increaseDissolveDelay.mockImplementation(
      jest.fn().mockResolvedValue({ Err: error })
    );
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());

    const call = () =>
      increaseDissolveDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
        identity: mockIdentity,
      });

    await expect(call).rejects.toThrow(error);
  });
});
