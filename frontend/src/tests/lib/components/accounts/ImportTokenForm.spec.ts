import ImportTokenForm from "$lib/components/accounts/ImportTokenForm.svelte";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenFormPo } from "$tests/page-objects/ImportTokenForm.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import type { Principal } from "@dfinity/principal";

describe("ImportTokenForm", () => {
  const renderComponent = (props: {
    ledgerCanisterId: Principal | undefined;
    indexCanisterId: Principal | undefined;
    addIndexCanisterMode?: boolean | undefined;
  }) => {
    const nnsSubmit = vi.fn();
    const nnsClose = vi.fn();

    const { container, component } = render(ImportTokenForm, {
      props,
      events: {
        nnsSubmit: nnsSubmit,
        nnsClose: nnsClose,
      },
    });

    const getPropLedgerCanisterId = () =>
      component.$$.ctx[component.$$.props["ledgerCanisterId"]];
    const getPropIndexCanisterId = () =>
      component.$$.ctx[component.$$.props["indexCanisterId"]];

    return {
      po: ImportTokenFormPo.under(new JestPageObjectElement(container)),
      nnsSubmit,
      nnsClose,
      getPropLedgerCanisterId,
      getPropIndexCanisterId,
    };
  };

  it("should render ledger canister id", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
    });

    expect((await po.getLedgerCanisterInputPo().getText()).trim()).toEqual(
      "Ledger Canister ID"
    );
    expect(await po.getLedgerCanisterInputPo().getValue()).toEqual(
      principal(0).toText()
    );
    expect(await po.getLedgerCanisterInputPo().isRequired()).toEqual(true);
    expect(await po.getLedgerCanisterInputPo().isDisabled()).toEqual(false);
  });

  it("should render index canister id", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
    });

    expect((await po.getIndexCanisterInputPo().getText()).trim()).toEqual(
      "Index Canister ID (Optional)"
    );
    expect(await po.getIndexCanisterInputPo().getValue()).toEqual("");
    expect(await po.getIndexCanisterInputPo().isRequired()).toEqual(false);
  });

  it("should render a warning message", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
    });

    expect((await po.getWarningPo().getText()).trim()).toEqual(
      "Warning: Be careful what token you import! Anyone can create a token including one with the same name as existing tokens, such as ckBTC."
    );
  });

  it("should enable the next button only when the ledger canister id is valid", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: undefined,
      indexCanisterId: undefined,
    });

    expect(await po.getSubmitButtonPo().isDisabled()).toEqual(true);

    // Enter a valid canister id
    await po.getLedgerCanisterInputPo().getTextInputPo().typeText("aaaaa-aa");

    expect(await po.getSubmitButtonPo().isDisabled()).toEqual(false);
  });

  it("should disable the next button when the ledger canister id is invalid", async () => {
    const { po } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
    });

    expect(await po.getSubmitButtonPo().isDisabled()).toEqual(false);
    expect(await po.getSubmitButtonPo().getText()).toEqual("Next");

    // Enter an invalid canister id
    await po
      .getLedgerCanisterInputPo()
      .getTextInputPo()
      .typeText("invalid-canister-id");

    expect(await po.getSubmitButtonPo().isDisabled()).toEqual(true);
  });

  it("should bind canister ids props to inputs", async () => {
    const principal1 = principal(1);
    const principal2 = principal(2);
    const { po, getPropLedgerCanisterId, getPropIndexCanisterId } =
      renderComponent({
        ledgerCanisterId: undefined,
        indexCanisterId: undefined,
      });

    // Enter canister ids
    await po
      .getLedgerCanisterInputPo()
      .getTextInputPo()
      .typeText(principal1.toText());
    await po
      .getIndexCanisterInputPo()
      .getTextInputPo()
      .typeText(principal2.toText());

    expect(getPropLedgerCanisterId()).toEqual(principal1);
    expect(getPropIndexCanisterId()).toEqual(principal2);
  });

  it("should dispatch nnsClose event", async () => {
    const { po, nnsSubmit, nnsClose } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
    });

    expect(nnsSubmit).not.toHaveBeenCalled();
    expect(nnsClose).not.toHaveBeenCalled();

    await po.getCancelButtonPo().click();

    expect(nnsSubmit).not.toHaveBeenCalled();
    expect(nnsClose).toBeCalledTimes(1);
  });

  it("should dispatch nnsSubmit event", async () => {
    const { po, nnsSubmit, nnsClose } = renderComponent({
      ledgerCanisterId: principal(0),
      indexCanisterId: undefined,
    });

    expect(nnsSubmit).not.toHaveBeenCalled();
    expect(nnsClose).not.toHaveBeenCalled();

    await po.getSubmitButtonPo().click();

    expect(nnsSubmit).toBeCalledTimes(1);
    expect(nnsClose).not.toHaveBeenCalled();
  });

  it("should display addIndexCanister mode ", async () => {
    const ledgerCanisterId = principal(0);
    const { po } = renderComponent({
      ledgerCanisterId,
      indexCanisterId: undefined,
      addIndexCanisterMode: true,
    });

    expect(await po.getLedgerCanisterInputPo().isPresent()).toEqual(false);
    expect(await po.getLedgerCanisterIdPo().isPresent()).toEqual(true);
    expect(await po.getLedgerCanisterIdPo().getCanisterIdText()).toEqual(
      ledgerCanisterId.toText()
    );
    expect(await po.getIndexCanisterInputPo().isRequired()).toEqual(true);
    expect((await po.getIndexCanisterInputPo().getText()).trim()).toEqual(
      "Index Canister ID"
    );
    expect(await po.getSubmitButtonPo().getText()).toEqual("Add");
  });
});
