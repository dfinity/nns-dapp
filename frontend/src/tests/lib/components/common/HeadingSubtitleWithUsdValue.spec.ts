import HeadingSubtitleWithUsdValue from "$lib/components/common/HeadingSubtitleWithUsdValue.svelte";
import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { HeadingSubtitleWithUsdValuePo } from "$tests/page-objects/HeadingSubtitleWithUsdValue.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
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
    icpSwapTickersStore.set([
      {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        last_price: "10.00",
      },
    ]);
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

    icpSwapTickersStore.set([
      {
        ...mockIcpSwapTicker,
        base_id: ledgerCanisterId.toText(),
        last_price: "2.00",
      },
      {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        last_price: "10.00",
      },
    ]);

    const amount = TokenAmountV2.fromString({
      amount: "3",
      token: ICPToken,
    }) as TokenAmountV2;
    const po = renderComponent({ amount, ledgerCanisterId });

    expect(await po.getAmountInUsd()).toBe("$15.00");
  });
});
