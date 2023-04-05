/**
 * @jest-environment jsdom
 */
import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { formatNumber } from "$lib/utils/format.utils";
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
