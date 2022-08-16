/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import App from "../App.svelte";
import { initApp } from "../lib/services/app.services";
import { worker } from "../lib/services/worker.services";
import { authStore } from "../lib/stores/auth.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "./mocks/auth.store.mock";

jest.mock("../lib/services/worker.services", () => ({
  worker: {
    syncAuthIdle: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock("../lib/services/app.services", () => ({
  initApp: jest.fn(() => Promise.resolve()),
}));

describe("App", () => {
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

    await waitFor(() => expect(initApp).toHaveBeenCalled());
  });

  it("should register auth worker sync after sign in", () => {
    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    expect(worker.syncAuthIdle).toHaveBeenCalled();
  });
});
