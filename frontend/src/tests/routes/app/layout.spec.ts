import {
  initAppAuth,
  initAppPublicData,
} from "$lib/services/$public/app.services";
import App from "$routes/(app)/+layout.svelte";
import { render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/$public/app.services", () => ({
  initAppAuth: vi.fn(() => Promise.resolve()),
  initAppPublicData: vi.fn(() => Promise.resolve()),
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

  it("should init the public data", async () => {
    render(App);

    await waitFor(() => expect(initAppPublicData).toHaveBeenCalled());
  });
});
