/**
 * @jest-environment jsdom
 */

import {
  initAppAuth,
  initAppPublicData,
} from "$lib/services/$public/app.services";
import { authStore } from "$lib/stores/auth.store";
import App from "$routes/(app)/+layout.svelte";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/services/$public/app.services", () => ({
  initAppAuth: jest.fn(() => Promise.resolve()),
  initAppPublicData: jest.fn(() => Promise.resolve()),
}));

describe("Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should init the auth on mount", async () => {
    render(App);

    await waitFor(() => expect(initAppAuth).toHaveBeenCalled());
  });

  it("should init the public data", async () => {
    render(App);

    await waitFor(() => expect(initAppPublicData).toHaveBeenCalled());
  });

  it("should render a spinner while loading the auth", async () => {
    authStore.setForTesting(undefined);

    const { getByTestId } = render(App);

    expect(getByTestId("spinner")).toBeInTheDocument();
  });

  it("should hide the spinner when auth loaded", async () => {
    authStore.setForTesting(undefined);

    const { getByTestId, container } = render(App);

    expect(getByTestId("spinner")).toBeInTheDocument();

    authStore.setForTesting(mockIdentity);

    await waitFor(() =>
      expect(container.querySelector('[data-tid="spinner"]')).toBeNull()
    );
  });
});
