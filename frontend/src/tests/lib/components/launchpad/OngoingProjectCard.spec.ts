import OngoingProjectCard from "$lib/components/launchpad/OngoingProjectCard.svelte";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { OngoingProjectCardPo } from "$tests/page-objects/OngoingProjectCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";

describe("OngoingProjectCard", () => {
  const renderComponent = (summary: SnsSummaryWrapper) => {
    const { container } = render(OngoingProjectCard, {
      props: {
        summary,
      },
    });

    return OngoingProjectCardPo.under(new JestPageObjectElement(container));
  };

  it("should display project name and description", async () => {
    const projectName = "Test Project";
    const projectDescription = "This is a test project description";
    const summary = createSummary({
      projectName,
      projectDescription,
    });
    const po = renderComponent(summary);

    expect(await po.getTitle()).toEqual(projectName);
    expect(await po.getDescription()).toEqual(
      "This is a test project description"
    );
  });

  it("should display funded of minimum percentage", async () => {
    const summary = createSummary({
      currentTotalCommitment: 500_000_000n,
      minDirectParticipation: 10_000_000_000n,
    });

    const po = renderComponent(summary);

    expect(await po.getFundedOfMinValue()).toEqual("5%");
  });

  it("should display min ICP value", async () => {
    const summary = createSummary({
      minDirectParticipation: 45_000_000_000_000n,
    });
    const po = renderComponent(summary);

    expect(await po.getMinIcpValue()).toEqual("450k");
  });

  it("should current icp value", async () => {
    const summary = createSummary({
      currentTotalCommitment: 500_000_000_000n,
    });
    const po = renderComponent(summary);

    expect(await po.getCapIcpValue()).toEqual("5k");
  });

  it("should display time remaining until deadline", async () => {
    const mockDate = new Date("2025-03-11T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const swapDueTimestampSeconds = BigInt(Date.now()) / 1000n + 86400n; // 1 day from now
    const summary = createSummary({
      swapDueTimestampSeconds,
    });

    const po = renderComponent(summary);

    const timeRemaining = await po.getTimeRemaining();
    expect(timeRemaining).toEqual("1 day");
  });

  it("should have proper link to project page", async () => {
    const rootCanisterId = Principal.fromText("aaaaa-aa");
    const summary = createSummary({
      rootCanisterId,
    });
    const po = renderComponent(summary);
    const expectedHref = `/project/?project=${rootCanisterId.toText()}`;
    const linkPo = po.getLinkPo();

    expect(await linkPo.getHref()).toEqual(expectedHref);
  });
});
