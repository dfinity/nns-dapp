import { AuthClient } from "@dfinity/auth-client";
import { mock } from "jest-mock-extended";
import { authStore } from "../../../lib/stores/auth.store";

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
    // @ts-ignore: test file
    mockAuthClient.login = async ({ onSuccess }: { onSuccess: () => void }) => {
      expect(true).toBeTruthy();
      onSuccess();
    };

    await authStore.signIn();
  });

  it("should call auth-client logout on sign-out", async () => {
    const spy = jest.spyOn(mockAuthClient, "logout");

    await authStore.signOut();

    expect(spy).toHaveBeenCalled();
  });
});
