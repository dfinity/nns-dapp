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
    const { container, component } = render(ImportTokenRemoveConfirmation, {
      props: {
        universe: mockUniverse,
      },
    });

    const nnsConfirm = vi.fn();
    component.$on("nnsConfirm", nnsConfirm);
    const nnsClose = vi.fn();
    component.$on("nnsClose", nnsClose);

    return {
      po: ImportTokenRemoveConfirmationPo.under(
        new JestPageObjectElement(container)
      ),
      nnsConfirm,
      nnsClose,
    };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render token logo", async () => {
    const { po } = renderComponent();
    expect(await po.getUniversePageSummaryPo().getLogoUrl()).toEqual(tokenLogo);
  });

  it("should render token name", async () => {
    const { po } = renderComponent();
    expect(await po.getUniversePageSummaryPo().getTitle()).toEqual(tokenName);
  });

  it("should dispatch events", async () => {
    const { po, nnsClose, nnsConfirm } = renderComponent();

    expect(nnsClose).not.toBeCalled();
    await po.clickNo();
    expect(nnsClose).toBeCalledTimes(1);

    expect(nnsConfirm).not.toBeCalled();
    await po.clickYes();
    expect(nnsConfirm).toBeCalledTimes(1);
  });
});
