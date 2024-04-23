import VotingPowerDisplay from "$lib/components/ic/VotingPowerDisplay.svelte";
import { VotingPowerDisplayPo } from "$tests/page-objects/VotingPowerDisplay.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("VotingPowerDisplay", () => {
  const renderComponent = ({
    votingPowerE8s = 100_000_000n,
    valueTestId = "test-id",
    valueAriaLabel,
  }: {
    votingPowerE8s?: bigint;
    valueTestId?: string;
    valueAriaLabel?: string;
  }) => {
    const { container } = render(VotingPowerDisplay, {
      valueTestId,
      votingPowerE8s,
      valueAriaLabel,
    });
    return VotingPowerDisplayPo.under(new JestPageObjectElement(container));
  };

  it("should render voting power", async () => {
    const po = renderComponent({ votingPowerE8s: 123_456_000n });
    expect(await po.getDisplayedVotingPower()).toEqual("1.23");
    expect(await po.getExactVotingPower()).toEqual("1.23456000");
  });

  it("should have the specified test ID on the displayed voting power", async () => {
    const valueTestId = "test-id-for-testing";
    const po = renderComponent({ votingPowerE8s: 789_000_000n, valueTestId });
    expect(await po.getText(valueTestId)).toBe("7.89");
  });

  it("should render the aria-label on the displayed element", async () => {
    const valueTestId = "test-id-for-testing";
    const valueAriaLabel = "Test aria label description";
    const po = renderComponent({ valueTestId, valueAriaLabel });
    expect(await po.root.byTestId(valueTestId).getAttribute("aria-label")).toBe(
      valueAriaLabel
    );
  });

  it("should created a new tooltip ID each time", async () => {
    const po1 = renderComponent({});
    const po2 = renderComponent({});

    expect(await po1.getTooltipId()).toMatch(/voting-power-tooltip-\d+/);
    expect(await po2.getTooltipId()).toMatch(/voting-power-tooltip-\d+/);

    expect(await po1.getTooltipId()).not.toEqual(await po2.getTooltipId());
  });
});
