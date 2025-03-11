import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { LaunchProjectCardPo } from "$tests/page-objects/LaunchProjectCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";

describe("LaunchProjectCard", () => {
  const renderComponent = (summary: SnsSummaryWrapper) => {
    const { container } = render(LaunchProjectCard, {
      props: {
        summary,
      },
    });

    return LaunchProjectCardPo.under(new JestPageObjectElement(container));
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
    expect(await po.getDescription()).toBe(
      "This is a test project description"
    );
  });

  it("should display direct funding", async () => {
    const summary = createSummary({
      neuronsFundIsParticipating: [false],
      minDirectParticipation: 50_000_000n,
      maxDirectParticipation: 150_000_000_000n,
      directCommitment: 1_000_000_000_000n,
    });

    const po = renderComponent(summary);

    expect(await po.getDirectCommitment()).toBe("10’000");
  });

  it("should display min and max ICP amounts", async () => {
    const summary = createSummary({
      neuronsFundIsParticipating: [false],
      directCommitment: 1_000_000_000_000n,
      minDirectParticipation: 50_000_000_000n,
      maxDirectParticipation: 15_000_000_000_000n,
    });
    const po = renderComponent(summary);

    expect(await po.getMinIcp()).toBe("500");
    expect(await po.getMaxIcp()).toBe("150K");
  });

  it("should not display NF participation when it doesn't exist", async () => {
    const summary = createSummary({});
    const po = renderComponent(summary);

    expect(await po.hasNfParticipation()).toBe(false);
    expect(await po.getNfParticipation()).toBeNull();
  });

  it("should display NF participation when it exists", async () => {
    const summary = createSummary({
      neuronsFundIsParticipating: [true],
      directCommitment: 1_000_000_000_000n,
      minDirectParticipation: 50_000_000_000n,
      maxDirectParticipation: 15_000_000_000_000n,
      neuronsFundCommitment: 50_000_000_000n,
    });
    const po = renderComponent(summary);

    expect(await po.hasNfParticipation()).toBe(true);
    expect(await po.getNfParticipation()).toBe("500");
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

    expect(await linkPo.getHref()).toBe(expectedHref);
  });

  it("should display tooltip when NF is parcipagint", async () => {
    const summary = createSummary({
      neuronsFundIsParticipating: [true],
      directCommitment: 1_000_000_000_000n,
      minDirectParticipation: 50_000_000_000n,
      maxDirectParticipation: 15_000_000_000_000n,
      neuronsFundCommitment: 50_000_000_000n,
    });
    const po = renderComponent(summary);

    expect(await po.getNFTooltipPo().isPresent()).toBe(true);
  });

  it("should not display tooltip when NF is not parcipagint", async () => {
    const summary = createSummary({
      neuronsFundIsParticipating: [false],
    });
    const po = renderComponent(summary);

    expect(await po.getNFTooltipPo().isPresent()).toBe(false);
  });
});
