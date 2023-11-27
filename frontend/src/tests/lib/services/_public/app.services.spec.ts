import { initAppPublicData } from "$lib/services/$public/app.services";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { loadCkETHCanisters } from "$lib/services/cketh-canisters.services";

vi.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsProjects: vi.fn().mockResolvedValue(Promise.resolve()),
  };
});

vi.mock("$lib/services/cketh-canisters.services", () => {
  return {
    loadCkETHCanisters: vi.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("$public/app-services", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should init Sns and ckETH canister ids", async () => {
    await expect(loadSnsProjects).not.toBeCalled();
    await expect(loadCkETHCanisters).not.toBeCalled();

    await initAppPublicData();

    await expect(loadSnsProjects).toHaveBeenCalledTimes(1);
    await expect(loadCkETHCanisters).toHaveBeenCalledTimes(1);
  });
});
