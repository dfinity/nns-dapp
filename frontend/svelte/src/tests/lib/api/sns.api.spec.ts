/**
 * @jest-environment jsdom
 */

import type { SnsWasmCanisterOptions } from "@dfinity/nns";
import { get } from "svelte/store";
import { querySnsSummaries } from "../../../lib/api/sns.api";
import {
  importInitSns,
  importSnsWasmCanister,
} from "../../../lib/proxy/api.import.proxy";
import { snsesCountStore } from "../../../lib/stores/projects.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
} from "../../mocks/sns.api.mock";

jest.mock("../../../lib/proxy/api.import.proxy");

describe("sns-api", () => {
  beforeAll(() => {
    (importSnsWasmCanister as jest.Mock).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      create: (options: SnsWasmCanisterOptions) => ({
        listSnses: () => Promise.resolve(deployedSnsMock),
      }),
    });

    (importInitSns as jest.Mock).mockResolvedValue(() =>
      Promise.resolve({
        canisterIds: {
          rootCanisterId: rootCanisterIdMock,
          ledgerCanisterId: ledgerCanisterIdMock,
          governanceCanisterId: governanceCanisterIdMock,
        },
        metadata: () => Promise.resolve("metadata"),
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
});
