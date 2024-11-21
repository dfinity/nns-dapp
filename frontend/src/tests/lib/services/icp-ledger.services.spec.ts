import * as agent from "$lib/api/agent.api";
import * as api from "$lib/api/governance.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { LedgerConnectionState } from "$lib/constants/ledger.constants";
import { LedgerIdentity } from "$lib/identities/ledger.identity";
import * as authServices from "$lib/services/auth.services";
import * as accountsServices from "$lib/services/icp-accounts.services";
import {
  assertLedgerVersion,
  connectToHardwareWallet,
  getLedgerIdentity,
  listNeuronsHardwareWallet,
  registerHardwareWallet,
  showAddressAndPubKeyOnHardwareWallet,
} from "$lib/services/icp-ledger.services";
import { LedgerErrorKey, LedgerErrorMessage } from "$lib/types/ledger.errors";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import {
  mockGetIdentity,
  mockIdentity,
  mockIdentityErrorMsg,
  mockPrincipal,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  MockLedgerIdentity,
  mockLedgerIdentifier,
} from "$tests/mocks/ledger.identity.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { MockNNSDappCanister } from "$tests/mocks/nns-dapp.canister.mock";
import type { Agent } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import { principalToAccountIdentifier } from "@dfinity/ledger-icp";
import { LedgerError, type ResponseVersion } from "@zondax/ledger-icp";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

