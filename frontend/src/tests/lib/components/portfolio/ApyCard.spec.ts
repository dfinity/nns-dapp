import ApyCard from "$lib/components/portfolio/ApyCard.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { ApyCardPo } from "$tests/page-objects/ApyCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ApyCardPo", () => {
  const defaultProps = {
    icpOnlyMaturityBalance: 1234.56,
    icpOnlyMaturityEstimateWeek: 78.9,
    icpOnlyStakingPower: 0.4567,
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
    expect(rewardAmount).toEqual("1’235");
  });

  it("should display projection amount", async () => {
    const po = renderComponent(defaultProps);

    const projectionAmount = await po.getProjectionAmount();
    expect(projectionAmount).toEqual("78.900");
  });

  it("should display staking power percentage", async () => {
    const po = renderComponent(defaultProps);

    const stakingPower = await po.getStakingPowerPercentage();
    expect(stakingPower).toEqual("45.67%");
  });

  it("should have project link", async () => {
    const po = renderComponent(defaultProps);

    const linkPo = po.getLinkPo();
    expect(await linkPo.isPresent()).toBe(true);
    expect(await linkPo.getHref()).toBe("/staking");
  });

  it("should show specific label when there is staking power", async () => {
    const po = renderComponent(defaultProps);

    const linkPo = po.getLinkPo();
    expect(await linkPo.getText()).contains("View Staked");
  });

  it("should show specific label when no staking power", async () => {
    const po = renderComponent({ ...defaultProps, icpOnlyStakingPower: 0 });

    const linkPo = po.getLinkPo();
    expect(await linkPo.getText()).contains("Start Staking");
  });
});
