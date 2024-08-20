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
  resetIdentitiesCachedForTesting,
  showAddressAndPubKeyOnHardwareWallet,
} from "$lib/services/icp-ledger.services";
import * as toastsStore from "$lib/stores/toasts.store";
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
import { principalToAccountIdentifier } from "@dfinity/ledger-icp";
import { LedgerError, type ResponseVersion } from "@zondax/ledger-icp";
import { mock } from "vitest-mock-extended";

describe("icp-ledger.services", () => {
  const callback = vi.fn();
  const mockLedgerIdentity: MockLedgerIdentity = new MockLedgerIdentity();
  const ledgerPrincipal2 = mockPrincipal;
  const mockLedgerIdentity2: MockLedgerIdentity = new MockLedgerIdentity({
    principal: ledgerPrincipal2,
  });

  beforeEach(() => {
    resetIdentitiesCachedForTesting();
    vi.clearAllMocks();
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
        const spyToastError = vi.spyOn(toastsStore, "toastsError");

        await connectToHardwareWallet(callback);

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__ledger.browser_not_supported",
        });

        spyToastError.mockRestore();
      });
    });
  });

  describe("register hardware wallet", () => {
    const mockNNSDappCanister: MockNNSDappCanister = new MockNNSDappCanister();

    const ledgerIdentity = new MockLedgerIdentity();

    let spySyncAccounts;

    beforeAll(() => {
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
        const spyToastError = vi.spyOn(toastsStore, "toastsError");

        await registerHardwareWallet({
          name: undefined,
          ledgerIdentity,
        });

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__attach_wallet.no_name",
        });

        spyToastError.mockRestore();
      });

      it("should throw an error if no ledger identity provided", async () => {
        const spyToastError = vi.spyOn(toastsStore, "toastsError");

        await registerHardwareWallet({
          name: "test",
          ledgerIdentity: undefined,
        });

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__attach_wallet.no_identity",
        });

        spyToastError.mockRestore();
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

    it("should cache ledger identity for same identifier", async () => {
      const identity1 = await getLedgerIdentity(mockLedgerIdentifier);

      expect(identity1).not.toBeNull();
      expect(LedgerIdentity.create).toHaveBeenCalledTimes(1);

      const identity2 = await getLedgerIdentity(mockLedgerIdentifier);

      expect(identity2).toBe(identity1);
      expect(LedgerIdentity.create).toHaveBeenCalledTimes(1);
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

    beforeAll(() => {
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

        const spyToastError = vi.spyOn(toastsStore, "toastsError");

        await showAddressAndPubKeyOnHardwareWallet();

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__ledger.unexpected_wallet",
          renderAsHtml: false,
        });

        spyToastError.mockRestore();
      });
    });
  });

  describe("query neurons", () => {
    const mockNeurons = [mockNeuron];

    beforeAll(() => {
      vi.spyOn(api, "queryNeurons").mockImplementation(() =>
        Promise.resolve(mockNeurons)
      );
    });

    describe("success", () => {
      beforeAll(() => {
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
      beforeAll(() => {
        vi.spyOn(LedgerIdentity, "create").mockImplementation(
          async (): Promise<LedgerIdentity> => {
            throw new LedgerErrorKey({ message: "error__ledger.please_open" });
          }
        );
      });

      it("should not list neurons if ledger throw an error", async () => {
        const spyToastError = vi.spyOn(toastsStore, "toastsError");

        const { err } = await listNeuronsHardwareWallet();

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__ledger.please_open",
          renderAsHtml: false,
        });

        expect(err).not.toBeUndefined();

        spyToastError.mockRestore();
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
