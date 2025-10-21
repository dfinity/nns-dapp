import LaunchpadBanner from "$lib/components/portfolio/LaunchpadBanner.svelte";
import { principal } from "$tests/mocks/sns-projects.mock";
import { LaunchpadBannerPo } from "$tests/page-objects/LaunchpadBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { SnsSwapLifecycle } from "@icp-sdk/canisters/sns";

describe("LaunchpadBanner", () => {
  const buyerTotalIcpE8s = 1_00_000_000;
  const projectCount = 30;
  beforeEach(() => {
    setSnsProjects(
      Array.from({ length: projectCount }, (_, i) => ({
        rootCanisterId: principal(i),
        lifecycle: SnsSwapLifecycle.Committed,
        buyerTotalIcpE8s,
      }))
    );
  });

  const renderComponent = () => {
    const { container } = render(LaunchpadBanner);
    return LaunchpadBannerPo.under(new JestPageObjectElement(container));
  };

  it("should not render when no launched projects exist", async () => {
    setSnsProjects([]);
    const po = await renderComponent();
    expect(await po.getContent().isPresent()).toBe(false);
  });

  it("should render when launched projects exist", async () => {
    // This will use the mocked projects set in beforeEach
    const po = await renderComponent();
    expect(await po.getContent().isPresent()).toBe(true);
  });

  it("should display the raised value", async () => {
    const po = await renderComponent();

    expect(await po.getRaisedValue()).toContain(
      `${(projectCount * buyerTotalIcpE8s) / 1_00_000_000}`
    );
  });

  it("should display the number of launched projects", async () => {
    const po = await renderComponent();

    expect(await po.getLaunchedValue()).toBe("30");
  });

  it("should display the proposals executed value", async () => {
    const po = await renderComponent();
    // Currently hardcoded in the component
    expect(await po.getProposalsExecutedValue()).toBe("8500+");
  });
});
