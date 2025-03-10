import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { LaunchProjectCardPo } from "$tests/page-objects/LaunchProjectCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
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

  it.only("should display direct funding", async () => {
    const summary = createSummary({
      directCommitment: 100_000_000n,
    });
    console.log(summary);

    const po = renderComponent(summary);

    expect(await po.getDirectCommitment()).toBe("100");
  });

  it("should display min and max ICP amounts", async () => {
    const summary = createSummary({});
    const po = renderComponent(summary);

    expect(await po.getMinIcp()).toBe("1'000 ICP");
    expect(await po.getMaxIcp()).toBe("5'000 ICP");
  });

  it("should not display NF participation when it doesn't exist", async () => {
    const summary = createSummary({});
    const po = renderComponent(summary);

    expect(await po.hasNfParticipation()).toBe(false);
    expect(await po.getNfParticipation()).toBeNull();
  });

  it("should display NF participation when it exists", async () => {
    const summary = createSummary({});
    const po = renderComponent(summary);

    expect(await po.hasNfParticipation()).toBe(true);
    expect(await po.getNfParticipation()).toBe("500 ICP");
  });

  it("should display time remaining until deadline", async () => {
    const summary = createSummary({});
    const po = renderComponent(summary);
    const deadline = BigInt(Date.now()) / 1000n + 86400n; // 1 day from now
    // const po = renderComponent({
    //   swap: {
    //     deadline,
    //   },
    // });

    const timeRemaining = await po.getTimeRemaining();
    // We can't exactly test the string since it depends on the current time
    // but we can check it contains some duration text
    expect(timeRemaining).toContain("day");
  });

  // it("should have proper link to project page", async () => {
  //   const  po = renderComponent();

  //   const expectedHref = `${AppPath.Project}/?project=${summary.rootCanisterId.toText()}`;
  //   expect(await po.getLinkHref()).toBe(expectedHref);
  //   expect(await po.getLinkText()).toContain("View project");
  // });

  // it("should display tooltip for NF participation when it exists", async () => {
  //   const po = renderComponent({
  //     getNeuronsFundParticipation: () => 500_00000000n,
  //     getProjectCommitmentSplit: () => ({
  //       isNFParticipating: true,
  //       current: 30_00,
  //       min: 30_00,
  //       max: 100_00,
  //     }),
  //   });

  //   expect(await po.getNfTooltip().isPresent()).toBe(true);
  // });

  // it("should display custom funding percentage when provided", async () => {
  //   const po = renderComponent({
  //     getProjectCommitmentSplit: () => ({
  //       isNFParticipating: false,
  //       current: 75_00,
  //       min: 30_00,
  //       max: 100_00,
  //     }),
  //   });

  //   expect(await po.getMinFundingPercentage()).toBe("75%");
  // });

  // it("should display custom ICP amounts when provided", async () => {
  //   const po = renderComponent({
  //     getMinIcpE8s: () => 2500_00000000n,
  //     getMaxIcpE8s: () => 10000_00000000n,
  //   });

  //   expect(await po.getMinIcp()).toBe("2'500 ICP");
  //   expect(await po.getMaxIcp()).toBe("10'000 ICP");
  // });

  // // Testing edge cases
  // it("should handle zero values correctly", async () => {
  //   const po = renderComponent({
  //     getMinIcpE8s: () => 0n,
  //     getMaxIcpE8s: () => 0n,
  //     getProjectCommitmentSplit: () => ({
  //       isNFParticipating: false,
  //       current: 0,
  //       min: 0,
  //       max: 100_00,
  //     }),
  //   });

  //   expect(await po.getMinFundingPercentage()).toBe("0%");
  //   expect(await po.getMinIcp()).toBe("0 ICP");
  //   expect(await po.getMaxIcp()).toBe("0 ICP");
  // });
});
