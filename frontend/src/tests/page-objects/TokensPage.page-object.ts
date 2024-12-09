import { ImportTokenModalPo } from "$tests/page-objects/ImportTokenModal.page-object";
import { UsdValueBannerPo } from "$tests/page-objects/UsdValueBanner.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { BackdropPo } from "./Backdrop.page-object";
import type { ButtonPo } from "./Button.page-object";
import { HideZeroBalancesTogglePo } from "./HideZeroBalancesToggle.page-object";
import { TokensTablePo } from "./TokensTable.page-object";
import type { TokensTableRowData } from "./TokensTableRow.page-object";

export class TokensPagePo extends BasePageObject {
  private static readonly TID = "tokens-page-component";

  static under(element: PageObjectElement): TokensPagePo {
    return new TokensPagePo(element.byTestId(TokensPagePo.TID));
  }

  getUsdValueBannerPo(): UsdValueBannerPo {
    return UsdValueBannerPo.under(this.root);
  }

  getTokensTable(): TokensTablePo {
    return TokensTablePo.under(this.root);
  }

  getSettingsButtonPo(): ButtonPo {
    return this.getButton("settings-button");
  }

  getHideZeroBalancesTogglePo(): HideZeroBalancesTogglePo {
    return HideZeroBalancesTogglePo.under(this.root);
  }

  getBackdropPo(): BackdropPo {
    return BackdropPo.under(this.root);
  }

  getShowAllButtonPo(): ButtonPo {
    return this.getButton("show-all-button");
  }

  getImportTokenButtonPo(): ButtonPo {
    return this.getButton("import-token-button");
  }

  getImportTokenModalPo(): ImportTokenModalPo {
    return ImportTokenModalPo.under(this.root);
  }

  hasTokensTable(): Promise<boolean> {
    return this.getTokensTable().isPresent();
  }

  getTokenNames(): Promise<string[]> {
    return this.getTokensTable().getTokenNames();
  }

  getRowsData(): Promise<TokensTableRowData[]> {
    return this.getTokensTable().getRowsData();
  }

  getRowData(projectName: string): Promise<TokensTableRowData> {
    return this.getTokensTable().getRowData(projectName);
  }

  clickSendOnRow(projectName: string): Promise<void> {
    return this.getTokensTable().clickSendOnRow(projectName);
  }

  clickReceiveOnRow(projectName: string): Promise<void> {
    return this.getTokensTable().clickReceiveOnRow(projectName);
  }
}
