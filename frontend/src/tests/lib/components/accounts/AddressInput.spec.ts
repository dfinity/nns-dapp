/**
 * @jest-environment jsdom
 */

import AddressInput from "$lib/components/accounts/AddressInput.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { fireEvent, render } from "@testing-library/svelte";
import { mockBTCAddressMainnet } from "../../../mocks/ckbtc-accounts.mock";

describe("AddressInput", () => {
  const snsAccount = mockPrincipal.toText();

  describe("NNS Universe", () => {
    const props = { address: undefined, rootCanisterId: OWN_CANISTER_ID };

    it("should render an input with a minimal length of 40", () => {
      const { container } = render(AddressInput, { props });

      const input = container.querySelector("input");
      expect(input).not.toBeNull();
    });

    it("should show error message on blur when invalid address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, { target: { value: "invalid-address" } });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });

    it("should show error message on blur when SNS address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, { target: { value: snsAccount } });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });

    it("should show error message on blur when BTC address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, {
        target: { value: mockBTCAddressMainnet },
      });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });
  });

  describe("SNS or ckBTC Universe", () => {
    const props = { address: undefined, rootCanisterId: mockCanisterId };

    it("should show error message on blur when invalid address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, { target: { value: "invalid-address" } });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });

    it("should show error message on blur when ICP address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, {
        target: { value: mockMainAccount.identifier },
      });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });

    it("should show error message on blur when BTC address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, {
        target: { value: mockBTCAddressMainnet },
      });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });
  });

  describe("BTC Universe", () => {
    const props = {
      address: undefined,
      rootCanisterId: mockCanisterId,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    };

    it("should show error message on blur when invalid address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, { target: { value: "invalid-address" } });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });

    it("should show error message on blur when ICP address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, {
        target: { value: mockMainAccount.identifier },
      });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });

    it("should show error message on blur when SNS address", async () => {
      const { container, queryByTestId } = render(AddressInput, { props });

      const input = container.querySelector("input") as HTMLInputElement;

      await fireEvent.input(input, { target: { value: snsAccount } });
      await fireEvent.blur(input);
      expect(queryByTestId("input-error-message")).toBeInTheDocument();
    });
  });
});
