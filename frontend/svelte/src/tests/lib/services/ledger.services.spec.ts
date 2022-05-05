import { LedgerConnectionState } from "../../../lib/constants/ledger.constants";
import { LedgerIdentity } from "../../../lib/identities/ledger.identity";
import { connectToHardwareWallet } from "../../../lib/services/ledger.services";
import { toastsStore } from "../../../lib/stores/toasts.store";
import { MockLedgerIdentity } from "../../mocks/ledger.identity.mock";

describe("ledger-services", () => {
  const callback = jest.fn();

  describe("connection success", () => {
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

  describe("connection error", () => {
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
