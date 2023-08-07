import { initAppPublicData } from "$lib/services/$public/app.services";
import { loadSnsProjects } from "$lib/services/$public/sns.services";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsProjects: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("$public/app-services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should init Sns", async () => {
    await initAppPublicData();

    await expect(loadSnsProjects).toHaveBeenCalledTimes(1);
  });
});
