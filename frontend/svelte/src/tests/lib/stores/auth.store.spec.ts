import type { SignIdentity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import {
  DelegationChain,
  DelegationIdentity,
  Secp256k1KeyIdentity,
} from "@dfinity/identity";
import { mock } from "jest-mock-extended";
import { authStore } from "../../../lib/stores/auth.store";

function createSecpIdentity(seed: number): SignIdentity {
  const seed1 = new Array(32).fill(0);
  seed1[0] = seed;
  return Secp256k1KeyIdentity.generate(new Uint8Array(seed1));
}

describe("auth-store", () => {
  const mockAuthClient = mock<AuthClient>();

  beforeAll(async () => {
    const masterKey = createSecpIdentity(2);
    const sessionKey = createSecpIdentity(3);
    const delegation = await DelegationChain.create(
      masterKey,
      sessionKey.getPublicKey()
    );
    // source: https://github.com/dfinity/agent-js/blob/7592d2719ad384011ccce5e5c1b7a70d3daa5c88/e2e/node/basic/identity.test.ts#L112
    const identity = DelegationIdentity.fromDelegation(sessionKey, delegation);
    mockAuthClient.getIdentity.mockReturnValue(identity);
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
    jest
      .spyOn(AuthClient, "create")
      .mockImplementation(async (): Promise<AuthClient> => mockAuthClient);
  });

  it("should check authenticated on sync and set expiration timeout", async () => {
    const spy = jest
      .spyOn(mockAuthClient, "isAuthenticated")
      .mockResolvedValue(true);

    await authStore.sync();

    expect(spy).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalled();
  });

  it("should call auth-client login on sign-in and set expiration timeout", async () => {
    // @ts-ignore: test file
    mockAuthClient.login = async ({ onSuccess }: { onSuccess: () => void }) => {
      expect(true).toBeTruthy();
      onSuccess();
    };

    await authStore.signIn();

    expect(setTimeout).toHaveBeenCalled();
  });

  it("should call auth-client logout on sign-out", async () => {
    const spy = jest.spyOn(mockAuthClient, "logout");

    await authStore.signOut();

    expect(spy).toHaveBeenCalled();
  });
});
