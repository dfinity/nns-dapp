/**
 * @jest-environment jsdom
 */

import HardwareWalletInfo from "$lib/components/accounts/HardwareWalletInfo.svelte";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { principalToAccountIdentifier } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("HardwareWalletInfo", () => {
  const props = { ledgerIdentity: mockIdentity };

  it("should render principal", () => {
    const { queryByText } = render(HardwareWalletInfo, {
      props,
    });

    expect(queryByText(en.core.principal)).toBeInTheDocument();
    expect(
      queryByText(mockIdentity.getPrincipal().toString())
    ).toBeInTheDocument();
  });

  it("should render account identifier", () => {
    const { queryByText } = render(HardwareWalletInfo, {
      props,
    });

    expect(queryByText(en.accounts.account_identifier)).toBeInTheDocument();
    expect(
      queryByText(principalToAccountIdentifier(mockIdentity.getPrincipal()))
    ).toBeInTheDocument();
  });
});
