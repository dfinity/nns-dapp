import AddAddressModal from "$lib/modals/address-book/AddAddressModal.svelte";
import * as addressBookServices from "$lib/services/address-book.services";
import { addressBookStore } from "$lib/stores/address-book.store";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/services/address-book.services");

describe("AddAddressModal", () => {
  const validIcpAddress =
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f";
  // Valid ICRC1 address format (principal or principal.subaccount)
  const validIcrc1Address =
    "h4a5i-5vcfo-5rusv-fmb6m-vrkia-mjnkc-jpoow-h5mam-nthnm-ldqlr-bqe";

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

  it("should display error if nickname is too short", async () => {
    const { container, queryByText } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    expect(nicknameInput).not.toBeNull();

    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: "ab" },
      }));

    expect(queryByText(en.address_book.nickname_too_short)).toBeInTheDocument();
  });

  it("should display error if nickname is too long", async () => {
    const { container, queryByText } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    expect(nicknameInput).not.toBeNull();

    const longNickname = "a".repeat(21);
    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: longNickname },
      }));

    expect(queryByText(en.address_book.nickname_too_long)).toBeInTheDocument();
  });

  it("should display error if nickname is already used", async () => {
    addressBookStore.set({
      namedAddresses: [
        {
          name: "existing",
          address: { Icp: validIcpAddress },
        },
      ],
      certified: true,
    });

    const { container, queryByText } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    expect(nicknameInput).not.toBeNull();

    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: "existing" },
      }));

    expect(
      queryByText(en.address_book.nickname_already_used)
    ).toBeInTheDocument();
  });

  it("should display error if address is invalid", async () => {
    const { container, queryByText } = await renderModal({
      component: AddAddressModal,
    });

    const addressInput = container.querySelector("input[name='address']");
    expect(addressInput).not.toBeNull();

    addressInput &&
      (await fireEvent.input(addressInput, {
        target: { value: "invalid-address" },
      }));

    expect(queryByText(en.address_book.invalid_address)).toBeInTheDocument();
  });

  it("should not display error if inputs are empty", async () => {
    const { container, queryByText } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    expect(nicknameInput).not.toBeNull();
    expect(addressInput).not.toBeNull();

    expect(
      queryByText(en.address_book.nickname_too_short)
    ).not.toBeInTheDocument();
    expect(
      queryByText(en.address_book.invalid_address)
    ).not.toBeInTheDocument();
  });

  it("should enable save button when inputs are valid", async () => {
    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: "MyAddress" },
      }));

    addressInput &&
      (await fireEvent.input(addressInput, {
        target: { value: validIcpAddress },
      }));

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
      events: {
        nnsClose: onClose,
      },
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: "MyAddress" },
      }));

    addressInput &&
      (await fireEvent.input(addressInput, {
        target: { value: validIcpAddress },
      }));

    const saveButton = queryByTestId("save-address-button");
    saveButton && (await fireEvent.click(saveButton));

    await waitFor(() =>
      expect(saveAddressBookSpy).toHaveBeenCalledWith([
        {
          name: "MyAddress",
          address: { Icp: validIcpAddress },
        },
      ])
    );

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("should call saveAddressBook with ICRC1 address", async () => {
    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});

    const onClose = vi.fn();

    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
      events: {
        nnsClose: onClose,
      },
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: "MyICRC1" },
      }));

    addressInput &&
      (await fireEvent.input(addressInput, {
        target: { value: validIcrc1Address },
      }));

    const saveButton = queryByTestId("save-address-button");
    saveButton && (await fireEvent.click(saveButton));

    await waitFor(() =>
      expect(saveAddressBookSpy).toHaveBeenCalledWith([
        {
          name: "MyICRC1",
          address: { Icrc1: validIcrc1Address },
        },
      ])
    );

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("should append to existing addresses", async () => {
    addressBookStore.set({
      namedAddresses: [
        {
          name: "existing",
          address: { Icp: validIcpAddress },
        },
      ],
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

    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: "NewAddress" },
      }));

    addressInput &&
      (await fireEvent.input(addressInput, {
        target: { value: validIcrc1Address },
      }));

    const saveButton = queryByTestId("save-address-button");
    saveButton && (await fireEvent.click(saveButton));

    await waitFor(() =>
      expect(saveAddressBookSpy).toHaveBeenCalledWith([
        {
          name: "existing",
          address: { Icp: validIcpAddress },
        },
        {
          name: "NewAddress",
          address: { Icrc1: validIcrc1Address },
        },
      ])
    );
  });

  it("should not close modal on error", async () => {
    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({ err: new Error("test error") });

    const onClose = vi.fn();

    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
      events: {
        nnsClose: onClose,
      },
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: "MyAddress" },
      }));

    addressInput &&
      (await fireEvent.input(addressInput, {
        target: { value: validIcpAddress },
      }));

    const saveButton = queryByTestId("save-address-button");
    saveButton && (await fireEvent.click(saveButton));

    await waitFor(() => expect(saveAddressBookSpy).toHaveBeenCalled());

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
      events: {
        nnsClose: onClose,
      },
    });

    const cancelButton = queryByTestId("cancel-button");
    cancelButton && (await fireEvent.click(cancelButton));

    expect(onClose).toHaveBeenCalled();
  });

  it("should start with empty addressBookStore if undefined", async () => {
    const saveAddressBookSpy = vi
      .spyOn(addressBookServices, "saveAddressBook")
      .mockResolvedValue({});

    addressBookStore.reset();
    expect(get(addressBookStore).namedAddresses).toBeUndefined();

    const { container, queryByTestId } = await renderModal({
      component: AddAddressModal,
    });

    const nicknameInput = container.querySelector("input[name='nickname']");
    const addressInput = container.querySelector("input[name='address']");

    nicknameInput &&
      (await fireEvent.input(nicknameInput, {
        target: { value: "FirstAddress" },
      }));

    addressInput &&
      (await fireEvent.input(addressInput, {
        target: { value: validIcpAddress },
      }));

    const saveButton = queryByTestId("save-address-button");
    saveButton && (await fireEvent.click(saveButton));

    await waitFor(() =>
      expect(saveAddressBookSpy).toHaveBeenCalledWith([
        {
          name: "FirstAddress",
          address: { Icp: validIcpAddress },
        },
      ])
    );
  });
});
