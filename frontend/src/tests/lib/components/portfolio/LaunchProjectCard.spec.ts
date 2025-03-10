import LaunchProjectCard from "$lib/components/portfolio/LaunchProjectCard.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { LaunchProjectCardPo } from "$tests/page-objects/LaunchProjectCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";

describe("LaunchProjectCard", () => {
  const mockRootCanisterId = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

  const createMockSummary = (overrides = {}) => {
    const defaultSummary = {
      rootCanisterId: mockRootCanisterId,
      metadata: {
        name: "Test Project",
        description: "This is a test project description",
        logo: "test-logo.png",
      },
      getMinIcpE8s: () => 1000_00000000n,
      getMaxIcpE8s: () => 5000_00000000n,
      swap: {
        deadline: BigInt(Date.now()) / 1000n + 86400n, // 1 day from now
      },
    };

    const merged = { ...defaultSummary, ...overrides };

    // Create a mock for getProjectCommitmentSplit
    const result = {
      ...merged,
    };

    // Mock the necessary functions
    result.getProjectCommitmentSplit = jest.fn().mockReturnValue({
      isNFParticipating: false,
      current: 30_00,
      min: 30_00,
      max: 100_00,
    });

    return result;
  };

  const renderComponent = (summaryOverrides = {}) => {
    const summary = createMockSummary(summaryOverrides);

    const { container } = render(LaunchProjectCard, {
      props: {
        summary,
      },
    });

    return {
      po: LaunchProjectCardPo.under(new JestPageObjectElement(container)),
      summary,
    };
  };

  it("should display project name and description", async () => {
    const { po } = renderComponent();

    expect(await po.getTitle()).toBe("Test Project");
    expect(await po.getDescription()).toBe(
      "This is a test project description"
    );
  });

  it("should display minimum funding percentage", async () => {
    const { po } = renderComponent();

    expect(await po.getMinFundingPercentage()).toBe("30%");
  });

  it("should display min and max ICP amounts", async () => {
    const { po } = renderComponent();

    expect(await po.getMinIcp()).toBe("1'000 ICP");
    expect(await po.getMaxIcp()).toBe("5'000 ICP");
  });

  it("should not display NF participation when it doesn't exist", async () => {
    const { po } = renderComponent();

    expect(await po.hasNfParticipation()).toBe(false);
    expect(await po.getNfParticipation()).toBeNull();
  });

  it("should display NF participation when it exists", async () => {
    const mockSummaryWithNF = {
      swap: {
        neurons_fund_participation: {
          amount_icp_e8s: 500_00000000n,
        },
      },
    };

    // Mock the getNeuronsFundParticipation function result
    const { po } = renderComponent({
      ...mockSummaryWithNF,
      getNeuronsFundParticipation: () => 500_00000000n,
      getProjectCommitmentSplit: () => ({
        isNFParticipating: true,
        current: 30_00,
        min: 30_00,
        max: 100_00,
      }),
    });

    expect(await po.hasNfParticipation()).toBe(true);
    expect(await po.getNfParticipation()).toBe("500 ICP");
  });

  it("should display time remaining until deadline", async () => {
    const deadline = BigInt(Date.now()) / 1000n + 86400n; // 1 day from now
    const { po } = renderComponent({
      swap: {
        deadline,
      },
    });

    const timeRemaining = await po.getTimeRemaining();
    // We can't exactly test the string since it depends on the current time
    // but we can check it contains some duration text
    expect(timeRemaining).toContain("day");
  });

  it("should have proper link to project page", async () => {
    const { po, summary } = renderComponent();

    const expectedHref = `${AppPath.Project}/?project=${summary.rootCanisterId.toText()}`;
    expect(await po.getLinkHref()).toBe(expectedHref);
    expect(await po.getLinkText()).toContain("View project");
  });

  it("should display tooltip for NF participation when it exists", async () => {
    const { po } = renderComponent({
      getNeuronsFundParticipation: () => 500_00000000n,
      getProjectCommitmentSplit: () => ({
        isNFParticipating: true,
        current: 30_00,
        min: 30_00,
        max: 100_00,
      }),
    });

    expect(await po.getNfTooltip().isPresent()).toBe(true);
  });

  it("should display custom funding percentage when provided", async () => {
    const { po } = renderComponent({
      getProjectCommitmentSplit: () => ({
        isNFParticipating: false,
        current: 75_00,
        min: 30_00,
        max: 100_00,
      }),
    });

    expect(await po.getMinFundingPercentage()).toBe("75%");
  });

  it("should display custom ICP amounts when provided", async () => {
    const { po } = renderComponent({
      getMinIcpE8s: () => 2500_00000000n,
      getMaxIcpE8s: () => 10000_00000000n,
    });

    expect(await po.getMinIcp()).toBe("2'500 ICP");
    expect(await po.getMaxIcp()).toBe("10'000 ICP");
  });

  // Testing edge cases
  it("should handle zero values correctly", async () => {
    const { po } = renderComponent({
      getMinIcpE8s: () => 0n,
      getMaxIcpE8s: () => 0n,
      getProjectCommitmentSplit: () => ({
        isNFParticipating: false,
        current: 0,
        min: 0,
        max: 100_00,
      }),
    });

    expect(await po.getMinFundingPercentage()).toBe("0%");
    expect(await po.getMinIcp()).toBe("0 ICP");
    expect(await po.getMaxIcp()).toBe("0 ICP");
  });
});
