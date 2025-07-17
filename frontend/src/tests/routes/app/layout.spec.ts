import {
  initAppAuth,
  initAppPublicData,
} from "$lib/services/public/app.services";
import App from "$routes/(app)/+layout.svelte";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";

vi.mock("$lib/services/public/app.services", () => ({
  initAppAuth: vi.fn(() => Promise.resolve()),
  initAppPublicData: vi.fn(() => Promise.resolve()),
}));

vi.mock("$app/navigation", () => ({
  afterNavigate: vi.fn((callback) => {
    callback({ from: null, to: { url: new URL("http://localhost/") } });
  }),
}));

describe("Layout", () => {
  it("should init the auth on mount", async () => {
    render(App);
    await tick();

    expect(initAppAuth).toHaveBeenCalled();
  });

  it("should init the public data", async () => {
    render(App);
    await tick();

    expect(initAppPublicData).toHaveBeenCalled();
  });
});
