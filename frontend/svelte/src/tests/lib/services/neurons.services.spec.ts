import { GovernanceCanister, ICP, LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { readable } from "svelte/store";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import {
  listNeurons,
  stakeNeuron,
} from "../../../lib/services/neurons.services";

jest.mock("../../../lib/stores/auth.store", () => {
  return {
    authStore: readable({
      identity: {
        getPrincipal: jest.fn(),
      },
    }),
  };
});

describe("neurons-services", () => {
  const mockGovernanceCanister = mock<GovernanceCanister>();
  beforeEach(() => {
    mockGovernanceCanister.getNeurons.mockImplementation(
      jest.fn().mockResolvedValue([])
    );
    mockGovernanceCanister.stakeNeuron.mockImplementation(jest.fn());
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation(() => mockGovernanceCanister);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  it("stakeNeuron creates a new neuron", async () => {
    jest.spyOn(LedgerCanister, "create").mockImplementation(() => undefined);

    await stakeNeuron({
      stake: ICP.fromString("2") as ICP,
    });

    expect(mockGovernanceCanister.stakeNeuron).toBeCalled();
  });

  it(`stakeNeuron should raise an error if amount less than ${
    E8S_PER_ICP / E8S_PER_ICP
  } ICP`, async () => {
    jest.spyOn(LedgerCanister, "create").mockImplementation(() => undefined);

    const call = () =>
      stakeNeuron({
        stake: ICP.fromString("0.1") as ICP,
      });

    expect(call).rejects.toThrow(Error);
  });

  it("listNeurons fetches neurons", async () => {
    expect(mockGovernanceCanister.getNeurons).not.toBeCalled();

    await listNeurons();

    expect(mockGovernanceCanister.getNeurons).toBeCalled();
  });
});
