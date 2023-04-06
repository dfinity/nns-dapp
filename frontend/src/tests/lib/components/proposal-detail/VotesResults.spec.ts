/**
 * @jest-environment jsdom
 */
import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { formatNumber } from "$lib/utils/format.utils";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { render } from "@testing-library/svelte";

describe("VotesResults", () => {
  const yes = Number(E8S_PER_ICP * 2) / E8S_PER_ICP;
  const no = Number(E8S_PER_ICP * 3) / E8S_PER_ICP;
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

    expect(await votesResultPo.getAdoptVotingPower()).toEqual(
      `${formatNumber(yes)}`
    );
  });

  it('should render "Reject" value', async () => {
    const votesResultPo = renderComponent();

    expect(await votesResultPo.getRejectVotingPower()).toEqual(
      `${formatNumber(no)}`
    );
  });

  it("should render progressbar", async () => {
    const votesResultPo = renderComponent();

    expect(await votesResultPo.getProgressMinValue()).toBe(0);
    expect(await votesResultPo.getProgressMaxValue()).toBe(yes + no);
    expect(await votesResultPo.getProgressNowValue()).toBe(yes);
  });
});
