/**
 * @jest-environment jsdom
 */
import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { render } from "@testing-library/svelte";

describe("VotesResults", () => {
  const yes = 2;
  const no = 3;
  const renderComponent = () => {
    const { container } = render(VotesResults, {
      props: {
        yes,
        no,
        total: yes + no,
      },
    });

    return VotesResultPo.under(new JestPageObjectElement(container));
  };

  it('should render "Adopt" value', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getAdoptVotingPower()).toEqual("2.00");
  });

  it('should render "Reject" value', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getRejectVotingPower()).toEqual("3.00");
  });

  it("should render progressbar", async () => {
    const votesResultPo = renderComponent();

    expect(await votesResultPo.getProgressMinValue()).toBe(0);
    expect(await votesResultPo.getProgressMaxValue()).toBe(yes + no);
    expect(await votesResultPo.getProgressNowValue()).toBe(yes);
  });
});
