import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

const IMPORTED_TOKEN_NAME = "ckRED";
const MAIN_ACCOUNT_NAME = "Main";
// The value of PRICE_NOT_AVAILABLE_PLACEHOLDER in
// $lib/constants/constants. The e2e specs do not import from $lib.
const PRICE_NOT_AVAILABLE = "-/-";

// This spec guards the fix for the symbol based price lookup. An imported
// token must never change the USD price that the app shows for ICP.
//
// The spec is `fixme` for two reasons. Both are environment limits, not code
// faults.
//
// 1. The local e2e environment shows no USD price at all. `dfx.json` gives the
//    `icp-swap` canister a URL for `mainnet`, `app` and `beta` only. On the
//    `local` network `config.sh` therefore sets an empty `ICP_SWAP_URL`,
//    `queryIcpSwapTickers` throws, and `tickersStore` becomes "error". Every
//    fiat value renders as PRICE_NOT_AVAILABLE. To run this spec, the e2e
//    setup must serve a tickers response for the local ICP ledger.
// 2. The e2e fixture set has one importable ledger, `ckred_ledger`, and its
//    symbol is "ckRED". A full spoof case needs a second test ledger whose
//    symbol is "ICP". Without it, this spec can only prove that an honest
//    import leaves the ICP price alone.
test.fixme(
  "An imported token does not change the ICP USD price",
  async ({ page, context }) => {
    const importedLedgerCanisterId = await dfxCanisterId("ckred_ledger");
    const importedIndexCanisterId = await dfxCanisterId("ckred_index");

    await page.goto("/accounts");
    await disableCssAnimations(page);
    await signInWithNewUser({ page, context });

    const pageElement = PlaywrightPageObjectElement.fromPage(page);
    const appPo = new AppPo(pageElement);

    const readIcpFiatValue = async (): Promise<string> => {
      const tokensTablePo = appPo
        .getAccountsPo()
        .getNnsAccountsPo()
        .getTokensTablePo();
      const mainAccountRow =
        await tokensTablePo.getRowByName(MAIN_ACCOUNT_NAME);
      await mainAccountRow.waitForBalance();
      await mainAccountRow.click();

      const nnsWalletPo = appPo.getWalletPo().getNnsWalletPo();
      await nnsWalletPo.clickSend();

      const modalPo = nnsWalletPo.getIcpTransactionModalPo();
      await modalPo.waitFor();

      const amountInputPo = modalPo.getTransactionFormPo().getAmountInputPo();
      await amountInputPo.enterAmount(1);

      const fiatValue = await amountInputPo
        .getAmountInputFiatValuePo()
        .getFiatValue();

      await modalPo.closeModal();
      await modalPo.waitForClosed();

      return fiatValue;
    };

    step("Read the USD value of 1 ICP before any import");

    const fiatValueBeforeImport = await readIcpFiatValue();
    expect(fiatValueBeforeImport).not.toContain(PRICE_NOT_AVAILABLE);

    step("Import a token");

    await page.goto("/tokens");
    const tokensPagePo = appPo.getTokensPo().getTokensPagePo();
    await tokensPagePo.getSettingsButtonPo().click();

    const importButtonPo = tokensPagePo.getImportTokenButtonPo();
    await importButtonPo.waitFor();
    await importButtonPo.click();

    const importTokenModalPo = tokensPagePo.getImportTokenModalPo();
    await importTokenModalPo.waitFor();

    const formPo = importTokenModalPo.getImportTokenFormPo();
    await formPo.getLedgerCanisterInputPo().typeText(importedLedgerCanisterId);
    await formPo.getIndexCanisterInputPo().typeText(importedIndexCanisterId);
    await formPo.getSubmitButtonPo().click();

    const reviewPo = importTokenModalPo.getImportTokenReviewPo();
    await reviewPo.waitFor();
    expect(await reviewPo.getTokenName()).toBe(IMPORTED_TOKEN_NAME);
    await reviewPo.getConfirmButtonPo().click();

    await appPo.getWalletPo().getIcrcWalletPo().waitFor();

    step("The USD value of 1 ICP did not change");

    await page.goto("/accounts");
    const fiatValueAfterImport = await readIcpFiatValue();
    expect(fiatValueAfterImport).toBe(fiatValueBeforeImport);
  }
);
