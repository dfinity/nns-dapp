/**
 * @jest-environment jsdom
 */

import CkBTCWalletFooter from "$lib/components/accounts/CkBTCWalletFooter.svelte";
import type { Account } from "$lib/types/account";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tokensStore } from "../../../../lib/stores/tokens.store";
import {
  mockCkBTCAddress,
  mockCkBTCMainAccount,
} from "../../../mocks/ckbtc-accounts.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "../../../mocks/tokens.mock";
import CkBTCWalletContextTest from "./CkBTCWalletContextTest.svelte";

jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    getBTCAddress: jest.fn().mockImplementation(() => mockCkBTCAddress),
  };
});

describe("CkBTCWalletFooter", () => {
  beforeAll(() => {
    jest
      .spyOn(tokensStore, "subscribe")
      .mockImplementation(mockTokensSubscribe(mockUniversesTokens));
  });

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

  it("should open receive modal", async () => {
    const { getByTestId, container } =
      renderWalletActions(mockCkBTCMainAccount);

    fireEvent.click(
      getByTestId("receive-ckbtc-transaction") as HTMLButtonElement
    );

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });

  it("should open transaction modal", async () => {
    const { getByTestId, container } =
      renderWalletActions(mockCkBTCMainAccount);

    fireEvent.click(
      getByTestId("open-new-ckbtc-transaction") as HTMLButtonElement
    );

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });
});
