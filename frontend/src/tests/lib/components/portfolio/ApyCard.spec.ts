import ApyCard from "$lib/components/portfolio/ApyCard.svelte";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { ApyCardPo } from "$tests/page-objects/ApyCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ApyCardPo", () => {
  const defaultProps = {
    rewardBalanceUSD: 1234.56,
    rewardEstimateWeekUSD: 78.9,
    stakingPower: 0.4567,
    stakingPowerUSD: 9876.54,
    loading: false,
  };

  const renderComponent = (props = defaultProps) => {
    const { container } = render(ApyCard, { props });

    return ApyCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should display reward amount", async () => {
    const po = renderComponent(defaultProps);

    const rewardAmount = await po.getRewardAmount();
    expect(rewardAmount).toEqual("$1’235");
  });

  it("should display projection amount", async () => {
    const po = renderComponent(defaultProps);

    const projectionAmount = await po.getProjectionAmount();
    expect(projectionAmount).toEqual("$78.90");
  });

  it("should display staking power percentage", async () => {
    const po = renderComponent(defaultProps);

    const stakingPower = await po.getStakingPowerPercentage();
    expect(stakingPower).toEqual("45.67%");
  });

  it("should display total staking power USD", async () => {
    const po = renderComponent(defaultProps);

    const totalStakingPower = await po.getTotalStakingPowerUSD();
    expect(totalStakingPower).toEqual("$9’877");
  });

  it("should have project link", async () => {
    const po = renderComponent(defaultProps);

    const linkPo = po.getLinkPo();
    expect(await linkPo.isPresent()).toBe(true);
    expect(await linkPo.getHref()).toBe("/staking");
  });

  it("should display privacy placeholders when privacy mode is enabled", async () => {
    balancePrivacyOptionStore.set("hide");
    const po = renderComponent(defaultProps);

    const rewardAmount = await po.getRewardAmount();
    const totalStakingPower = await po.getTotalStakingPowerUSD();
    const projectionAmount = await po.getProjectionAmount();

    expect(rewardAmount).toEqual("$•••••");
    expect(totalStakingPower).toEqual("$•••");
    expect(projectionAmount).toEqual("$•••");
  });
});
