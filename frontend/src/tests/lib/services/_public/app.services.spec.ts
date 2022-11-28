/**
 * @jest-environment jsdom
 */
import * as agentServices from "$lib/services/$public/agent.services";
import { initAppPublic } from "$lib/services/$public/app.services";
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
    await initAppPublic();

    await expect(loadSnsSummaries).toHaveBeenCalledTimes(1);
  });

  it("should sync time", async () => {
    const spy = jest.spyOn(agentServices, "syncTime");

    await initAppPublic();

    await expect(spy).toHaveBeenCalledTimes(1);
  });
});
