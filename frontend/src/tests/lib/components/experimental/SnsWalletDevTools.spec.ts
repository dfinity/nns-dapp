import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import SnsWalletDevTools from "$lib/components/experimental/SnsWalletDevTools.svelte";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import { hexStringToBytes } from "$lib/utils/utils";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { Principal } from "@icp-sdk/core/principal";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";

describe("SnsWalletDevTools", () => {
  const indexCanisterId = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
  const ledgerCanisterId = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  const token = {
    name: "Test Token",
    symbol: "TEST",
    decimals: 8,
    fee: 10_000n,
  };

  const testSubaccount =
    "bdf5780ae7b5a6590aaa3d9080a16b436b44ca2162f6f9ec20f81a5bc020f2d1";
  const mockSubaccounts = [new Uint8Array([1, 2, 3, 4])];

  // Spy on console methods
  let consoleLogSpy;
  let consoleErrorSpy;

  // Spies for API functions
  let listSubaccountsSpy;
  let queryIcrcBalanceSpy;
  let icrcTransferSpy;

  beforeEach(() => {
    vi.stubGlobal("window", { ...window });

    consoleLogSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    listSubaccountsSpy = vi
      .spyOn(icrcIndexApi, "listSubaccounts")
      .mockResolvedValue(mockSubaccounts);

    queryIcrcBalanceSpy = vi
      .spyOn(icrcLedgerApi, "queryIcrcBalance")
      .mockResolvedValue(1_000_000n);

    icrcTransferSpy = vi
      .spyOn(icrcLedgerApi, "icrcTransfer")
      .mockResolvedValue(123456n);

    resetIdentity();
  });

  const renderComponent = async () => {
    render(SnsWalletDevTools, {
      props: {
        indexCanisterId,
        ledgerCanisterId,
        token,
      },
    });

    // Wait for effects to run
    await tick();
  };

  describe("Namespace and functions", () => {
    it("should attach the namespace to window", async () => {
      await renderComponent();

      expect(window["__experimental_icrc"]).toBeDefined();
      expect(typeof window["__experimental_icrc"].help).toBe("function");
      expect(typeof window["__experimental_icrc"].listSubaccounts).toBe(
        "function"
      );
      expect(typeof window["__experimental_icrc"].getBalance).toBe("function");
      expect(typeof window["__experimental_icrc"].recover).toBe("function");
    });
  });

  describe("listSubaccounts", () => {
    it("should show error when user is not logged in", async () => {
      setNoIdentity();

      await renderComponent();

      await window["__experimental_icrc"].listSubaccounts();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("No identity found")
      );
      expect(listSubaccountsSpy).not.toHaveBeenCalled();
    });

    it("should call listSubaccounts API and display results", async () => {
      await renderComponent();

      await window["__experimental_icrc"].listSubaccounts();

      expect(listSubaccountsSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        indexCanisterId,
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Found subaccounts")
      );

      // Check that each subaccount was logged
      mockSubaccounts.forEach((subaccount, index) => {
        const hexString = subaccountToHexString(subaccount);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(`${index + 1}: ${hexString}`)
        );
      });
    });

    it("should handle empty subaccounts list", async () => {
      listSubaccountsSpy.mockResolvedValue([]);
      await renderComponent();

      await window["__experimental_icrc"].listSubaccounts();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("No subaccounts found")
      );
    });

    it("should handle API errors", async () => {
      listSubaccountsSpy.mockRejectedValue(new Error("Network error"));
      await renderComponent();

      await window["__experimental_icrc"].listSubaccounts();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch subaccounts"),
        expect.any(Error)
      );
    });
  });

  describe("getBalance", () => {
    it("should show error when user is not logged in", async () => {
      setNoIdentity();

      await renderComponent();

      await window["__experimental_icrc"].getBalance(testSubaccount);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("No identity found")
      );
      expect(queryIcrcBalanceSpy).not.toHaveBeenCalled();
    });

    it("should show error when subaccount is not provided", async () => {
      await renderComponent();

      await window["__experimental_icrc"].getBalance(null);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Subaccount was not provided")
      );
      expect(queryIcrcBalanceSpy).not.toHaveBeenCalled();
    });

    it("should call queryIcrcBalance API and display results", async () => {
      await renderComponent();

      await window["__experimental_icrc"].getBalance(testSubaccount);

      expect(queryIcrcBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: true,
        canisterId: ledgerCanisterId,
        account: {
          owner: mockIdentity.getPrincipal(),
          subaccount: hexStringToBytes(testSubaccount),
        },
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Balance: 1000000 ${token.symbol}`)
      );
    });

    it("should handle API errors", async () => {
      queryIcrcBalanceSpy.mockRejectedValue(new Error("Network error"));
      await renderComponent();

      await window["__experimental_icrc"].getBalance(testSubaccount);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Failed to fetch balance for subaccount ${testSubaccount}`
        ),
        expect.any(Error)
      );
    });
  });

  describe("recover", () => {
    it("should show error when user is not logged in", async () => {
      setNoIdentity();

      await renderComponent();

      await window["__experimental_icrc"].recover(testSubaccount);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("No identity found")
      );
      expect(queryIcrcBalanceSpy).not.toHaveBeenCalled();
      expect(icrcTransferSpy).not.toHaveBeenCalled();
    });

    it("should show error when subaccount is not provided", async () => {
      await renderComponent();

      await window["__experimental_icrc"].recover(null);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Subaccount was not provided")
      );
      expect(queryIcrcBalanceSpy).not.toHaveBeenCalled();
      expect(icrcTransferSpy).not.toHaveBeenCalled();
    });

    it("should check balance and show error when not enough to cover fee", async () => {
      queryIcrcBalanceSpy.mockResolvedValue(5_000n); // Less than token.fee (10_000n)
      await renderComponent();

      await window["__experimental_icrc"].recover(testSubaccount);

      expect(queryIcrcBalanceSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Insufficient balance to cover the transfer fee"
        )
      );
      expect(icrcTransferSpy).not.toHaveBeenCalled();
    });

    it("should transfer funds when balance is sufficient", async () => {
      const balance = 1_000_000n;
      queryIcrcBalanceSpy.mockResolvedValue(balance);
      await renderComponent();

      await window["__experimental_icrc"].recover(testSubaccount);

      expect(queryIcrcBalanceSpy).toHaveBeenCalled();

      expect(icrcTransferSpy).toHaveBeenCalledWith({
        canisterId: ledgerCanisterId,
        identity: mockIdentity,
        to: {
          owner: mockIdentity.getPrincipal(),
        },
        amount: balance - token.fee,
        fromSubAccount: hexStringToBytes(testSubaccount),
        fee: token.fee,
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Transfer successful")
      );
    });

    it("should handle transfer errors", async () => {
      icrcTransferSpy.mockRejectedValue(new Error("Transfer failed"));
      await renderComponent();

      await window["__experimental_icrc"].recover(testSubaccount);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Transfer failed"),
        expect.any(Error)
      );
    });
  });
});
