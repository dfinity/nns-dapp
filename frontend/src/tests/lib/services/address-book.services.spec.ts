import * as addressBookApi from "$lib/api/address-book.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import {
  getCertifiedNamedAddresses,
  loadAddressBook,
  saveAddressBook,
} from "$lib/services/address-book.services";
import { addressBookStore } from "$lib/stores/address-book.store";
import {
  mockForgedNamedAddress,
  mockNamedAddressIcp,
} from "$tests/mocks/address-book.mock";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockedConstants } from "$tests/utils/mockable-constants.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import * as dfinityUtils from "@dfinity/utils";
import { get } from "svelte/store";

// The query response of a single replica can hold a forged entry. The certified
// response always lands later than the query response in production, because
// an update call runs consensus. Reproduce that order here.
const QUERY_RESPONSE_DELAY_MS = 0;
const CERTIFIED_RESPONSE_DELAY_MS = 50;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// The query response holds a forged entry. The certified response does not.
const mockSlowCertifiedGetAddressBook = () =>
  vi
    .spyOn(addressBookApi, "getAddressBook")
    .mockImplementation(async ({ certified }) => {
      if (certified) {
        await delay(CERTIFIED_RESPONSE_DELAY_MS);
        return { named_addresses: [mockNamedAddressIcp] };
      }

      await delay(QUERY_RESPONSE_DELAY_MS);
      return { named_addresses: [mockNamedAddressIcp, mockForgedNamedAddress] };
    });

describe("address-book-services", () => {
  beforeEach(() => {
    resetIdentity();
    vi.spyOn(console, "error").mockReturnValue();
    vi.spyOn(dfinityUtils, "createAgent").mockReturnValue(undefined);
    addressBookStore.reset();
  });

  describe("getCertifiedNamedAddresses", () => {
    it("should return the entries without reloading when the store is certified", async () => {
      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp],
        certified: true,
      });

      const getAddressBookSpy = vi.spyOn(addressBookApi, "getAddressBook");

      expect(await getCertifiedNamedAddresses()).toEqual([mockNamedAddressIcp]);
      expect(getAddressBookSpy).not.toHaveBeenCalled();
    });

    it("should discard an uncertified snapshot and return the certified entries", async () => {
      // The store holds a query response with a forged entry.
      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp, mockForgedNamedAddress],
        certified: false,
      });

      mockSlowCertifiedGetAddressBook();

      expect(await getCertifiedNamedAddresses()).toEqual([mockNamedAddressIcp]);
      expect(get(addressBookStore).certified).toBe(true);
    });

    it("should reload with the update strategy and make no query call", async () => {
      addressBookStore.set({
        namedAddresses: [mockForgedNamedAddress],
        certified: false,
      });

      const getAddressBookSpy = mockSlowCertifiedGetAddressBook();

      await getCertifiedNamedAddresses();

      expect(getAddressBookSpy).toHaveBeenCalledTimes(1);
      expect(getAddressBookSpy).toHaveBeenCalledWith(
        expect.objectContaining({ certified: true })
      );
    });

    it("should return an empty address book for a user who has no account yet", async () => {
      // A new user has no account in the nns-dapp canister until the first
      // write. The certified call then fails with `AccountNotFoundError`.
      vi.spyOn(addressBookApi, "getAddressBook").mockImplementation(
        async () => {
          await delay(CERTIFIED_RESPONSE_DELAY_MS);
          throw new AccountNotFoundError("Account not found");
        }
      );

      expect(await getCertifiedNamedAddresses()).toEqual([]);
    });

    it("should reload with the update strategy when the session forces the query strategy", async () => {
      // A forced-query session never gets certified data from its own loads.
      // A save must still build on certified entries, so it makes one update
      // call of its own.
      mockedConstants.FORCE_CALL_STRATEGY = "query";

      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp, mockForgedNamedAddress],
        certified: false,
      });

      const getAddressBookSpy = mockSlowCertifiedGetAddressBook();

      expect(await getCertifiedNamedAddresses()).toEqual([mockNamedAddressIcp]);

      expect(getAddressBookSpy).toHaveBeenCalledTimes(1);
      expect(getAddressBookSpy).toHaveBeenCalledWith(
        expect.objectContaining({ certified: true })
      );
    });

    it("should return undefined when the reload fails", async () => {
      addressBookStore.set({
        namedAddresses: [mockForgedNamedAddress],
        certified: false,
      });

      vi.spyOn(addressBookApi, "getAddressBook").mockRejectedValue(
        new Error("test")
      );

      expect(await getCertifiedNamedAddresses()).toBeUndefined();
    });

    it("should show no toast when the reload fails", async () => {
      // The caller shows one message for the whole failed save. The reload must
      // not add a second toast.
      addressBookStore.set({
        namedAddresses: [mockForgedNamedAddress],
        certified: false,
      });

      vi.spyOn(addressBookApi, "getAddressBook").mockRejectedValue(
        new Error("test")
      );

      expect(get(toastsStore)).toHaveLength(0);

      await getCertifiedNamedAddresses();

      expect(get(toastsStore)).toHaveLength(0);
    });

    it("should return undefined when the address book was never loaded", async () => {
      vi.spyOn(addressBookApi, "getAddressBook").mockRejectedValue(
        new Error("test")
      );

      expect(await getCertifiedNamedAddresses()).toBeUndefined();
    });
  });

  describe("loadAddressBook", () => {
    it("should show an error toast when the load fails", async () => {
      vi.spyOn(addressBookApi, "getAddressBook").mockRejectedValue(
        new Error("test")
      );

      expect(get(toastsStore)).toHaveLength(0);

      await loadAddressBook({ strategy: "update" });

      expect(get(toastsStore)).toHaveLength(1);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
      });
    });

    it("should show no error toast when the caller asks for silent errors", async () => {
      vi.spyOn(addressBookApi, "getAddressBook").mockRejectedValue(
        new Error("test")
      );

      await loadAddressBook({
        silentErrorMessages: true,
        strategy: "update",
      });

      expect(get(toastsStore)).toHaveLength(0);
    });
  });

  describe("saveAddressBook", () => {
    it("should leave the store certified after a save", async () => {
      vi.spyOn(addressBookApi, "setAddressBook").mockResolvedValue(undefined);
      mockSlowCertifiedGetAddressBook();

      expect(await saveAddressBook([mockNamedAddressIcp])).toBeUndefined();

      expect(get(addressBookStore)).toEqual({
        namedAddresses: [mockNamedAddressIcp],
        certified: true,
      });
    });
  });
});
