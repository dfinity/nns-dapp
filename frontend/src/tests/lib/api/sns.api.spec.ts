/**
 * @jest-environment jsdom
 */

import type { HttpAgent } from "@dfinity/agent";
import { ICP, LedgerCanister, type SnsWasmCanisterOptions } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import mock from "jest-mock-extended/lib/Mock";
import { get } from "svelte/store";
import {
  participateInSnsSwap,
  querySnsSummaries,
  querySnsSwapState,
  querySnsSwapStates,
} from "../../../lib/api/sns.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "../../../lib/proxy/api.import.proxy";
import { snsesCountStore } from "../../../lib/stores/projects.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockSwapInit, mockSwapState } from "../../mocks/sns-projects.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "../../mocks/sns.api.mock";

jest.mock("../../../lib/proxy/api.import.proxy");
jest.mock("../../../lib/utils/agent.utils", () => {
  return {
    createAgent: () => Promise.resolve(mock<HttpAgent>()),
  };
});

describe("sns-api", () => {
  const mockQuerySwap = {
    swap: [
      {
        init: [mockSwapInit],
        state: [mockSwapState],
      },
    ],
  };

  const notifyParticipationSpy = jest.fn().mockResolvedValue(undefined);
  const ledgerCanisterMock = mock<LedgerCanister>();

  beforeEach(() => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => ledgerCanisterMock);

    (importSnsWasmCanister as jest.Mock).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      create: (options: SnsWasmCanisterOptions) => ({
        listSnses: () => Promise.resolve(deployedSnsMock),
      }),
    });

    (importInitSnsWrapper as jest.Mock).mockResolvedValue(() =>
      Promise.resolve({
        canisterIds: {
          rootCanisterId: rootCanisterIdMock,
          ledgerCanisterId: ledgerCanisterIdMock,
          governanceCanisterId: governanceCanisterIdMock,
          swapCanisterId: swapCanisterIdMock,
        },
        metadata: () => Promise.resolve("metadata"),
        swapState: () => Promise.resolve(mockQuerySwap),
        notifyParticipation: notifyParticipationSpy,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should list sns summaries", async () => {
    const summaries = await querySnsSummaries({
      identity: mockIdentity,
      certified: true,
    });

    // TODO: currently summaries use mock data and get the value randomly therefore we cannot test it more precisely
    expect(summaries).not.toBeNull();
    expect(summaries.length).toEqual(1);
  });

  it("should update snsesCountStore", async () => {
    await querySnsSummaries({
      identity: mockIdentity,
      certified: true,
    });

    const $snsesCountStore = get(snsesCountStore);

    expect($snsesCountStore).toEqual(deployedSnsMock.length);
  });

  it("should query swap state", async () => {
    const state = await querySnsSwapState({
      rootCanisterId: rootCanisterIdMock.toText(),
      identity: mockIdentity,
      certified: true,
    });

    expect(state).not.toBeUndefined();
    expect(state?.swap).toEqual(mockQuerySwap.swap);
  });

  it("should list swap states", async () => {
    const states = await querySnsSwapStates({
      identity: mockIdentity,
      certified: true,
    });

    expect(states.length).toEqual(1);
    expect(states[0]?.swap).toEqual(mockQuerySwap.swap);
  });

  it("should participate in a swap by transferring and notifying", async () => {
    await participateInSnsSwap({
      amount: ICP.fromString("10") as ICP,
      rootCanisterId: rootCanisterIdMock,
      identity: mockIdentity,
      controller: Principal.fromText("aaaaa-aa"),
    });

    expect(ledgerCanisterMock.transfer).toBeCalled();
    expect(notifyParticipationSpy).toBeCalled();
  });
});
