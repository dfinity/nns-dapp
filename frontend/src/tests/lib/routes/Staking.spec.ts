import Staking from "$lib/routes/Staking.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { StakingPo } from "$tests/page-objects/Staking.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "@testing-library/svelte";

describe("Staking", () => {
  const snsTitle = "SNS-1";
  const snsCanisterId = principal(1112);

  beforeEach(() => {
    neuronsStore.reset();
    snsNeuronsStore.reset();
    resetSnsProjects();
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

  it("should not render banner and login button when signed in but NNS neurons still loading", async () => {
    resetIdentity();
    neuronsStore.reset();
    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  it("should not render banner and login button when signed in but SNS neurons still loading", async () => {
    resetIdentity();

    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
    ]);
    snsNeuronsStore.reset();

    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  it("should render banner but no login button when signed in without neurons", async () => {
    resetIdentity();

    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
    ]);
    snsNeuronsStore.setNeurons({
      rootCanisterId: snsCanisterId,
      neurons: [],
      certified: true,
    });

    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(true);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  it("should not render banner or login button when signed in with NNS neurons", async () => {
    resetIdentity();
    neuronsStore.setNeurons({
      neurons: [mockNeuron],
      certified: true,
    });
    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  it("should not render banner or login button when signed in with SNS neurons", async () => {
    resetIdentity();

    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
    ]);
    snsNeuronsStore.setNeurons({
      rootCanisterId: snsCanisterId,
      neurons: [mockSnsNeuron],
      certified: true,
    });

    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });
});
