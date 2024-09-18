import ImportTokenRemoveConfirmation from "$lib/components/accounts/ImportTokenRemoveConfirmation.svelte";
import type { Universe } from "$lib/types/universe";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenRemoveConfirmationPo } from "$tests/page-objects/ImportTokenRemoveConfirmation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import type { Principal } from "@dfinity/principal";

describe("ImportTokenRemoveConfirmation", () => {
  const ledgerCanisterId1 = principal(0);
  const tokenLogo = "data:image/svg+xml;base64,PHN2ZyB3...";
  const tokenName = "ckTest";
  const mockUniverse: Universe = {
    canisterId: ledgerCanisterId1.toText(),
    title: tokenName,
    logo: tokenLogo,
  };
  const renderComponent = (
    {
      ledgerCanisterId,
      universe,
      onClose,
      onConfirm,
    }: {
      ledgerCanisterId: Principal;
      universe: Universe;
      onClose?: () => void;
      onConfirm?: () => void;
    } = {
      ledgerCanisterId: ledgerCanisterId1,
      universe: mockUniverse,
    }
  ) => {
    const { container, component } = render(ImportTokenRemoveConfirmation, {
      props: {
        ledgerCanisterId,
        universe,
      },
    });
    if (onClose) {
      component.$on("nnsClose", onClose);
    }
    if (onConfirm) {
      component.$on("nnsConfirm", onConfirm);
    }
    return ImportTokenRemoveConfirmationPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render token logo", async () => {
    const po = renderComponent();
    expect(await po.getUniverseSummaryPo().getLogoUrl()).toEqual(tokenLogo);
  });

  it("should render token name", async () => {
    const po = renderComponent();
    expect(await po.getUniverseSummaryPo().getTitle()).toEqual(tokenName);
  });

  it("should dispatch events", async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const po = renderComponent({
      ledgerCanisterId: ledgerCanisterId1,
      universe: mockUniverse,
      onClose,
      onConfirm,
    });

    expect(onClose).not.toBeCalled();
    await po.clickNo();
    expect(onClose).toBeCalledTimes(1);

    expect(onConfirm).not.toBeCalled();
    await po.clickYes();
    expect(onConfirm).toBeCalledTimes(1);
  });

  it("should display ledger ID when universe is not available", async () => {
    const po = renderComponent({
      ledgerCanisterId: ledgerCanisterId1,
      universe: undefined,
    });
    expect(await po.getUniverseSummaryPo().isPresent()).toEqual(false);
    expect(await po.getLedgerCanisterId()).toEqual(ledgerCanisterId1.toText());
  });
});
