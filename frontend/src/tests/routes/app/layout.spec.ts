/**
 * @jest-environment jsdom
 */

import { initAppAuth, initAppPublicData } from "$lib/services/$public/app.services";
import App from "$routes/(app)/+layout.svelte";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/services/$public/app.services", () => ({
  initAppAuth: jest.fn(() => Promise.resolve()),
  initAppPublic: jest.fn(() => Promise.resolve()),
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

  it("should init the public data and sync time on mount", async () => {
    render(App);

    await waitFor(() => expect(initAppPublicData).toHaveBeenCalled());
  });
});
