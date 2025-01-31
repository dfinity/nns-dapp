import HeadingSubtitleWithUsdValue from "$lib/components/common/HeadingSubtitleWithUsdValue.svelte";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { HeadingSubtitleWithUsdValuePo } from "$tests/page-objects/HeadingSubtitleWithUsdValue.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  setIcpPrice,
  setIcpSwapUsdPrices,
} from "$tests/utils/icp-swap.test-utils";
import { Principal } from "@dfinity/principal";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("HeadingSubtitleWithUsdValue", () => {
  const renderComponent = ({
    amount,
    ledgerCanisterId,
  }: {
    amount: TokenAmountV2 | undefined;
    ledgerCanisterId: Principal | undefined;
  }) => {
    const { container } = render(HeadingSubtitleWithUsdValue, {
      amount,
      ledgerCanisterId,
    });
    return HeadingSubtitleWithUsdValuePo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    setIcpPrice(10);
  });

  it("should render amount in USD", async () => {
    const amount = TokenAmountV2.fromString({
      amount: "3",
      token: ICPToken,
    }) as TokenAmountV2;

    const po = renderComponent({
      amount,
      ledgerCanisterId: LEDGER_CANISTER_ID,
    });

    expect(await po.hasAmountInUsd()).toBe(true);
    expect(await po.getAmountInUsd()).toBe("$30.00");
    expect(await po.getTooltipIconPo().getTooltipText()).toBe(
      "Token prices are in ckUSDC based on data provided by ICPSwap."
    );
  });

  it("should show error state when token prices failed to load", async () => {
    icpSwapTickersStore.set("error");

    const amount = TokenAmountV2.fromString({
      amount: "3",
      token: ICPToken,
    }) as TokenAmountV2;
    const po = renderComponent({
      amount,
      ledgerCanisterId: LEDGER_CANISTER_ID,
    });

    expect(await po.hasAmountInUsd()).toBe(true);
    expect(await po.getAmountInUsd()).toBe("$-/-");
    expect(await po.getTooltipIconPo().getTooltipText()).toBe(
      "ICPSwap API is currently unavailable, token prices cannot be fetched at the moment."
    );
  });

  it("should get token price based on ledger canister ID", async () => {
    const ledgerCanisterId = principal(3);

    setIcpSwapUsdPrices({
      [ledgerCanisterId.toText()]: 5,
    });

    const amount = TokenAmountV2.fromString({
      amount: "3",
      token: ICPToken,
    }) as TokenAmountV2;
    const po = renderComponent({ amount, ledgerCanisterId });

    expect(await po.getAmountInUsd()).toBe("$15.00");
  });
});
