import Staking from "$lib/routes/Staking.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { StakingPo } from "$tests/page-objects/Staking.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Staking", () => {
  beforeEach(() => {
    resetIdentity();
  });

  const renderComponent = () => {
    const { container } = render(Staking);
    return StakingPo.under(new JestPageObjectElement(container));
  };

  it("should render the page banner and login button when not signed in", async () => {
    setNoIdentity();
    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(true);
    expect(await po.getSignInPo().isPresent()).toBe(true);
  });

  it("should not render the page banner and login button when signed in", async () => {
    resetIdentity();
    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });
});
