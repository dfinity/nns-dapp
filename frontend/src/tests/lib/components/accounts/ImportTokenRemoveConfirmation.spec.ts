import ImportTokenRemoveConfirmation from "$lib/components/accounts/ImportTokenRemoveConfirmation.svelte";
import type { Universe } from "$lib/types/universe";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenRemoveConfirmationPo } from "$tests/page-objects/ImportTokenRemoveConfirmation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("ImportTokenRemoveConfirmation", () => {
  const ledgerCanisterId = principal(1);
  const tokenLogo = "data:image/svg+xml;base64,PHN2ZyB3...";
  const tokenName = "ckTest";
  const mockUniverse: Universe = {
    canisterId: ledgerCanisterId.toText(),
    title: tokenName,
    logo: tokenLogo,
  };
  const renderComponent = () => {
    const { container } = render(ImportTokenRemoveConfirmation, {
      props: {
        universe: mockUniverse,
      },
    });

    return ImportTokenRemoveConfirmationPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render token logo", async () => {
    const po = renderComponent();
    expect(await po.getUniversePageSummaryPo().getLogoUrl()).toEqual(tokenLogo);
  });

  it("should render token name", async () => {
    const po = renderComponent();
    expect(await po.getUniversePageSummaryPo().getTitle()).toEqual(tokenName);
  });
});
