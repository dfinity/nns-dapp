import ApyFallbackCard from "$lib/components/portfolio/ApyFallbackCard.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { ApyFallbackCardPo } from "$tests/page-objects/ApyFallbackCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ApyFallbackCard", () => {
  const loadingProps = {
    stakingRewardData: { loading: true } as const,
  };

  const errorProps = {
    stakingRewardData: {
      loading: false,
      error: "Failed to load staking data",
    } as const,
  };

  const renderComponent = (props) => {
    const { container } = render(ApyFallbackCard, { props });

    return ApyFallbackCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should display loading content when loading is true", async () => {
    const po = renderComponent(loadingProps);

    expect(await po.getLoadingContent().isPresent()).toBe(true);
    expect(await po.getErrorContent().isPresent()).toBe(false);
  });

  it("should display error content when there is an error", async () => {
    const po = renderComponent(errorProps);

    expect(await po.getLoadingContent().isPresent()).toBe(false);
    expect(await po.getErrorContent().isPresent()).toBe(true);
  });
});