describe("icp-ledger.services", () => {
  const callback = vi.fn();
  const mockLedgerIdentity: MockLedgerIdentity = new MockLedgerIdentity();
  const ledgerPrincipal2 = mockPrincipal;
  const mockLedgerIdentity2: MockLedgerIdentity = new MockLedgerIdentity({
    principal: ledgerPrincipal2,
  });

  beforeEach(() => {
    resetIdentity();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
  });

  describe("connect hardware wallet", () => {
    describe("success", () => {
      beforeEach(() => {
        vi.spyOn(LedgerIdentity, "create").mockImplementation(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity
        );
      });

      it("should set connecting state before connecting", async () => {
        await connectToHardwareWallet(callback);

        expect(callback).toHaveBeenCalledWith({
          connectionState: LedgerConnectionState.CONNECTING,
        });
      });

      it("should set connected state and identity once ledger connected", async () => {
        await connectToHardwareWallet(callback);

        expect(callback).toHaveBeenCalledWith({
          connectionState: LedgerConnectionState.CONNECTED,
          ledgerIdentity: mockLedgerIdentity,
        });
      });
    });

    describe("error", () => {
      beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(vi.fn());
      });

      it("should set not connected state on error", async () => {
        vi.spyOn(LedgerIdentity, "create").mockImplementation(() => {
          throw new Error("Not connected");
        });
        await connectToHardwareWallet(callback);

        expect(callback).toHaveBeenNthCalledWith(2, {
          connectionState: LedgerConnectionState.NOT_CONNECTED,
        });
      });

      it("should display a toast for the error assuming the browser is not supported", async () => {
        vi.spyOn(LedgerIdentity, "create").mockImplementation(() => {
          throw new LedgerErrorKey({
            message: "error__ledger.browser_not_supported",
          });
        });
        expect(get(toastsStore)).toEqual([]);

        await connectToHardwareWallet(callback);

        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "Sorry, the browser does not support the WebHID API needed to connect the hardware wallet. Check support in https://caniuse.com/?search=WebHID",
          },
        ]);
      });
    });
  });

  describe("register hardware wallet", () => {
    const mockNNSDappCanister: MockNNSDappCanister = new MockNNSDappCanister();

    const ledgerIdentity = new MockLedgerIdentity();

    let spySyncAccounts;

    beforeEach(() => {
      vi.spyOn(NNSDappCanister, "create").mockImplementation(
        (): NNSDappCanister => mockNNSDappCanister
      );

      spySyncAccounts = vi
        .spyOn(accountsServices, "syncAccounts")
        .mockImplementation(() => undefined);

      const mockCreateAgent = () => Promise.resolve(mock<Agent>());
      vi.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);

      vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
        () => Promise.resolve(mockGetIdentity())
      );
    });

    describe("success", () => {
      it("should sync accounts after register", async () => {
        await registerHardwareWallet({
          name: "test",
          ledgerIdentity,
        });

        expect(spySyncAccounts).toHaveBeenCalled();
      });
    });

    describe("error", () => {
      it("should throw an error if no name provided", async () => {
        expect(get(toastsStore)).toEqual([]);

        await registerHardwareWallet({
          name: undefined,
          ledgerIdentity,
        });

        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "No account name provided.",
          },
        ]);
      });

      it("should throw an error if no ledger identity provided", async () => {
        expect(get(toastsStore)).toEqual([]);

        await registerHardwareWallet({
          name: "test",
          ledgerIdentity: undefined,
        });

        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "No identity connected to your hardware wallet.",
          },
        ]);
      });

      it("should not register and sync accounts if no identity", async () => {
        setNoIdentity();

        const call = async () =>
          await registerHardwareWallet({
            name: "test",
            ledgerIdentity,
          });

        await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

        resetIdentity();
      });
    });
  });

  describe("get ledger identity", () => {
    beforeEach(() => {
      vi.spyOn(LedgerIdentity, "create").mockImplementation(
        async (): Promise<LedgerIdentity> => mockLedgerIdentity
      );
    });

    it("should return ledger identity", async () => {
      const identity = await getLedgerIdentity(mockLedgerIdentifier);

      expect(identity).not.toBeNull();
      expect(principalToAccountIdentifier(identity.getPrincipal())).toEqual(
        mockLedgerIdentifier
      );
    });

    it("should not cache ledger identity for same identifier", async () => {
      vi.spyOn(LedgerIdentity, "create")
        .mockImplementationOnce(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity
        )
        .mockImplementationOnce(
          // Return the same identity, but a new instance.
          async (): Promise<LedgerIdentity> => new MockLedgerIdentity()
        );
      const identity1 = await getLedgerIdentity(mockLedgerIdentifier);

      expect(identity1).not.toBeNull();
      expect(LedgerIdentity.create).toHaveBeenCalledTimes(1);

      const identity2 = await getLedgerIdentity(mockLedgerIdentifier);

      expect(identity2.getPrincipal().toText()).toBe(
        identity1.getPrincipal().toText()
      );
      expect(identity2).not.toBe(identity1);
      expect(LedgerIdentity.create).toHaveBeenCalledTimes(2);
    });

    it("should not return cached ledger identity for different account", async () => {
      vi.spyOn(LedgerIdentity, "create")
        .mockImplementationOnce(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity
        )
        .mockImplementationOnce(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity2
        );

      const identity1 = await getLedgerIdentity(mockLedgerIdentifier);

      expect(identity1).not.toBeNull();
      expect(LedgerIdentity.create).toHaveBeenCalledTimes(1);

      const identity2 = await getLedgerIdentity(
        principalToAccountIdentifier(ledgerPrincipal2)
      );

      expect(identity2).not.toBe(identity1);
      expect(LedgerIdentity.create).toHaveBeenCalledTimes(2);
    });

    // Test for the bug found in 2024-11-08.
    // The bug was that the wrong ledger identity was returned when the wrong HW was connected first.
    it("should return correct identity after connection wrong HW first", async () => {
      vi.spyOn(LedgerIdentity, "create")
        // Return first the wrong identity. Mocking that the wrong HW is connected.
        .mockImplementationOnce(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity2
        )
        .mockImplementationOnce(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity
        );

      const call = async () => getLedgerIdentity(mockLedgerIdentifier);

      // Call fails because the wrong HW is connected.
      await expect(call).rejects.toThrow(
        replacePlaceholders(en.error__ledger.incorrect_identifier, {
          $identifier: mockLedgerIdentifier,
          $ledgerIdentifier: principalToAccountIdentifier(ledgerPrincipal2),
        })
      );

      expect(LedgerIdentity.create).toHaveBeenCalledTimes(1);

      // Second call should return the correct identity because the correct HW is connected.
      const identity = await getLedgerIdentity(mockLedgerIdentifier);

      expect(LedgerIdentity.create).toHaveBeenCalledTimes(2);
      expect(identity).not.toBeNull();
      expect(principalToAccountIdentifier(identity.getPrincipal())).toEqual(
        mockLedgerIdentifier
      );
    });

    it("should throw an error if identifier does not match", async () => {
      const call = async () => await getLedgerIdentity("test");

      await expect(call).rejects.toThrow(
        replacePlaceholders(en.error__ledger.incorrect_identifier, {
          $identifier: "test",
          $ledgerIdentifier: mockLedgerIdentifier,
        })
      );
    });
  });

  describe("show info on ledger", () => {
    let spy;

    beforeEach(() => {
      vi.spyOn(LedgerIdentity, "create").mockImplementation(
        async (): Promise<LedgerIdentity> => mockLedgerIdentity
      );

      spy = vi.spyOn(mockLedgerIdentity, "showAddressAndPubKeyOnDevice");
    });

    describe("success", () => {
      it("should show info on device through identity", async () => {
        await showAddressAndPubKeyOnHardwareWallet();

        expect(spy).toHaveBeenCalled();
      });
    });

    describe("error", () => {
      it("should not display info if ledger throw an error", async () => {
        spy.mockImplementation(() => {
          throw new LedgerErrorKey({
            message: "error__ledger.unexpected_wallet",
          });
        });

        expect(get(toastsStore)).toEqual([]);

        await showAddressAndPubKeyOnHardwareWallet();

        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "Found unexpected public key. Are you sure you're using the right hardware wallet?",
          },
        ]);
      });
    });
  });

  describe("query neurons", () => {
    const mockNeurons = [mockNeuron];

    beforeEach(() => {
      vi.spyOn(api, "queryNeurons").mockImplementation(() =>
        Promise.resolve(mockNeurons)
      );
    });

    describe("success", () => {
      beforeEach(() => {
        vi.spyOn(LedgerIdentity, "create").mockImplementation(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity
        );
      });

      it("should list neurons on hardware wallet", async () => {
        const { neurons } = await listNeuronsHardwareWallet();

        expect(neurons).toEqual(mockNeurons);
        expect(api.queryNeurons).toBeCalledWith({
          certified: true,
          identity: mockLedgerIdentity,
          // Must be undefined for compatibility with Ledger app 2.4.9.
          includeEmptyNeurons: undefined,
        });
        expect(api.queryNeurons).toBeCalledTimes(1);
      });
    });

    describe("error", () => {
      beforeEach(() => {
        vi.spyOn(LedgerIdentity, "create").mockImplementation(
          async (): Promise<LedgerIdentity> => {
            throw new LedgerErrorKey({ message: "error__ledger.please_open" });
          }
        );
      });

      it("should not list neurons if ledger throw an error", async () => {
        expect(get(toastsStore)).toEqual([]);

        const { err } = await listNeuronsHardwareWallet();

        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "Please open the Internet Computer app on your hardware wallet and try again.",
          },
        ]);

        expect(err).not.toBeUndefined();
      });
    });
  });

  describe("assertLedgerVersion", () => {
    it("should throw if ledger version is smaller than min version", async () => {
      const minVersion = "2.0.6";
      const versionResponse: ResponseVersion = {
        returnCode: LedgerError.NoErrors,
        testMode: true,
        major: 1,
        minor: 0,
        patch: 10,
        deviceLocked: false,
        targetId: "test",
      };
      const identity = await MockLedgerIdentity.create({
        version: versionResponse,
      });

      const call = () =>
        assertLedgerVersion({
          identity,
          minVersion,
        });
      expect(call).rejects.toThrow(LedgerErrorMessage);
    });

    it("should not throw if ledger version is larger than min version", async () => {
      const minVersion = "2.0.6";
      const versionResponse: ResponseVersion = {
        returnCode: LedgerError.NoErrors,
        testMode: true,
        major: 3,
        minor: 0,
        patch: 10,
        deviceLocked: false,
        targetId: "test",
      };
      const identity = await MockLedgerIdentity.create({
        version: versionResponse,
      });

      const call = () =>
        assertLedgerVersion({
          identity,
          minVersion,
        });
      expect(call).not.toThrow(LedgerErrorMessage);
    });

    it("should not throw if ledger version is the same as min version", async () => {
      const minVersion = "2.0.6";
      const versionResponse: ResponseVersion = {
        returnCode: LedgerError.NoErrors,
        testMode: true,
        major: 2,
        minor: 0,
        patch: 6,
        deviceLocked: false,
        targetId: "test",
      };
      const identity = await MockLedgerIdentity.create({
        version: versionResponse,
      });

      const call = () =>
        assertLedgerVersion({
          identity,
          minVersion,
        });
      expect(call).not.toThrow(LedgerErrorMessage);
    });

    it("should not throw if identity is not LedgerIdentity", async () => {
      const minVersion = "2.0.6";

      const call = () =>
        assertLedgerVersion({
          identity: mockIdentity,
          minVersion,
        });
      expect(call).not.toThrow(LedgerErrorMessage);
    });
  });
});
