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
  const name = "Account Name";
  const renderComponent = ({
    balance,
    name,
    principal,
  }: {
    balance?: TokenAmount;
    name: string;
    principal?: Principal;
  }) => {
    const { container } = render(WalletPageHeading, {
      props: {
        balance,
        name,
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
    const po = renderComponent({ balance, name });

    expect(await po.getTitle()).toBe("3.14 ICP");
    expect(await po.hasSkeleton()).toBe(false);
  });

  it("should render skeleton if no balance", async () => {
    const po = renderComponent({ balance: undefined, name });

    expect(await po.hasSkeleton()).toBe(true);
  });

  it("should render name as subtitle", async () => {
    const accountName = "Test name";
    const po = renderComponent({ balance, name: accountName });

    expect(await po.getSubtitle()).toBe(accountName);
  });

  it("should render principal if passed", async () => {
    const principalText = "rwlgt-iiaaa-aaaaa-aaaaa-cai";
    const po = renderComponent({
      balance,
      name,
      principal: Principal.fromText(principalText),
    });

    expect(await po.getPrincipal()).toBe(principalText);
  });

  const testTitle = async ({
    intersecting,
    expectedHeader,
    balance,
    name,
  }: {
    intersecting: boolean;
    balance: TokenAmount;
    name: string;
    expectedHeader: string;
  }) => {
    const { getByTestId } = render(WalletPageHeading, {
      props: {
        balance,
        name,
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
      name,
    });
  });

  it("should render a static title if title is intersecting viewport", async () => {
    await testTitle({
      intersecting: true,
      expectedHeader: en.wallet.title,
      balance,
      name,
    });
  });
});
