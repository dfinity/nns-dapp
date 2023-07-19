import { initAppAuth } from "$lib/services/$public/app.services";
import App from "$routes/(login)/+layout.svelte";
import { render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/$public/app.services", () => ({
  initAppAuth: vi.fn(() => Promise.resolve()),
}));

vi.mock("$lib/services/$public/worker-metrics.services", () => ({
  initMetricsWorker: vi.fn(() =>
    Promise.resolve({
      startMetricsTimer: () => {
        // Do nothing
      },
      stopMetricsTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("Layout", () => {
  afterAll(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should init the auth on mount", async () => {
    render(App);

    await waitFor(() => expect(initAppAuth).toHaveBeenCalled());
  });
});
