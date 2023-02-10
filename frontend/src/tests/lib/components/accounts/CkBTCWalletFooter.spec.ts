/**
 * @jest-environment jsdom
 */

import CkBTCWalletFooter from "$lib/components/accounts/CkBTCWalletFooter.svelte";
import type { Account } from "$lib/types/account";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import {
  mockCkBTCAddress,
  mockCkBTCMainAccount,
} from "../../../mocks/ckbtc-accounts.mock";
import CkBTCWalletContextTest from "./CkBTCWalletContextTest.svelte";

jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    getBTCAddress: jest.fn().mockImplementation(() => mockCkBTCAddress),
  };
});

describe("CkBTCWalletFooter", () => {
  const renderWalletActions = (account?: Account) =>
    render(CkBTCWalletContextTest, {
      props: {
        account,
        testComponent: CkBTCWalletFooter,
      },
    });

  it("should render a receive button", () => {
    const { getByTestId } = renderWalletActions(mockCkBTCMainAccount);

    expect(getByTestId("receive-ckbtc-transaction")).not.toBeNull();
  });

  it("should render a disabled receive button if not account", () => {
    const { getByTestId } = renderWalletActions(undefined);

    expect(
      getByTestId("receive-ckbtc-transaction").getAttribute("disabled")
    ).not.toBeNull();
  });

  it("should open reveive modal", async () => {
    const { getByTestId, container } =
      renderWalletActions(mockCkBTCMainAccount);

    fireEvent.click(
      getByTestId("receive-ckbtc-transaction") as HTMLButtonElement
    );

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });
});
