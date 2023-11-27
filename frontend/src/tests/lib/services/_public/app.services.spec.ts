import { initAppPublicData } from "$lib/services/$public/app.services";
import { loadSnsProjects } from "$lib/services/$public/sns.services";

vi.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsProjects: vi.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("$public/app-services", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should init Sns and ckETH canister ids", async () => {
    await initAppPublicData();

    await expect(loadSnsProjects).toHaveBeenCalledTimes(1);
  });
});
