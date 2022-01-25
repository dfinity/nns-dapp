import { AuthClient } from "@dfinity/auth-client";
import type { Identity } from "@dfinity/agent";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { authStore } from "../../../lib/stores/auth.store";
import { expect } from "@jest/globals";

class MockAuthClient extends AuthClient {
  constructor() {
    super(null, null, null, null);
  }

  create(): Promise<AuthClient> {
    return Promise.resolve(this);
  }

  async isAuthenticated(): Promise<boolean> {
    return true;
  }

  getIdentity(): Identity {
    return { getPrincipal: () => mockPrincipal } as unknown as Identity;
  }

  async login({ onSuccess }: { onSuccess?: () => void }) {
    onSuccess?.();
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }
}

describe("auth-store", () => {
  const mockAuthClient: MockAuthClient = new MockAuthClient();

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
    const spy = jest.spyOn(mockAuthClient, "login");

    await authStore.signIn();

    expect(spy).toHaveBeenCalled();
  });

  it("should call auth-client logout on sign-out", async () => {
    const spy = jest.spyOn(mockAuthClient, "logout");

    await authStore.signOut();

    expect(spy).toHaveBeenCalled();
  });
});
