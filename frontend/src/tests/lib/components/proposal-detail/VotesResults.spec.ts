/**
 * @jest-environment jsdom
 */
import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { formatNumber } from "$lib/utils/format.utils";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import type { RenderResult } from "@testing-library/svelte";
import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

describe("VotesResults", () => {
  let renderResult: RenderResult<SvelteComponent>;
  const yes = Number(E8S_PER_ICP * 2) / E8S_PER_ICP;
  const no = Number(E8S_PER_ICP * 3) / E8S_PER_ICP;

  beforeEach(() => {
    renderResult = render(VotesResults, {
      props: {
        yes,
        no,
        total: yes + no,
      },
    });
  });

  it('should render "Adopt" value', async () => {
    const { container } = renderResult;
    const votesResultPo = VotesResultPo.under(
      new JestPageObjectElement(container)
    );

    expect(await votesResultPo.getAdoptVotingPower()).toEqual(
      `${formatNumber(yes)}`
    );
  });

  it('should render "Reject" value', async () => {
    const { container } = renderResult;
    const votesResultPo = VotesResultPo.under(
      new JestPageObjectElement(container)
    );

    expect(await votesResultPo.getRejectVotingPower()).toEqual(
      `${formatNumber(no)}`
    );
  });

  it("should render progressbar", async () => {
    const { container } = renderResult;
    const votesResultPo = VotesResultPo.under(
      new JestPageObjectElement(container)
    );
    expect(await votesResultPo.isPresent()).toBeTruthy();

    expect(await votesResultPo.getProgressMinValue()).toBe(0n);
    expect(await votesResultPo.getProgressMaxValue()).toBe(BigInt(yes + no));
    expect(await votesResultPo.getProgressNowValue()).toBe(BigInt(yes));
  });
});
