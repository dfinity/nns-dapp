/**
 * @jest-environment jsdom
 */

import { initAppProxy } from "$lib/proxy/app.services.proxy";
import { initWorker } from "$lib/services/worker.services";
import { authStore } from "$lib/stores/auth.store";
import App from "$routes/+layout.svelte";
import { render, waitFor } from "@testing-library/svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../mocks/auth.store.mock";

jest.mock("$lib/services/worker.services", () => ({
  initWorker: jest.fn(() =>
    Promise.resolve({
      syncAuthIdle: () => {
        // Do nothing
      },
    })
  ),
}));

jest.mock("$lib/services/app.services", () => ({
  initApp: jest.fn(() => Promise.resolve()),
}));

describe("Layout", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mutableMockAuthStoreSubscribe);

    jest.spyOn(authStore, "sync").mockImplementation(() => Promise.resolve());
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should init the app after sign in", async () => {
    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    await waitFor(() => expect(initAppProxy).toHaveBeenCalled());
  });

  it("should register auth worker sync after sign in", () => {
    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    expect(initWorker).toHaveBeenCalled();
  });
});
