import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import * as actionableProposalsServices from "$lib/services/actionable-proposals.services";
import * as actionableSnsProposalsServices from "$lib/services/actionable-sns-proposals.services";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { SelectUniverseDropdownPo } from "$tests/page-objects/SelectUniverseDropdown.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SelectUniverseNav", () => {
  const spyLoadActionableProposals = vi.spyOn(
    actionableProposalsServices,
    "loadActionableProposals"
  );
  const spyLoadActionableSnsProposals = vi.spyOn(
    actionableSnsProposalsServices,
    "loadActionableSnsProposals"
  );
  const renderComponent = () => {
    const { container } = render(SelectUniverseNav);
    return SelectUniverseDropdownPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetSnsProjects();
    resetIdentity();

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Proposals,
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should render select universe component", async () => {
    const po = await renderComponent();
    expect(await po.getSelectUniverseCardPo().isPresent()).toEqual(true);
  });

  it("should load Nns neurons and proposals", async () => {
    expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
    await renderComponent();
    await runResolvedPromises();
    expect(spyLoadActionableProposals).toHaveBeenCalledTimes(1);
  });

  it("should load actionable Sns proposals", async () => {
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
    setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
    await renderComponent();
    await runResolvedPromises();
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(1);
  });

  it("should load actionable Sns proposals after sns list update", async () => {
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
    await renderComponent();
    await runResolvedPromises();
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);

    setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
    await runResolvedPromises();
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(1);
  });
});
