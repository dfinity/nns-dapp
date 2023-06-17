/**
 * @jest-environment jsdom
 */
import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { render } from "@testing-library/svelte";

describe("VotesResults", () => {
  const yesCount = 2;
  const yesFormatted = "2.00";
  const noCount = 3;
  const noFormatted = "3.00";
  const totalValue = 5;
  const renderComponent = () => {
    const { container } = render(VotesResults, {
      props: {
        yes: yesCount,
        no: noCount,
        total: totalValue,
      },
    });

    return VotesResultPo.under(new JestPageObjectElement(container));
  };

  it('should render "Adopt" value', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getAdoptVotingPower()).toEqual(yesFormatted);
  });

  it('should render "Reject" value', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getRejectVotingPower()).toEqual(noFormatted);
  });

  it("should render progressbar", async () => {
    const votesResultPo = renderComponent();

    expect(await votesResultPo.getProgressMinValue()).toBe(0);
    expect(await votesResultPo.getProgressNowValue()).toBe(yesCount);
    expect(await votesResultPo.getProgressMaxValue()).toBe(totalValue);
  });
});
