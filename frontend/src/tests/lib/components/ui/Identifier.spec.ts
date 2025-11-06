import Identifier from "$lib/components/ui/Identifier.svelte";
import { addressBookStore } from "$lib/stores/address-book.store";
import {
  mockNamedAddressIcp,
  mockNamedAddressIcrc1,
} from "$tests/mocks/address-book.mock";
import { render } from "@testing-library/svelte";

describe("Identifier", () => {
  const identifier = "test-identifier";
  const props: { identifier: string } = { identifier };

  beforeEach(() => {
    addressBookStore.reset();
  });

  it("should render an identifier", () => {
    const { getByTestId, queryByRole } = render(Identifier, { props });

    const small = getByTestId("identifier");
    expect(small.textContent?.trim()).toEqual(identifier);

    const button = queryByRole("button");
    expect(button).toBeNull();
  });

  it("should render a copy button", () => {
    const { queryByRole } = render(Identifier, {
      props: { identifier, showCopy: true },
    });

    const button = queryByRole("button");

    expect(button?.getAttribute("aria-label")).toEqual(
      `Copy to clipboard: ${identifier}`
    );
  });

  it("should render with label prefix", () => {
    const { getByTestId } = render(Identifier, {
      props: { identifier, label: "From:" },
    });

    const element = getByTestId("identifier");
    expect(element.textContent).toContain("From:");
    expect(element.textContent).toContain(identifier);
  });

  describe("address book integration", () => {
    it("should display address book label when address is saved", () => {
      const icpAddress = (mockNamedAddressIcp.address as { Icp: string }).Icp;

      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp],
        certified: true,
      });

      const { getByTestId } = render(Identifier, {
        props: { identifier: icpAddress },
      });

      const element = getByTestId("identifier");
      expect(element.textContent).toContain(mockNamedAddressIcp.name);
      expect(element.textContent).not.toContain(icpAddress);
    });

    it("should display address book label for ICRC1 addresses", () => {
      const icrc1Address = (mockNamedAddressIcrc1.address as { Icrc1: string })
        .Icrc1;

      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcrc1],
        certified: true,
      });

      const { getByTestId } = render(Identifier, {
        props: { identifier: icrc1Address },
      });

      const element = getByTestId("identifier");
      expect(element.textContent).toContain(mockNamedAddressIcrc1.name);
      expect(element.textContent).not.toContain(icrc1Address);
    });

    it("should render regular identifier when address is not in book", () => {
      const unknownAddress = "unknown-address-123";

      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp],
        certified: true,
      });

      const { getByTestId } = render(Identifier, {
        props: { identifier: unknownAddress },
      });

      const element = getByTestId("identifier");
      expect(element.textContent).toContain(unknownAddress);
      expect(element.textContent).not.toContain(mockNamedAddressIcp.name);
    });

    it("should show address book label with regular label prefix", () => {
      const icpAddress = (mockNamedAddressIcp.address as { Icp: string }).Icp;

      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp],
        certified: true,
      });

      const { getByTestId } = render(Identifier, {
        props: { identifier: icpAddress, label: "From:" },
      });

      const element = getByTestId("identifier");
      expect(element.textContent).toContain("From:");
      expect(element.textContent).toContain(mockNamedAddressIcp.name);
      expect(element.textContent).not.toContain(icpAddress);
    });

    it("should work with copy button when address has saved label", () => {
      const icpAddress = (mockNamedAddressIcp.address as { Icp: string }).Icp;

      addressBookStore.set({
        namedAddresses: [mockNamedAddressIcp],
        certified: true,
      });

      const { getByTestId, queryByRole } = render(Identifier, {
        props: { identifier: icpAddress, showCopy: true },
      });

      const element = getByTestId("identifier");
      expect(element.textContent).toContain(mockNamedAddressIcp.name);

      // Copy button should still copy the actual address
      const button = queryByRole("button");
      expect(button.getAttribute("aria-label")).toEqual(
        `Copy to clipboard: ${icpAddress}`
      );
    });
  });
});
