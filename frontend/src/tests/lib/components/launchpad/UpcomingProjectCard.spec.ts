import UpcomingProjectCard from "$lib/components/launchpad/UpcomingProjectCard.svelte";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { UpcomingProjectCardPo } from "$tests/page-objects/UpcomingProjectCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";

describe("UpcomingProjectCard", () => {
  const renderComponent = (summary: SnsSummaryWrapper) => {
    const { container } = render(UpcomingProjectCard, {
      props: {
        summary,
      },
    });

    return UpcomingProjectCardPo.under(new JestPageObjectElement(container));
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

  it("should display link to project page", async () => {
    const projectUrl = "https://testproject.com";
    const summary = createSummary({
      projectUrl,
    });
    const po = renderComponent(summary);

    expect(await po.getProjectSiteLinkPo().getHref()).toBe(projectUrl);
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

  it("should have link to project page", async () => {
    const rootCanisterId = Principal.fromText("aaaaa-aa");
    const summary = createSummary({
      rootCanisterId,
    });
    const po = renderComponent(summary);
    const expectedHref = `/project/?project=${rootCanisterId.toText()}`;

    expect(await po.getProjectLinkPo().getHref()).toBe(expectedHref);
  });
});
