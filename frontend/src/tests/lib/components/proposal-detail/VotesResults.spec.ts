/**
 * @jest-environment jsdom
 */
import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { formatNumber } from "$lib/utils/format.utils";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import type { RenderResult } from "@testing-library/svelte";
import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

describe("VotesResults", () => {
  let renderResult: RenderResult<SvelteComponent>;
  let yes: number, no: number;
  beforeEach(() => {
    neuronsStore.setNeurons({ neurons: [], certified: true });
    renderResult = render(VotesResults, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    yes = Number(mockProposalInfo.latestTally?.yes) / E8S_PER_ICP;
    no = Number(mockProposalInfo.latestTally?.no) / E8S_PER_ICP;
  });

  it('should render "Adopt" value', () => {
    const { getByText } = renderResult;
    expect(getByText(`${formatNumber(yes)}`)).toBeInTheDocument();
  });

  it('should render "Reject" value', () => {
    const { getByText } = renderResult;
    expect(getByText(`${formatNumber(no)}`)).toBeInTheDocument();
  });

  it("should render progressbar", () => {
    const { getByRole } = renderResult;
    const progressbar = getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressbar.getAttribute("aria-valuemax")).toBe(`${yes + no}`);
    expect(progressbar.getAttribute("aria-valuenow")).toBe(`${yes}`);
  });
});
