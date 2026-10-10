import RemoveAddressModal from "$lib/modals/address-book/RemoveAddressModal.svelte";
import * as addressBookServices from "$lib/services/address-book.services";
import { addressBookStore } from "$lib/stores/address-book.store";
import { mockNamedAddressIcp } from "$tests/mocks/address-book.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { fireEvent } from "@testing-library/svelte";

vi.mock("$lib/services/address-book.services");

describe("RemoveAddressModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp],
      certified: true,
    });
  });

  it("removes an address through a mutation", async () => {
    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});
    const onClose = vi.fn();
    const { queryByTestId } = await renderModal({
      component: RemoveAddressModal,
      props: { namedAddress: mockNamedAddressIcp, onClose },
    });

    await fireEvent.click(queryByTestId("confirm-yes"));

    expect(saveAddressBookSpy).toHaveBeenCalledWith({
      type: "remove",
      name: mockNamedAddressIcp.name,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("disables removal while the address book is uncertified", async () => {
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp],
      certified: false,
    });
    const saveAddressBookSpy = vi.spyOn(addressBookServices, "saveAddressBook");
    const { queryByTestId } = await renderModal({
      component: RemoveAddressModal,
      props: { namedAddress: mockNamedAddressIcp, onClose: vi.fn() },
    });

    expect(queryByTestId("confirm-yes")).toBeDisabled();
    expect(saveAddressBookSpy).not.toHaveBeenCalled();
  });
});
