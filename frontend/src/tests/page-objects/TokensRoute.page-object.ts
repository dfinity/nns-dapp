import { CkBTCReceiveModalPo } from "$tests/page-objects/CkBTCReceiveModal.page-object";
import { CkBTCTransactionModalPo } from "$tests/page-objects/CkBTCTransactionModal.page-object";
import { IcrcTokenTransactionModalPo } from "$tests/page-objects/IcrcTokenTransactionModal.page-object";
import { ImportTokenRemoveConfirmationPo } from "$tests/page-objects/ImportTokenRemoveConfirmation.page-object";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { SignInTokensPagePo } from "$tests/page-objects/SignInTokens.page-object";
import { TokensPagePo } from "$tests/page-objects/TokensPage.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TokensRoutePo extends BasePageObject {
  private static readonly TID = "tokens-route-component";

  static under(element: PageObjectElement): TokensRoutePo {
    return new TokensRoutePo(element.byTestId(TokensRoutePo.TID));
  }

  getSignInTokensPagePo(): SignInTokensPagePo {
    return SignInTokensPagePo.under(this.root);
  }

  hasLoginPage(): Promise<boolean> {
    return this.getSignInTokensPagePo().isPresent();
  }

  getTokensPagePo(): TokensPagePo {
    return TokensPagePo.under(this.root);
  }

  hasTokensPage(): Promise<boolean> {
    return this.getTokensPagePo().isPresent();
  }

  getCkBTCReceiveModalPo(): CkBTCReceiveModalPo {
    return CkBTCReceiveModalPo.under(this.root);
  }

  getReceiveModalPo(): ReceiveModalPo {
    return ReceiveModalPo.under(this.root);
  }

  getCkBTCTransactionModalPo(): CkBTCTransactionModalPo {
    return CkBTCTransactionModalPo.under(this.root);
  }

  transferCkBTCTokens(params: {
    destinationAddress: string;
    amount: number;
  }): Promise<void> {
    return this.getCkBTCTransactionModalPo().transferToAddress(params);
  }

  getIcrcTokenTransactionModal(): IcrcTokenTransactionModalPo {
    return IcrcTokenTransactionModalPo.under(this.root);
  }

  transferIcrcTokens(params: {
    destinationAddress: string;
    amount: number;
  }): Promise<void> {
    return this.getIcrcTokenTransactionModal().transferToAddress(params);
  }

  getImportTokenRemoveConfirmationPo(): ImportTokenRemoveConfirmationPo {
    return ImportTokenRemoveConfirmationPo.under(this.root);
  }
}
