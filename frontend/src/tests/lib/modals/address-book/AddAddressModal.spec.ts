import AddAddressModal from "$lib/modals/address-book/AddAddressModal.svelte";
import * as addressBookServices from "$lib/services/address-book.services";
import { addressBookStore } from "$lib/stores/address-book.store";
import {
  mockNamedAddressIcp,
  mockNamedAddressIcrc1,
} from "$tests/mocks/address-book.mock";
import en from "$tests/mocks/i18n.mock";

import { renderModal } from "$tests/mocks/modal.mock";
import { fireEvent } from "@testing-library/svelte";

vi.mock("$lib/services/address-book.services");

describe("AddAddressModal", () => {
  // Use existing mock addresses from the mocks file
  const validIcpAddress = (mockNamedAddressIcp.address as { Icp: string }).Icp;
  const validIcrc1Address = (mockNamedAddressIcrc1.address as { Icrc1: string })
    .Icrc1;

  beforeEach(() => {
    vi.clearAllMocks();
    addressBookStore.reset();
  });

  it("should display modal", async () => {
    const { container } = await renderModal({
      component: AddAddressModal,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display modal title", async () => {
    const { queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    expect(queryByTestId("add-address-modal-title")).toBeInTheDocument();
    expect(queryByTestId("add-address-modal-title")?.textContent).toBe(
      en.address_book.add_address
    );
  });

  it("should have disabled save button by default", async () => {
    const { queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const saveButton = queryByTestId("save-address-button");
    expect(saveButton?.hasAttribute("disabled")).toBe(true);
  });

  it("should display error if nickname is too short on submit", async () => {
    const { container, queryByText, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: "ab" },
    });

    await fireEvent.input(addressInput, {
      target: { value: "some-address" },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(queryByText(en.address_book.nickname_too_short)).toBeInTheDocument();
  });

  it("should display error if nickname is too long on submit", async () => {
    const { container, queryByText, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    const longNickname = "a".repeat(21);
    await fireEvent.input(nicknameInput, {
      target: { value: longNickname },
    });

    await fireEvent.input(addressInput, {
      target: { value: "some-address" },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(queryByText(en.address_book.nickname_too_long)).toBeInTheDocument();
  });

  it("should display error if nickname is already used on submit", async () => {
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp],
      certified: true,
    });

    const { container, queryByText, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: mockNamedAddressIcp.name },
    });

    await fireEvent.input(addressInput, {
      target: { value: "some-address" },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(
      queryByText(en.address_book.nickname_already_used)
    ).toBeInTheDocument();
  });

  it("should show error for duplicate nickname with different case on submit", async () => {
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp],
      certified: true,
    });

    const { container, queryByText, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: mockNamedAddressIcp.name.toUpperCase() },
    });

    await fireEvent.input(addressInput, {
      target: { value: "some-address" },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(
      queryByText(en.address_book.nickname_already_used)
    ).toBeInTheDocument();
  });

  it("should show error for duplicate nickname with trailing spaces on submit", async () => {
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp],
      certified: true,
    });

    const { container, queryByText, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: `${mockNamedAddressIcp.name}  ` },
    });

    await fireEvent.input(addressInput, {
      target: { value: "some-address" },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(
      queryByText(en.address_book.nickname_already_used)
    ).toBeInTheDocument();
  });

  it("should display error if address is invalid on submit", async () => {
    const { container, queryByText, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: "ValidNickname" },
    });

    await fireEvent.input(addressInput, {
      target: { value: "invalid-address" },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(queryByText(en.address_book.invalid_address)).toBeInTheDocument();
  });

  it("should clear error messages when inputs change after submit attempt", async () => {
    const { container, queryByText, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: "a" },
    });
    await fireEvent.input(addressInput, {
      target: { value: "some-address" },
    });

    // Error should not show until submit
    expect(
      queryByText(en.address_book.nickname_too_short)
    ).not.toBeInTheDocument();

    // Button should be enabled
    let saveButton = queryByTestId("save-address-button");
    expect(saveButton?.hasAttribute("disabled")).toBe(false);
    await fireEvent.click(saveButton);

    // Now error should be shown
    expect(queryByText(en.address_book.nickname_too_short)).toBeInTheDocument();
    // Button should be disabled
    expect(saveButton?.hasAttribute("disabled")).toBe(true);

    // Change the inputs
    await fireEvent.input(nicknameInput, {
      target: { value: "ab" },
    });
    await fireEvent.input(addressInput, {
      target: { value: "some-address2" },
    });

    // Error should be cleared
    expect(
      queryByText(en.address_book.nickname_too_short)
    ).not.toBeInTheDocument();

    // Button should be enabled again
    saveButton = queryByTestId("save-address-button");
    expect(saveButton?.hasAttribute("disabled")).toBe(false);
  });

  it("should enable save button when inputs are valid", async () => {
    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: "MyAddress" },
    });

    await fireEvent.input(addressInput, {
      target: { value: validIcpAddress },
    });

    const saveButton = queryByTestId("save-address-button");
    expect(saveButton?.hasAttribute("disabled")).toBe(false);
  });

  it("should call saveAddressBook with ICP address", async () => {
    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});

    const onClose = vi.fn();

    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
      props: {
        onClose,
      },
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: "MyAddress" },
    });

    await fireEvent.input(addressInput, {
      target: { value: validIcpAddress },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(saveAddressBookSpy).toHaveBeenCalledWith([
      {
        name: "MyAddress",
        address: { Icp: validIcpAddress },
      },
    ]);

    expect(onClose).toHaveBeenCalled();
  });

  it("should call saveAddressBook with ICRC1 address", async () => {
    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});

    const onClose = vi.fn();

    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
      props: {
        onClose,
      },
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: "MyICRC1" },
    });

    await fireEvent.input(addressInput, {
      target: { value: validIcrc1Address },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(saveAddressBookSpy).toHaveBeenCalledWith([
      {
        name: "MyICRC1",
        address: { Icrc1: validIcrc1Address },
      },
    ]);

    expect(onClose).toHaveBeenCalled();
  });

  it("should append to existing addresses", async () => {
    addressBookStore.set({
      namedAddresses: [mockNamedAddressIcp],
      certified: true,
    });

    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});

    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: "NewAddress" },
    });

    await fireEvent.input(addressInput, {
      target: { value: validIcrc1Address },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(saveAddressBookSpy).toHaveBeenCalledWith([
      mockNamedAddressIcp,
      {
        name: "NewAddress",
        address: { Icrc1: validIcrc1Address },
      },
    ]);
  });

  it("should not close modal on error", async () => {
    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({ err: new Error("test error") });

    const onClose = vi.fn();

    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
      props: {
        onClose,
      },
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    await fireEvent.input(nicknameInput, {
      target: { value: "MyAddress" },
    });

    await fireEvent.input(addressInput, {
      target: { value: validIcpAddress },
    });

    const saveButton = queryByTestId("save-address-button");
    await fireEvent.click(saveButton);

    expect(saveAddressBookSpy).toHaveBeenCalled();

    // Modal should not close on error
    expect(onClose).not.toHaveBeenCalled();

    // Form should still have the values
    expect((nicknameInput as HTMLInputElement)?.value).toBe("MyAddress");
    expect((addressInput as HTMLInputElement)?.value).toBe(validIcpAddress);
  });

  it("should close modal on cancel", async () => {
    const onClose = vi.fn();

    const { queryByTestId } = await renderModal({
      component: AddAddressModal,
      props: {
        onClose,
      },
    });

    const cancelButton = queryByTestId("cancel-button");
    await fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });

  describe("Edit mode", () => {
    it("should display 'Edit Address' title when namedAddress is provided", async () => {
      const { queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      expect(queryByTestId("add-address-modal-title")).toBeInTheDocument();
      expect(queryByTestId("add-address-modal-title")?.textContent).toBe(
        en.address_book.edit_address
      );
    });

    it("should prefill form with existing data", async () => {
      const { container } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      const nicknameInput = container.querySelector(
        "input[name='nickname']"
      ) as HTMLInputElement;
      const addressInput = container.querySelector(
        "input[name='address']"
      ) as HTMLInputElement;

      expect(nicknameInput?.value).toBe(mockNamedAddressIcp.name);
      expect(addressInput?.value).toBe(
        (mockNamedAddressIcp.address as { Icp: string }).Icp
      );
    });

    it("should prefill form with ICRC1 address data", async () => {
      const { container } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcrc1,
        },
      });

      const nicknameInput = container.querySelector(
        "input[name='nickname']"
      ) as HTMLInputElement;
      const addressInput = container.querySelector(
        "input[name='address']"
      ) as HTMLInputElement;

      expect(nicknameInput?.value).toBe(mockNamedAddressIcrc1.name);
      expect(addressInput?.value).toBe(
        (mockNamedAddressIcrc1.address as { Icrc1: string }).Icrc1
      );
    });

    it("should disable save button when nothing has changed", async () => {
      const { queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      const saveButton = queryByTestId("save-address-button");
      expect(saveButton?.hasAttribute("disabled")).toBe(true);
    });

    it("should enable save button when nickname is changed", async () => {
      const { container, queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      const nicknameInput = container.querySelector("input[name='nickname']");

      await fireEvent.input(nicknameInput, {
        target: { value: "NewNickname" },
      });

      const saveButton = queryByTestId("save-address-button");
      expect(saveButton?.hasAttribute("disabled")).toBe(false);
    });

    it("should enable save button when address is changed", async () => {
      const { container, queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      const addressInput = container.querySelector("input[name='address']");

      await fireEvent.input(addressInput, {
        target: { value: validIcrc1Address },
      });

      const saveButton = queryByTestId("save-address-button");
      expect(saveButton?.hasAttribute("disabled")).toBe(false);
    });

    it("should disable save button when changes are reverted", async () => {
      const { container, queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      const nicknameInput = container.querySelector("input[name='nickname']");

      // Change the value
      await fireEvent.input(nicknameInput, {
        target: { value: "NewNickname" },
      });

      let saveButton = queryByTestId("save-address-button");
      expect(saveButton?.hasAttribute("disabled")).toBe(false);

      // Revert the value
      await fireEvent.input(nicknameInput, {
        target: { value: mockNamedAddressIcp.name },
      });

      saveButton = queryByTestId("save-address-button");
      expect(saveButton?.hasAttribute("disabled")).toBe(true);
    });

    it("should allow keeping same nickname when editing", async () => {
      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
        certified: true,
      });

      const saveAddressBookSpy = vi
        .spyOn(addressBookServices, "saveAddressBook")
        .mockResolvedValue({});

      const { container, queryByText, queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      const addressInput = container.querySelector("input[name='address']");

      await fireEvent.input(addressInput, {
        target: { value: validIcrc1Address },
      });

      const saveButton = queryByTestId("save-address-button");
      await fireEvent.click(saveButton);

      expect(saveAddressBookSpy).toHaveBeenCalled();
      expect(
        queryByText(en.address_book.nickname_already_used)
      ).not.toBeInTheDocument();
    });

    it("should not allow using another existing nickname", async () => {
      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
        certified: true,
      });

      const { container, queryByText, queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      const nicknameInput = container.querySelector("input[name='nickname']");

      await fireEvent.input(nicknameInput, {
        target: { value: mockNamedAddressIcrc1.name },
      });

      const saveButton = queryByTestId("save-address-button");
      await fireEvent.click(saveButton);

      expect(
        queryByText(en.address_book.nickname_already_used)
      ).toBeInTheDocument();
    });

    it("should call saveAddressBook with updated address", async () => {
      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp],
        certified: true,
      });

      const saveAddressBookSpy = vi
        .spyOn(addressBookServices, "saveAddressBook")
        .mockResolvedValue({});

      const onClose = vi.fn();

      const { container, queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
          onClose,
        },
      });

      const nicknameInput = container.querySelector("input[name='nickname']");

      // Change the nickname
      await fireEvent.input(nicknameInput, {
        target: { value: "UpdatedNickname" },
      });

      const saveButton = queryByTestId("save-address-button");
      await fireEvent.click(saveButton);

      expect(saveAddressBookSpy).toHaveBeenCalledWith([
        {
          name: "UpdatedNickname",
          address: mockNamedAddressIcp.address,
        },
      ]);

      expect(onClose).toHaveBeenCalled();
    });

    it("should replace the correct entry when multiple addresses exist", async () => {
      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp, mockNamedAddressIcrc1],
        certified: true,
      });

      const saveAddressBookSpy = vi
        .spyOn(addressBookServices, "saveAddressBook")
        .mockResolvedValue({});

      const { container, queryByTestId } = await renderModal({
        component: AddAddressModal,
        props: {
          namedAddress: mockNamedAddressIcp,
        },
      });

      const addressInput = container.querySelector("input[name='address']");

      // Change Alice's address
      await fireEvent.input(addressInput, {
        target: { value: validIcrc1Address },
      });

      const saveButton = queryByTestId("save-address-button");
      await fireEvent.click(saveButton);

      expect(saveAddressBookSpy).toHaveBeenCalledWith([
        {
          name: mockNamedAddressIcp.name,
          address: { Icrc1: validIcrc1Address },
        },
        mockNamedAddressIcrc1,
      ]);
    });
  });
});
