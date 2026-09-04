import RemoveAddressModal from "$lib/modals/address-book/RemoveAddressModal.svelte";
import * as addressBookServices from "$lib/services/address-book.services";
import { addressBookStore } from "$lib/stores/address-book.store";
import {
  mockForgedNamedAddress,
  mockNamedAddressIcp,
  mockNamedAddressIcrc1,
} from "$tests/mocks/address-book.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { toastsStore } from "@dfinity/gix-components";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/services/address-book.services");

describe("RemoveAddressModal", () => {
  const renderRemoveModal = (onClose = vi.fn()) =>
    renderModal({
      component: RemoveAddressModal,
      props: { onClose, namedAddress: mockNamedAddressIcp },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    addressBookStore.reset();
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
      certified: true,
    });

    // The real service returns the entries only when the store holds certified
    // data. The mock keeps that link, so the tests below can drop the
    // certified flag and see the modal refuse to save.
    vi.spyOn(
      addressBookServices,
      "getCertifiedNamedAddresses"
    ).mockImplementation(async () => {
      const { namedAddresses, certified } = get(addressBookStore);
      return certified === true ? namedAddresses : undefined;
    });
  });

  it("should display the entry name", async () => {
    const { queryByTestId } = await renderRemoveModal();

    expect(queryByTestId("remove-address-confirmation")?.textContent).toContain(
      mockNamedAddressIcp.name
    );
  });

  it("should remove the entry from the certified address book", async () => {
    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});
    const onClose = vi.fn();

    const { queryByTestId } = await renderRemoveModal(onClose);

    await fireEvent.click(queryByTestId("confirm-yes"));

    await waitFor(() => expect(saveAddressBookSpy).toHaveBeenCalledTimes(1));

    expect(saveAddressBookSpy).toHaveBeenCalledWith([mockNamedAddressIcrc1]);
    expect(onClose).toHaveBeenCalled();
  });

  it("should not write back an uncertified address book", async () => {
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
      certified: false,
    });

    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});
    const onClose = vi.fn();

    const { queryByTestId } = await renderRemoveModal(onClose);

    await fireEvent.click(queryByTestId("confirm-yes"));

    await waitFor(() =>
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: en.error__address_book.not_certified,
        },
      ])
    );

    expect(saveAddressBookSpy).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should write back the certified address book, not the store snapshot the modal opened with", async () => {
    // The modal opens on a query response that holds a forged entry.
    addressBookStore.set({
      namedAddresses: [
        mockNamedAddressIcp,
        mockNamedAddressIcrc1,
        mockForgedNamedAddress,
      ],
      certified: false,
    });

    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});

    const { queryByTestId } = await renderRemoveModal();

    // The certified response arrives and drops the forged entry.
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
      certified: true,
    });

    await fireEvent.click(queryByTestId("confirm-yes"));

    await waitFor(() => expect(saveAddressBookSpy).toHaveBeenCalledTimes(1));

    expect(saveAddressBookSpy).toHaveBeenCalledWith([mockNamedAddressIcrc1]);
  });

  it("should not save when the entry to remove is absent from the certified address book", async () => {
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcrc1],
      certified: true,
    });

    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});
    const onClose = vi.fn();

    const { queryByTestId } = await renderRemoveModal(onClose);

    await fireEvent.click(queryByTestId("confirm-yes"));

    await waitFor(() =>
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: en.error__address_book.entry_not_found.replace(
            "$name",
            mockNamedAddressIcp.name
          ),
        },
      ])
    );

    expect(saveAddressBookSpy).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
