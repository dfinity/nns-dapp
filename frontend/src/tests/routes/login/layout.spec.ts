/**
 * @jest-environment jsdom
 */

import { initAppAuth } from "$lib/services/$public/app.services";
import App from "$routes/(login)/+layout.svelte";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/services/$public/app.services", () => ({
  initAppAuth: jest.fn(() => Promise.resolve()),
}));

jest.mock("$lib/services/$public/worker-metrics.services", () => ({
  initMetricsWorker: jest.fn(() =>
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
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should init the auth on mount", async () => {
    render(App);

    await waitFor(() => expect(initAppAuth).toHaveBeenCalled());
  });
});
