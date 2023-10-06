import WalletPageHeading from "$lib/components/accounts/WalletPageHeading.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { dispatchIntersecting } from "$lib/utils/events.utils";
import en from "$tests/mocks/i18n.mock";
import { WalletPageHeadingPo } from "$tests/page-objects/WalletPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("WalletPageHeading", () => {
  const balance = TokenAmount.fromString({
    amount: "1",
    token: ICPToken,
  }) as TokenAmount;
  const accountName = "Account Name";
  const renderComponent = ({
    balance,
    accountName,
    principal,
  }: {
    balance?: TokenAmount;
    accountName: string;
    principal?: Principal;
  }) => {
    const { container } = render(WalletPageHeading, {
      props: {
        balance,
        accountName,
        principal,
      },
    });
    return WalletPageHeadingPo.under(new JestPageObjectElement(container));
  };

  it("should render balance as title and no skeleton", async () => {
    const balance = TokenAmount.fromString({
      amount: "3.14",
      token: ICPToken,
    }) as TokenAmount;
    const po = renderComponent({ balance, accountName });

    expect(await po.getTitle()).toBe("3.14 ICP");
    expect(await po.hasSkeleton()).toBe(false);
  });

  it("should render skeleton if no balance", async () => {
    const po = renderComponent({
      balance: undefined,
      accountName: accountName,
    });

    expect(await po.hasSkeleton()).toBe(true);
  });

  it("should render name as subtitle", async () => {
    const accountName = "Test name";
    const po = renderComponent({ balance, accountName });

    expect(await po.getSubtitle()).toBe(accountName);
  });

  it("should render principal if passed", async () => {
    const principalText = "rwlgt-iiaaa-aaaaa-aaaaa-cai";
    const po = renderComponent({
      balance,
      accountName: accountName,
      principal: Principal.fromText(principalText),
    });

    expect(await po.getPrincipal()).toBe(principalText);
  });

  const testTitle = async ({
    intersecting,
    expectedHeader,
    balance,
    accountName,
  }: {
    intersecting: boolean;
    balance: TokenAmount;
    accountName: string;
    expectedHeader: string;
  }) => {
    const { getByTestId } = render(WalletPageHeading, {
      props: {
        balance,
        accountName,
        principal: undefined,
      },
    });

    const element = getByTestId("wallet-subtitles") as HTMLElement;
    dispatchIntersecting({ element, intersecting });

    const title = get(layoutTitleStore);
    await waitFor(() =>
      expect(title).toEqual({ title: en.wallet.title, header: expectedHeader })
    );
  };

  it("should render account name and balance if title not intersecting viewport", async () => {
    await testTitle({
      intersecting: false,
      expectedHeader: "Account Name - 1.00 ICP",
      balance,
      accountName,
    });
  });

  it("should render a static title if title is intersecting viewport", async () => {
    await testTitle({
      intersecting: true,
      expectedHeader: en.wallet.title,
      balance,
      accountName,
    });
  });
});
