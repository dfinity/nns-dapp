import ImportTokenReview from "$lib/components/accounts/ImportTokenReview.svelte";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenReviewPo } from "$tests/page-objects/ImportTokenReview.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import type { Principal } from "@dfinity/principal";

describe("ImportTokenReview", () => {
  const tokenMetaData = {
    name: "Tetris",
    symbol: "TET",
    logo: "https://tetris.tet/logo.png",
  } as IcrcTokenMetadata;
  const renderComponent = (props: {
    ledgerCanisterId: Principal;
    indexCanisterId: Principal | undefined;
    tokenMetaData: IcrcTokenMetadata;
  }) => {
    const { container, component } = render(ImportTokenReview, {
      props,
    });

    const onConfirm = vi.fn();
    component.$on("nnsConfirm", onConfirm);
    const onBack = vi.fn();
    component.$on("nnsBack", onBack);

    return {
      po: ImportTokenReviewPo.under(new JestPageObjectElement(container)),
      onConfirm,
      onBack,
    };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render token meta information", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
      tokenMetaData,
    });

    expect(await po.getTokenName()).toEqual("Tetris");
    expect(await po.getTokenSymbol()).toEqual("TET");
    expect(await po.getLogoSource()).toEqual("https://tetris.tet/logo.png");
  });

  it("should render ledger canister id", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
      tokenMetaData,
    });

    expect(await po.getLedgerCanisterIdPo().getCanisterIdText()).toEqual(
      principal(0).toText()
    );
    expect(await po.getLedgerCanisterIdPo().getLabelText()).toEqual(
      "Ledger Canister ID"
    );
  });

  it("should render index canister id", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: principal(1),
      tokenMetaData,
    });

    expect(await po.getIndexCanisterIdPo().getCanisterIdText()).toEqual(
      principal(1).toText()
    );
    expect(await po.getIndexCanisterIdPo().getLabelText()).toEqual(
      "Index Canister ID"
    );
  });

  it("should render a warning message", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
      tokenMetaData,
    });

    expect((await po.getWarningPo().getText()).trim()).toEqual(
      "Warning: Be careful what token you import! Anyone can create a token including one with the same name as existing tokens, such as ckBTC."
    );
  });

  it("should dispatch events on buttons click", async () => {
    const { po, onBack, onConfirm } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
      tokenMetaData,
    });

    expect(onBack).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();

    await po.getConfirmButtonPo().click();

    expect(onBack).not.toHaveBeenCalled();
    expect(onConfirm).toBeCalledTimes(1);

    await po.getBackButtonPo().click();

    expect(onBack).toBeCalledTimes(1);
    expect(onConfirm).toBeCalledTimes(1);
  });
});
