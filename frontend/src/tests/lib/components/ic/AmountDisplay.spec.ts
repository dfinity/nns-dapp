/**
 * @jest-environment jsdom
 */

import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
import { formatToken } from "$lib/utils/token.utils";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("AmountDisplay", () => {
  const tokenAmount = TokenAmount.fromE8s({
    amount: mockMainAccount.balanceE8s,
    token: ICPToken,
  });

  const props: { amount: TokenAmount } = {
    amount: tokenAmount,
  };

  it("should render an token amount", () => {
    const { container } = render(AmountDisplay, {
      props,
    });

    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `${formatToken({ value: mockMainAccount.balanceE8s })}`
    );
  });

  it("should render an token symbol", () => {
    const { getByText } = render(AmountDisplay, {
      props,
    });

    expect(getByText("ICP")).toBeInTheDocument();
  });

  it("should render + sign", () => {
    const { container } = render(AmountDisplay, {
      props: {
        ...props,
        sign: "+",
      },
    });
    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `+${formatToken({ value: mockMainAccount.balanceE8s })}`
    );
    expect(container.querySelector(".plus-sign")).toBeInTheDocument();
  });

  it("should render - sign", () => {
    const { container } = render(AmountDisplay, {
      props: {
        ...props,
        sign: "-",
      },
    });
    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `-${formatToken({ value: mockMainAccount.balanceE8s })}`
    );
  });

  it("should render a detailed token amount", () => {
    const { container } = render(AmountDisplay, {
      props: {
        ...props,
        detailed: true,
      },
    });

    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `${formatToken({
        value: mockMainAccount.balanceE8s,
        detailed: true,
      })}`
    );
  });
});
