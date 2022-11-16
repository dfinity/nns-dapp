/**
 * @jest-environment jsdom
 */
import { initAppPublicData } from "$lib/services/$public/app.services";
import { loadSnsSummaries } from "$lib/services/$public/sns.services";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("$public/app-services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should init Sns", async () => {
    await initAppPublicData();

    await expect(loadSnsSummaries).toHaveBeenCalledTimes(1);
  });
});
