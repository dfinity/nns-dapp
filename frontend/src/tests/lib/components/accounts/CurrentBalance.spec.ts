import CurrentBalance from "$lib/components/accounts/CurrentBalance.svelte";
import { CurrentBalancePo } from "$tests/page-objects/CurrentBalance.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("CurrentBalance", () => {
  const props = {
    balance: TokenAmount.fromE8s({
      amount: 1_234_567_89_000_000n,
      token: ICPToken,
    }),
  };

  const renderComponent = (props) => {
    const { container } = render(CurrentBalance, { props });

    return CurrentBalancePo.under(new JestPageObjectElement(container));
  };

  it("should render a title", async () => {
    const po = renderComponent(props);

    expect(await po.getText()).toContain("Current balance:");
  });

  it("should render a balance in ICP", async () => {
    const po = renderComponent(props);

    expect(await po.AmountDisplayPo.getText()).toBe("1'234'567.89 ICP");
  });
});
