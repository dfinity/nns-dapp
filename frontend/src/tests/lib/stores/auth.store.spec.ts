/**
 * @jest-environment jsdom
 */

import * as utils from "$lib/api/agent.api";
import { OLD_MAINNET_IDENTITY_SERVICE_URL } from "$lib/constants/identity.constants";
import { authStore } from "$lib/stores/auth.store";
import { AuthClient } from "@dfinity/auth-client";
import { mock } from "jest-mock-extended";

describe("auth-store", () => {
  const mockAuthClient = mock<AuthClient>();

  beforeAll(() => {
    jest
      .spyOn(AuthClient, "create")
      .mockImplementation(async (): Promise<AuthClient> => mockAuthClient);
  });

  it("should check authenticated on sync", async () => {
    const spy = jest.spyOn(mockAuthClient, "isAuthenticated");

    await authStore.sync();

    expect(spy).toHaveBeenCalled();
  });

  it("should call auth-client login on sign-in", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: test file
    mockAuthClient.login = async ({ onSuccess }: { onSuccess: () => void }) => {
      expect(true).toBeTruthy();
      onSuccess();
    };

    await authStore.signIn(() => {
      // do nothing on error here
    });
  });

  it("should call auth-client with old identity provider if currently in the old", async () => {
    const { host } = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { host: "nns.ic0.app" },
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: test file
    mockAuthClient.login = async ({
      onSuccess,
      identityProvider,
    }: {
      onSuccess: () => void;
      identityProvider: string;
    }) => {
      expect(identityProvider).toBe(OLD_MAINNET_IDENTITY_SERVICE_URL);
      onSuccess();
    };

    await authStore.signIn(() => {
      // do nothing on error here
    });
    window.location.host = host;
  });

  it("should call auth-client logout on sign-out", async () => {
    const spy = jest.spyOn(mockAuthClient, "logout");

    await authStore.signOut();

    expect(spy).toHaveBeenCalled();
  });

  it("should call reset agent on sign-out", async () => {
    const spy = jest.spyOn(utils, "resetAgents");

    await authStore.signOut();

    expect(spy).toHaveBeenCalled();
  });
});
