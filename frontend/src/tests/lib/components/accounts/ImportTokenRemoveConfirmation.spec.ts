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

  it("should render a modal title", async () => {
    const { po } = renderComponent();
    expect(await po.getModalTitle()).toEqual("Remove Token");
  });

  it("should render token logo", async () => {
    const { po } = renderComponent();
    expect(await po.getUniversePageSummaryPo().getLogoUrl()).toEqual(tokenLogo);
  });

  it("should render token name", async () => {
    const { po } = renderComponent();
    expect(await po.getUniversePageSummaryPo().getTitle()).toEqual(tokenName);
  });

  it("should render description", async () => {
    const { po } = renderComponent();
    expect(await po.getDescription()).toEqual(
      "Are you sure you want to remove this token from your account?Tokens you hold in your account will not be lost, and you can add the token back in the future."
    );
  });

  it("should dispatch events", async () => {
    const { po, nnsClose, nnsConfirm } = renderComponent();

    expect(nnsClose).not.toBeCalled();
    await po.clickClose();
    expect(nnsClose).toBeCalledTimes(1);

    expect(nnsConfirm).not.toBeCalled();
    await po.clickConfirm();
    expect(nnsConfirm).toBeCalledTimes(1);
  });
});
