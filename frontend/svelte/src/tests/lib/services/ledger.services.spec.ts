import type { HttpAgent } from "@dfinity/agent";
import { principalToAccountIdentifier } from "@dfinity/nns";
import { LedgerError, type ResponseVersion } from "@zondax/ledger-icp";
import { mock } from "jest-mock-extended";
import * as api from "../../../lib/api/governance.api";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import { LedgerConnectionState } from "../../../lib/constants/ledger.constants";
import { LedgerIdentity } from "../../../lib/identities/ledger.identity";
import * as accountsServices from "../../../lib/services/accounts.services";
import * as authServices from "../../../lib/services/auth.services";
import {
  assertLedgerVersion,
  connectToHardwareWallet,
  getLedgerIdentity,
  listNeuronsHardwareWallet,
  registerHardwareWallet,
  showAddressAndPubKeyOnHardwareWallet,
} from "../../../lib/services/ledger.services";
import { authStore } from "../../../lib/stores/auth.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import {
  LedgerErrorKey,
  LedgerErrorMessage,
} from "../../../lib/types/ledger.errors";
import * as agent from "../../../lib/utils/agent.utils";
import { replacePlaceholders } from "../../../lib/utils/i18n.utils";
import {
  mockAuthStoreSubscribe,
  mockGetIdentity,
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import {
  mockLedgerIdentifier,
  MockLedgerIdentity,
} from "../../mocks/ledger.identity.mock";
import { mockNeuron } from "../../mocks/neurons.mock";
import { MockNNSDappCanister } from "../../mocks/nns-dapp.canister.mock";

describe("ledger-services", () => {
  describe("connect hardware wallet", () => {
    const callback = jest.fn();

    describe("success", () => {
      const mockLedgerIdentity: MockLedgerIdentity = new MockLedgerIdentity();

      beforeAll(() =>
        jest
          .spyOn(LedgerIdentity, "create")
          .mockImplementation(
            async (): Promise<LedgerIdentity> => mockLedgerIdentity
          )
      );

      afterAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
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
      it("should set not connected state on error", async () => {
        await connectToHardwareWallet(callback);

        expect(callback).toHaveBeenNthCalledWith(2, {
          connectionState: LedgerConnectionState.NOT_CONNECTED,
        });
      });

      it("should display a toast for the error assuming the user has cancelled the process", async () => {
        const spyToastError = jest.spyOn(toastsStore, "error");

        await connectToHardwareWallet(callback);

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__ledger.user_cancel",
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
      jest
        .spyOn(NNSDappCanister, "create")
        .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

      spySyncAccounts = jest
        .spyOn(accountsServices, "syncAccounts")
        .mockImplementation(jest.fn());

      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);

      const mockCreateAgent = () => Promise.resolve(mock<HttpAgent>());
      jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);

      jest
        .spyOn(authServices, "getIdentity")
        .mockImplementation(() => Promise.resolve(mockGetIdentity()));
    });

    afterAll(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    describe("success", () => {
      it("should sync accounts after register", async () => {
        await registerHardwareWallet({ name: "test", ledgerIdentity });

        expect(spySyncAccounts).toHaveBeenCalled();
      });
    });

    describe("error", () => {
      it("should throw an error if no name provided", async () => {
        const spyToastError = jest.spyOn(toastsStore, "error");

        await registerHardwareWallet({ name: undefined, ledgerIdentity });

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__attach_wallet.no_name",
        });

        spyToastError.mockRestore();
      });

      it("should throw an error if no ledger identity provided", async () => {
        const spyToastError = jest.spyOn(toastsStore, "error");

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
    const mockLedgerIdentity: MockLedgerIdentity = new MockLedgerIdentity();

    beforeAll(() =>
      jest
        .spyOn(LedgerIdentity, "create")
        .mockImplementation(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity
        )
    );

    afterAll(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it("should return ledger identity", async () => {
      const identity = await getLedgerIdentity(mockLedgerIdentifier);

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
    const mockLedgerIdentity: MockLedgerIdentity = new MockLedgerIdentity();

    let spy;

    beforeAll(() => {
      jest
        .spyOn(LedgerIdentity, "create")
        .mockImplementation(
          async (): Promise<LedgerIdentity> => mockLedgerIdentity
        );

      spy = jest.spyOn(mockLedgerIdentity, "showAddressAndPubKeyOnDevice");
    });

    afterAll(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
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
          throw new LedgerErrorKey("error__ledger.unexpected_wallet");
        });

        const spyToastError = jest.spyOn(toastsStore, "error");

        await showAddressAndPubKeyOnHardwareWallet();

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__ledger.unexpected_wallet",
        });

        spyToastError.mockRestore();
      });
    });
  });

  describe("query neurons", () => {
    const mockLedgerIdentity: MockLedgerIdentity = new MockLedgerIdentity();
    const mockNeurons = [mockNeuron];

    beforeAll(() => {
      jest
        .spyOn(api, "queryNeurons")
        .mockImplementation(() => Promise.resolve(mockNeurons));
    });

    describe("success", () => {
      beforeAll(() =>
        jest
          .spyOn(LedgerIdentity, "create")
          .mockImplementation(
            async (): Promise<LedgerIdentity> => mockLedgerIdentity
          )
      );

      it("should list neurons on hardware wallet", async () => {
        const { neurons } = await listNeuronsHardwareWallet();

        expect(neurons).toEqual(mockNeurons);
      });
    });

    describe("error", () => {
      beforeAll(() =>
        jest
          .spyOn(LedgerIdentity, "create")
          .mockImplementation(async (): Promise<LedgerIdentity> => {
            throw new LedgerErrorKey("error__ledger.please_open");
          })
      );

      it("should not list neurons if ledger throw an error", async () => {
        const spyToastError = jest.spyOn(toastsStore, "error");

        const { err } = await listNeuronsHardwareWallet();

        expect(spyToastError).toBeCalled();
        expect(spyToastError).toBeCalledWith({
          labelKey: "error__ledger.please_open",
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
