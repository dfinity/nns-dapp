import * as addressBookApi from "$lib/api/address-book.api";
import { getCertifiedNamedAddresses } from "$lib/services/address-book.services";
import { addressBookStore } from "$lib/stores/address-book.store";
import {
  mockForgedNamedAddress,
  mockNamedAddressIcp,
} from "$tests/mocks/address-book.mock";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import * as dfinityUtils from "@dfinity/utils";
import { get } from "svelte/store";

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

      vi.spyOn(addressBookApi, "getAddressBook").mockResolvedValue({
        named_addresses: [mockNamedAddressIcp],
      });

      expect(await getCertifiedNamedAddresses()).toEqual([mockNamedAddressIcp]);
      expect(get(addressBookStore).certified).toBe(true);
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

    it("should return undefined when the address book was never loaded", async () => {
      vi.spyOn(addressBookApi, "getAddressBook").mockRejectedValue(
        new Error("test")
      );

      expect(await getCertifiedNamedAddresses()).toBeUndefined();
    });
  });
});
