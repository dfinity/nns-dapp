import * as addressBookApi from "$lib/api/address-book.api";
import { saveAddressBook } from "$lib/services/address-book.services";
import { addressBookStore } from "$lib/stores/address-book.store";
import {
  mockNamedAddressIcp,
  mockNamedAddressIcrc1,
} from "$tests/mocks/address-book.mock";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";

describe("address-book services", () => {
  beforeEach(() => {
    resetIdentity();
    addressBookStore.reset();
    vi.spyOn(console, "error").mockReturnValue();
  });

  it("adds an address to certified backend data", async () => {
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcrc1],
      certified: false,
    });
    vi.spyOn(addressBookApi, "getAddressBook").mockResolvedValue({
      named_addresses: [mockNamedAddressIcp],
    });
    const setAddressBookSpy = vi
      .spyOn(addressBookApi, "setAddressBook")
      .mockResolvedValue();

    await saveAddressBook({
      type: "add",
      address: mockNamedAddressIcrc1,
    });

    expect(addressBookApi.getAddressBook).toHaveBeenCalledWith({
      identity: mockIdentity,
      certified: true,
    });
    expect(setAddressBookSpy).toHaveBeenCalledWith({
      identity: mockIdentity,
      namedAddresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
    });
  });

  it("updates an address in certified backend data", async () => {
    vi.spyOn(addressBookApi, "getAddressBook").mockResolvedValue({
      named_addresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
    });
    const setAddressBookSpy = vi
      .spyOn(addressBookApi, "setAddressBook")
      .mockResolvedValue();
    const updatedAddress = {
      ...mockNamedAddressIcp,
      name: "Updated address",
    };

    await saveAddressBook({
      type: "update",
      previousName: mockNamedAddressIcp.name,
      address: updatedAddress,
    });

    expect(setAddressBookSpy).toHaveBeenCalledWith({
      identity: mockIdentity,
      namedAddresses: [updatedAddress, mockNamedAddressIcrc1],
    });
  });

  it("removes an address from certified backend data", async () => {
    vi.spyOn(addressBookApi, "getAddressBook").mockResolvedValue({
      named_addresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
    });
    const setAddressBookSpy = vi
      .spyOn(addressBookApi, "setAddressBook")
      .mockResolvedValue();

    await saveAddressBook({
      type: "remove",
      name: mockNamedAddressIcp.name,
    });

    expect(setAddressBookSpy).toHaveBeenCalledWith({
      identity: mockIdentity,
      namedAddresses: [mockNamedAddressIcrc1],
    });
  });
});
