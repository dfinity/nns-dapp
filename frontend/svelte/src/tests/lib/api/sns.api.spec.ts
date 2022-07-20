/**
 * @jest-environment jsdom
 */

import type { SnsWasmCanisterOptions } from "@dfinity/nns";
import { get } from "svelte/store";
import {
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

describe("sns-api", () => {
  const mockQuerySwap = {
    swap: [
      {
        init: [mockSwapInit],
        state: [mockSwapState],
      },
    ],
  };

  beforeAll(() => {
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
});
