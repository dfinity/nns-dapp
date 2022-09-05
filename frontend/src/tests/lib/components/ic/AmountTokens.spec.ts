/**
 * @jest-environment jsdom
 */

import type { TokenAmount } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import AmountTokens from "../../../../lib/components/ic/AmountTokens.svelte";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";

describe("AmountTokens", () => {
  const props: { amount: TokenAmount } = { amount: mockMainAccount.balance };

  it("should render an token amount", () => {
    const { container } = render(AmountTokens, {
      props,
    });

    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `${formatICP({ value: mockMainAccount.balance.toE8s() })}`
    );
  });

  it("should render an token symbol", () => {
    const { getByText } = render(AmountTokens, {
      props,
    });

    expect(getByText("ICP")).toBeInTheDocument();
  });

  it("should render + sign", () => {
    const { container } = render(AmountTokens, {
      props: {
        ...props,
        sign: "+",
      },
    });
    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `+${formatICP({ value: mockMainAccount.balance.toE8s() })}`
    );
    expect(container.querySelector(".plus-sign")).toBeInTheDocument();
  });

  it("should render - sign", () => {
    const { container } = render(AmountTokens, {
      props: {
        ...props,
        sign: "-",
      },
    });
    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `-${formatICP({ value: mockMainAccount.balance.toE8s() })}`
    );
  });

  it("should render a detailed token amount", () => {
    const { container } = render(AmountTokens, {
      props: {
        ...props,
        detailed: true,
      },
    });

    const value = container.querySelector("span:first-of-type");

    expect(value?.textContent).toEqual(
      `${formatICP({ value: mockMainAccount.balance.toE8s(), detailed: true })}`
    );
  });
});
