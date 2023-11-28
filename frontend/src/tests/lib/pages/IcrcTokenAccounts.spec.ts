import { AppPath } from "$lib/constants/routes.constants";
import IcrcTokenAccounts from "$lib/pages/IcrcTokenAccounts.svelte";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockIcrcMainAccount } from "$tests/mocks/icrc-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { IcrcTokenAccountsPo } from "$tests/page-objects/IcrcTokenAccounts.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("IcrcTokenAccounts", () => {
  const ledgerCanisterId = principal(0);

  const renderComponent = () => {
    const { container } = render(IcrcTokenAccounts);

    return IcrcTokenAccountsPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    icrcAccountsStore.reset();
    tokensStore.reset();
    icrcCanistersStore.setCanisters({
      ledgerCanisterId,
      indexCanisterId: principal(1),
    });
    tokensStore.setTokens({
      [ledgerCanisterId.toText()]: {
        certified: true,
        token: mockCkETHToken,
      },
    });
    page.mock({
      data: { universe: ledgerCanisterId.toText() },
      routeId: AppPath.Accounts,
    });
  });

  it("renders Skeleton card while the accounts are undefined", async () => {
    icrcAccountsStore.reset();
    const po = renderComponent();

    expect(await po.hasSkeleton()).toBe(true);
  });

  it("renders AccountCard with balance", async () => {
    icrcAccountsStore.set({
      universeId: ledgerCanisterId,
      accounts: {
        accounts: [mockIcrcMainAccount],
        certified: true,
      },
    });
    const po = renderComponent();

    expect(await po.getAccountCardPos()).toHaveLength(1);
  });
});
