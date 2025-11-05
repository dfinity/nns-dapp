import AdoptedProposalCard from "$lib/components/portfolio/AdoptedProposalCard.svelte";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { AdoptedProposalCardPo } from "$tests/page-objects/AdoptedProposalCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@icp-sdk/core/principal";
import { render } from "@testing-library/svelte";

describe("AdoptedProposalCard", () => {
  const renderComponent = (summary: SnsSummaryWrapper) => {
    const { container } = render(AdoptedProposalCard, {
      props: {
        summary,
      },
    });

    return AdoptedProposalCardPo.under(new JestPageObjectElement(container));
  };

  it("should display project name and description", async () => {
    const projectName = "Test Project";
    const projectDescription = "This is a test project description";
    const summary = createSummary({
      projectName,
      projectDescription,
    });
    const po = renderComponent(summary);

    expect(await po.getTitle()).toBe(projectName);
    expect(await po.getDescription()).toBe(projectDescription);
  });

  it("should display time remaining until swap start", async () => {
    const mockDate = new Date("2025-03-11T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    // 3 days from now
    const swapOpenTimestampSeconds = BigInt(Date.now()) / 1000n + 3n * 86400n;
    const summary = createSummary({
      swapOpenTimestampSeconds,
    });

    const po = renderComponent(summary);

    const timeRemaining = await po.getTimeRemaining();
    expect(timeRemaining).toEqual("3 days");
  });

  it("should have proper link to project page", async () => {
    const rootCanisterId = Principal.fromText("aaaaa-aa");
    const summary = createSummary({
      rootCanisterId,
    });
    const po = renderComponent(summary);
    const expectedHref = `/project/?project=${rootCanisterId.toText()}`;
    const linkPo = po.getLinkPo();

    expect(await linkPo.getHref()).toBe(expectedHref);
  });
});
