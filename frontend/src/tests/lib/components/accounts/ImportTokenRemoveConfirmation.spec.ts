import ImportTokenRemoveConfirmation from "$lib/components/accounts/ImportTokenRemoveConfirmation.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenRemoveConfirmationPo } from "$tests/page-objects/ImportTokenRemoveConfirmation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import type { Principal } from "@dfinity/principal";

describe("ImportTokenRemoveConfirmation", () => {
  const ledgerCanisterId = principal(1);
  const tokenLogo = "data:image/svg+xml;base64,PHN2ZyB3...";
  const tokenName = "ckTest";
  const renderComponent = (props: {
    ledgerCanisterId: Principal | undefined;
  }) => {
    const { container, component } = render(ImportTokenRemoveConfirmation, {
      props,
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
    tokensStore.reset();
    icrcCanistersStore.reset();
    vi.restoreAllMocks();

    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: ledgerCanisterId.toText() },
    });
    tokensStore.setTokens({
      [ledgerCanisterId.toText()]: {
        certified: true,
        token: {
          ...mockToken,
          name: tokenName,
          logo: tokenLogo,
        },
      },
    });
    icrcCanistersStore.setCanisters({
      ledgerCanisterId: ledgerCanisterId,
      indexCanisterId: principal(2),
    });
  });

  it("should render a modal title", async () => {
    const { po } = renderComponent({
      ledgerCanisterId,
    });
    expect(await po.getModalTitle()).toEqual("Remove Token");
  });

  it("should render token logo", async () => {
    const { po } = renderComponent({
      ledgerCanisterId,
    });
    expect(await po.getUniversePageSummaryPo().getLogoUrl()).toEqual(tokenLogo);
  });

  it("should render token name", async () => {
    const { po } = renderComponent({
      ledgerCanisterId,
    });
    expect(await po.getUniversePageSummaryPo().getTitle()).toEqual(tokenName);
  });

  it("should render description", async () => {
    const { po } = renderComponent({
      ledgerCanisterId,
    });
    expect(await po.getDescription()).toEqual(
      "Are you sure you want to remove this token from your account?Tokens you hold in your account will not be lost, and you can add the token back in the future."
    );
  });

  it("should dispatch events", async () => {
    const { po, nnsClose, nnsConfirm } = renderComponent({
      ledgerCanisterId,
    });

    expect(nnsClose).not.toBeCalled();
    await po.clickClose();
    expect(nnsClose).toBeCalledTimes(1);

    expect(nnsConfirm).not.toBeCalled();
    await po.clickConfirm();
    expect(nnsConfirm).toBeCalledTimes(1);
  });
});
