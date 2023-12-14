import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { CkBTCReceiveModalPo } from "./CkBTCReceiveModal.page-object";
import { CkBTCTransactionModalPo } from "./CkBTCTransactionModal.page-object";
import { IcrcTokenTransactionModalPo } from "./IcrcTokenTransactionModal.page-object";
import { ReceiveModalPo } from "./ReceiveModal.page-object";
import { SignInTokensPagePo } from "./SignInTokens.page-object";
import { SnsTransactionModalPo } from "./SnsTransactionModal.page-object";
import { TokensPagePo } from "./TokensPage.page-object";

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

  getSnsTransactionModalPo(): SnsTransactionModalPo {
    return SnsTransactionModalPo.under(this.root);
  }

  getCkBTCReceiveModalPo(): CkBTCReceiveModalPo {
    return CkBTCReceiveModalPo.under(this.root);
  }

  getReceiveModalPo(): ReceiveModalPo {
    return ReceiveModalPo.under(this.root);
  }

  transferSnsTokens(params: {
    destinationAddress: string;
    amount: number;
  }): Promise<void> {
    return this.getSnsTransactionModalPo().transferToAddress(params);
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
}
