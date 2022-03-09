import { GovernanceCanister, ICP, LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import {
  getNeuron,
  listNeurons,
  stakeNeuron,
  updateDelay,
} from "../../../lib/services/neurons.services";
import { authStore } from "../../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import { neuronMock } from "../../mocks/neurons.mock";

describe("neurons-services", () => {
  const mockGovernanceCanister = mock<GovernanceCanister>();
  beforeEach(() => {
    mockGovernanceCanister.listNeurons.mockImplementation(
      jest.fn().mockResolvedValue([])
    );
    mockGovernanceCanister.stakeNeuron.mockImplementation(jest.fn());
    mockGovernanceCanister.getNeuron.mockImplementation(
      jest.fn().mockResolvedValue(neuronMock)
    );
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation(() => mockGovernanceCanister);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
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
    });

    expect(mockGovernanceCanister.stakeNeuron).toBeCalled();
  });

  it(`stakeNeuron should raise an error if amount less than ${
    E8S_PER_ICP / E8S_PER_ICP
  } ICP`, async () => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());

    const call = () =>
      stakeNeuron({
        stake: ICP.fromString("0.1") as ICP,
      });

    await expect(call).rejects.toThrow(Error);
  });

  it("listNeurons fetches neurons", async () => {
    expect(mockGovernanceCanister.listNeurons).not.toBeCalled();

    await listNeurons();

    expect(mockGovernanceCanister.listNeurons).toBeCalled();
  });

  it("get neuron returns expected neuron", async () => {
    expect(mockGovernanceCanister.getNeuron).not.toBeCalled();

    const neuron = await getNeuron(neuronMock.neuronId);

    expect(mockGovernanceCanister.getNeuron).toBeCalled();
    expect(neuron).not.toBeUndefined();
    expect(neuron?.neuronId).toEqual(neuronMock.neuronId);
  });

  it("updateDelay updates neuron", async () => {
    mockGovernanceCanister.increaseDissolveDelay.mockImplementation(
      jest.fn().mockResolvedValue({ Ok: null })
    );
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());

    await updateDelay({
      neuronId: BigInt(10),
      dissolveDelayInSeconds: 12000,
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
      updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
      });

    expect(call).rejects.toThrow(error);
  });
});
