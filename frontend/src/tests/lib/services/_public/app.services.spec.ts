/**
 * @jest-environment jsdom
 */
import {
  loadSnsSummaries,
  loadSnsSwapCommitments,
} from "$lib/services/$public/sns.services";
import { initAppData } from "$lib/services/$public/app.services";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapCommitments: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("$public/app-services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should init Sns", async () => {
    await initAppData();

    await expect(loadSnsSummaries).toHaveBeenCalledTimes(1);
    await expect(loadSnsSwapCommitments).toHaveBeenCalledTimes(1);
  });
});
