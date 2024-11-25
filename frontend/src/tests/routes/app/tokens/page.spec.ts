import * as ckBTCMinterApi from "$lib/api/ckbtc-minter.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as importedTokensApi from "$lib/api/imported-tokens.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import {
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import {
  CKUSDC_INDEX_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckusdc-canister-ids.constants";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { numberToUlps } from "$lib/utils/token.utils";
import TokensRoute from "$routes/(app)/(nns)/tokens/+page.svelte";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCToken,
  mockCkTESTBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { mockCkUSDCToken } from "$tests/mocks/tokens.mock";
import { TokensRoutePo } from "$tests/page-objects/TokensRoute.page-object";
import type { TokensTableRowPo } from "$tests/page-objects/TokensTableRow.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { setCkETHCanisters } from "$tests/utils/cketh.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { AuthClient } from "@dfinity/auth-client";
import { MinterNoNewUtxosError, type UpdateBalanceOk } from "@dfinity/ckbtc";
import { encodeIcrcAccount, type IcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { isNullish } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/sns-ledger.api");
vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/ckbtc-minter.api");

describe("Tokens route", () => {
  const mockAuthClient = mock<AuthClient>();
  mockAuthClient.login.mockResolvedValue(undefined);

  const rootCanisterIdTetris = rootCanisterIdMock;
  const rootCanisterIdPacman = principal(1);
  const ledgerCanisterIdTetris = principal(2);
  const ledgerCanisterIdPacman = principal(3);
  const tetrisToken = mockSnsToken;
  const pacmanToken = {
    ...mockSnsToken,
    symbol: "PCMN",
  };
  const tetrisDefaultBalanceE8s = 222000000n;
  let tetrisBalanceE8s = tetrisDefaultBalanceE8s;
  const pacmanBalanceE8s = 314000000n;
  const ckBTCDefaultBalanceE8s = 444556699n;
  let ckBTCBalanceE8s = ckBTCDefaultBalanceE8s;
  const ckUSDCBalanceE8s = 111000000n;
  const amountCkBTCTransaction = 2;
  const amountCkBTCTransactionUlps = numberToUlps({
    amount: amountCkBTCTransaction,
    token: mockCkBTCToken,
  });
  const ckETHDefaultBalanceUlps = 4_140_000_000_000_000_000n;
  let ckETHBalanceUlps = ckETHDefaultBalanceUlps;
  const amountCkETHTransaction = 2;
  const amountCkETHTransactionUlps = numberToUlps({
    amount: amountCkETHTransaction,
    token: mockCkETHToken,
  });
  const icpBalanceE8s = 123456789n;
  const noPendingUtxos = new MinterNoNewUtxosError({
    pending_utxos: [],
    required_confirmations: 0,
  });
  const importedToken1Id = Principal.fromText(
    "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
  );
  const importedToken1Metadata = {
    name: "ZTOKEN1",
    symbol: "ZTOKEN1",
    fee: 4_000n,
    decimals: 6,
  } as IcrcTokenMetadata;
  const importedToken2IdText = "fzkl3-c3fae";
  const importedToken2Id = Principal.fromText(importedToken2IdText);
  const importedToken2Metadata = {
    name: "ATOKEN2",
    symbol: "ATOKEN2",
    fee: 4_000n,
    decimals: 6,
  } as IcrcTokenMetadata;
  const importedToken1Data: ImportedTokenData = {
    ledgerCanisterId: importedToken1Id,
    indexCanisterId: principal(111),
  };
  const importedToken2Data: ImportedTokenData = {
    ledgerCanisterId: importedToken2Id,
    indexCanisterId: undefined,
  };

  const renderPage = async () => {
    const { container } = render(TokensRoute);

    await runResolvedPromises();

    return TokensRoutePo.under(new JestPageObjectElement(container));
  };

  describe("when feature flag enabled", () => {
    beforeEach(() => {
      importedTokensStore.reset();
      failedImportedTokenLedgerIdsStore.reset();
      ckBTCBalanceE8s = ckBTCDefaultBalanceE8s;
      ckETHBalanceUlps = ckETHDefaultBalanceUlps;
      tetrisBalanceE8s = tetrisDefaultBalanceE8s;
      vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockImplementation(
        async ({ canisterId }) => {
          const tokenMap = {
            [CKBTC_UNIVERSE_CANISTER_ID.toText()]: mockCkBTCToken,
            [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: mockCkTESTBTCToken,
            [CKETH_UNIVERSE_CANISTER_ID.toText()]: mockCkETHToken,
            [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: mockCkTESTBTCToken,
            [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: mockCkUSDCToken,
            // imported tokens
            [importedToken1Id.toText()]: importedToken1Metadata,
            [importedToken2Id.toText()]: importedToken2Metadata,
          };
          if (isNullish(tokenMap[canisterId.toText()])) {
            throw new Error(
              `Token not found for canister ${canisterId.toText()}`
            );
          }
          return tokenMap[canisterId.toText()];
        }
      );
      vi.spyOn(AuthClient, "create").mockImplementation(
        async (): Promise<AuthClient> => mockAuthClient
      );
      vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockImplementation(
        async ({ canisterId }) => {
          const balancesMap = {
            [CKBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
            [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
            [CKETH_UNIVERSE_CANISTER_ID.toText()]: ckETHBalanceUlps,
            [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: ckUSDCBalanceE8s,
            [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: ckETHBalanceUlps,
            [ledgerCanisterIdTetris.toText()]: tetrisBalanceE8s,
            [ledgerCanisterIdPacman.toText()]: pacmanBalanceE8s,
            // imported tokens
            [importedToken1Id.toText()]: 10n,
            [importedToken2Id.toText()]: 0n,
          };
          if (isNullish(balancesMap[canisterId.toText()])) {
            throw new Error(
              `Account not found for canister ${canisterId.toText()}`
            );
          }
          return balancesMap[canisterId.toText()];
        }
      );
      vi.spyOn(icrcLedgerApi, "icrcTransfer").mockResolvedValue(1234n);
      vi.spyOn(ckBTCMinterApi, "updateBalance").mockRejectedValue(
        noPendingUtxos
      );
      vi.mocked(ckBTCMinterApi.minterInfo).mockResolvedValue(
        mockCkBTCMinterInfo
      );

      setSnsProjects([
        {
          rootCanisterId: rootCanisterIdTetris,
          ledgerCanisterId: ledgerCanisterIdTetris,
          projectName: "Tetris",
          tokenMetadata: tetrisToken,
          lifecycle: SnsSwapLifecycle.Committed,
        },
        {
          rootCanisterId: rootCanisterIdPacman,
          ledgerCanisterId: ledgerCanisterIdPacman,
          projectName: "Pacman",
          tokenMetadata: pacmanToken,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
      setCkETHCanisters();
      setAccountsForTesting({
        main: { ...mockMainAccount, balanceUlps: icpBalanceE8s },
      });

      defaultIcrcCanistersStore.setCanisters({
        ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
        indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
      });
      tokensStore.setToken({
        canisterId: CKUSDC_UNIVERSE_CANISTER_ID,
        token: mockCkUSDCToken,
      });
    });

    describe("when logged in", () => {
      beforeEach(() => {
        resetIdentity();
      });

      it("should render my tokens page", async () => {
        const po = await renderPage();

        expect(await po.hasLoginPage()).toBe(false);
        expect(await po.hasTokensPage()).toBe(true);
      });

      it("renders 'Projects' as tokens table first column", async () => {
        const po = await renderPage();

        const tablePo = po.getTokensPagePo().getTokensTable();
        expect(await tablePo.getFirstColumnHeader()).toEqual("Projects");
      });

      describe("when ckBTC is enabled", () => {
        beforeEach(() => {
          overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
        });

        it("should render ICP, ckBTC, ckETH and SNS tokens", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();
          expect(await tokensPagePo.getTokenNames()).toEqual([
            "Internet Computer",
            "ckBTC",
            "ckETH",
            "ckUSDC",
            "Pacman",
            "Tetris",
          ]);
        });

        it("should render ICP, ckBTC, ckETH and SNS token balances", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();
          expect(await tokensPagePo.getRowsData()).toEqual([
            { projectName: "Internet Computer", balance: "1.23 ICP" },
            { projectName: "ckBTC", balance: "4.45 ckBTC" },
            { projectName: "ckETH", balance: "4.14 ckETH" },
            { projectName: "ckUSDC", balance: "111.00 ckUSDC" },
            { projectName: "Pacman", balance: "3.14 PCMN" },
            { projectName: "Tetris", balance: "2.22 TST" },
          ]);
        });

        it("should update balance after using the receive modal", async () => {
          const po = await renderPage();

          const tokensPagePo = await po.getTokensPagePo();

          expect(await tokensPagePo.getRowData("ckBTC")).toEqual({
            projectName: "ckBTC",
            balance: "4.45 ckBTC",
          });

          await tokensPagePo.clickReceiveOnRow("ckBTC");
          const modalPo = po.getCkBTCReceiveModalPo();
          expect(await modalPo.isPresent()).toBe(true);

          ckBTCBalanceE8s += 100_000_000n;
          await modalPo.clickFinish();

          await runResolvedPromises();

          expect(await tokensPagePo.getRowData("ckBTC")).toEqual({
            projectName: "ckBTC",
            balance: "5.45 ckBTC",
          });
        });

        it("should update the ckBTC balance in the background", async () => {
          const completedUtxos = [
            {
              Minted: {
                minted_amount: 10000000n,
                block_index: 12345n,
                utxo: {
                  height: 123,
                  value: 10000000n,
                  outpoint: { txid: [], vout: 12 },
                },
              },
            },
          ];

          let resolveUpdateBalance;
          let rejectUpdateBalance;
          vi.spyOn(ckBTCMinterApi, "updateBalance").mockImplementation(() => {
            return new Promise<UpdateBalanceOk>((resolve, reject) => {
              resolveUpdateBalance = resolve;
              rejectUpdateBalance = reject;
            });
          });
          const po = await renderPage();
          const tokensPagePo = po.getTokensPagePo();
          expect(await tokensPagePo.getRowData("ckBTC")).toEqual({
            projectName: "ckBTC",
            balance: "4.45 ckBTC",
          });

          // Just add some e8s to test that the balance is updated.
          ckBTCBalanceE8s = ckBTCBalanceE8s + 100_000_000n;
          await resolveUpdateBalance(completedUtxos);
          await runResolvedPromises();
          await rejectUpdateBalance(noPendingUtxos);
          await runResolvedPromises();

          expect(await tokensPagePo.getRowData("ckBTC")).toEqual({
            projectName: "ckBTC",
            balance: "5.45 ckBTC",
          });
          // After a successful call, there is another to check whether more pending UTxOs are available.
          expect(ckBTCMinterApi.updateBalance).toBeCalledTimes(2);
        });

        it("users can send SNS tokens", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();

          await tokensPagePo.clickSendOnRow("Tetris");

          expect(await po.getIcrcTokenTransactionModal().isPresent()).toBe(
            true
          );

          expect(icrcLedgerApi.icrcTransfer).not.toBeCalled();

          const toAccount: IcrcAccount = {
            owner: principal(1),
          };
          const amount = 2;

          await po.transferIcrcTokens({
            amount,
            destinationAddress: encodeIcrcAccount(toAccount),
          });

          expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(1);
          expect(icrcLedgerApi.icrcTransfer).toBeCalledWith({
            canisterId: ledgerCanisterIdTetris,
            fee: tetrisToken.fee,
            to: toAccount,
            amount: numberToUlps({ amount, token: tetrisToken }),
            fromSubAccount: undefined,
            identity: mockIdentity,
          });
        });

        it("should update balance after using the ckETH receive modal", async () => {
          const po = await renderPage();

          const tokensPagePo = await po.getTokensPagePo();

          expect(await tokensPagePo.getRowData("ckETH")).toEqual({
            projectName: "ckETH",
            balance: "4.14 ckETH",
          });

          await tokensPagePo.clickReceiveOnRow("ckETH");
          const modalPo = po.getReceiveModalPo();
          expect(await modalPo.isPresent()).toBe(true);

          ckETHBalanceUlps += 1_000_000_000_000_000_000n;
          await modalPo.clickFinish();

          await runResolvedPromises();

          expect(await tokensPagePo.getRowData("ckETH")).toEqual({
            projectName: "ckETH",
            balance: "5.14 ckETH",
          });
        });

        it("should update balance after using the SNS receive modal", async () => {
          const po = await renderPage();

          const tokensPagePo = await po.getTokensPagePo();

          expect(await tokensPagePo.getRowData("Tetris")).toEqual({
            projectName: "Tetris",
            balance: "2.22 TST",
          });

          await tokensPagePo.clickReceiveOnRow("Tetris");
          const modalPo = po.getReceiveModalPo();
          expect(await modalPo.isPresent()).toBe(true);

          tetrisBalanceE8s += 100_000_000n;
          await modalPo.clickFinish();

          await runResolvedPromises();

          expect(await tokensPagePo.getRowData("Tetris")).toEqual({
            projectName: "Tetris",
            balance: "3.22 TST",
          });
        });

        it("users can send ckBTC tokens", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();

          expect(await tokensPagePo.getRowData("ckBTC")).toEqual({
            projectName: "ckBTC",
            balance: "4.45 ckBTC",
          });

          await tokensPagePo.clickSendOnRow("ckBTC");

          expect(await po.getCkBTCTransactionModalPo().isPresent()).toBe(true);

          expect(icrcLedgerApi.icrcTransfer).not.toBeCalled();

          const toAccount: IcrcAccount = {
            owner: principal(1),
          };

          await po.transferCkBTCTokens({
            amount: amountCkBTCTransaction,
            destinationAddress: encodeIcrcAccount(toAccount),
          });

          ckBTCBalanceE8s = ckBTCBalanceE8s - amountCkBTCTransactionUlps;
          await runResolvedPromises();

          expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(1);
          expect(icrcLedgerApi.icrcTransfer).toBeCalledWith({
            canisterId: CKBTC_UNIVERSE_CANISTER_ID,
            fee: mockCkBTCToken.fee,
            to: toAccount,
            amount: amountCkBTCTransactionUlps,
            fromSubAccount: undefined,
            identity: mockIdentity,
          });

          expect(await tokensPagePo.getRowData("ckBTC")).toEqual({
            projectName: "ckBTC",
            balance: "2.45 ckBTC",
          });
          expect(await po.getCkBTCTransactionModalPo().isPresent()).toBe(false);
        });

        it("users can send ckETH tokens", async () => {
          const po = await renderPage();

          const tokensPagePo = po.getTokensPagePo();

          expect(await tokensPagePo.getRowData("ckETH")).toEqual({
            projectName: "ckETH",
            balance: "4.14 ckETH",
          });

          await tokensPagePo.clickSendOnRow("ckETH");

          expect(await po.getIcrcTokenTransactionModal().isPresent()).toBe(
            true
          );

          expect(icrcLedgerApi.icrcTransfer).not.toBeCalled();

          const toAccount: IcrcAccount = {
            owner: principal(1),
          };

          ckETHBalanceUlps -= amountCkETHTransactionUlps;
          await po.transferIcrcTokens({
            amount: amountCkETHTransaction,
            destinationAddress: encodeIcrcAccount(toAccount),
          });

          await runResolvedPromises();

          expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(1);
          expect(icrcLedgerApi.icrcTransfer).toBeCalledWith({
            canisterId: CKETH_UNIVERSE_CANISTER_ID,
            fee: mockCkETHToken.fee,
            to: toAccount,
            amount: amountCkETHTransactionUlps,
            fromSubAccount: undefined,
            identity: mockIdentity,
          });

          expect(await tokensPagePo.getRowData("ckETH")).toEqual({
            projectName: "ckETH",
            balance: "2.14 ckETH",
          });
          expect(await po.getIcrcTokenTransactionModal().isPresent()).toBe(
            false
          );
        });
      });
    });

    describe("table sorting", () => {
      describe("when logged in", () => {
        beforeEach(() => {
          resetIdentity();
          overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
        });

        it("should display tokens in specific order", async () => {
          const po = await renderPage();
          const tokensPagePo = po.getTokensPagePo();
          expect(await tokensPagePo.getTokenNames()).toEqual([
            "Internet Computer",
            "ckBTC",
            "ckETH",
            "ckUSDC",
            "Pacman",
            "Tetris",
          ]);
        });

        describe("taking balance and import tokens into account", () => {
          beforeEach(() => {
            vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockImplementation(
              async ({ canisterId }) => {
                const balancesMap = {
                  [CKBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
                  [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
                  [CKETH_UNIVERSE_CANISTER_ID.toText()]: 0n,
                  [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: ckUSDCBalanceE8s,
                  [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]:
                    ckETHBalanceUlps,
                  [ledgerCanisterIdTetris.toText()]: tetrisBalanceE8s,
                  [ledgerCanisterIdPacman.toText()]: 0n,
                };
                if (isNullish(balancesMap[canisterId.toText()])) {
                  throw new Error(
                    `Account not found for canister ${canisterId.toText()}`
                  );
                }
                return balancesMap[canisterId.toText()];
              }
            );
          });

          it("should display token with balance first", async () => {
            const po = await renderPage();
            const tokensPagePo = po.getTokensPagePo();
            expect(await tokensPagePo.getTokenNames()).toEqual([
              "Internet Computer",
              "ckBTC",
              "ckUSDC",
              "Tetris",
              "ckETH",
              "Pacman",
            ]);
          });
        });

        describe("imported tokens", () => {
          beforeEach(() => {
            // Add 2 imported tokens
            tokensStore.setToken({
              canisterId: importedToken1Id,
              token: importedToken1Metadata,
            });
            tokensStore.setToken({
              canisterId: importedToken2Id,
              token: importedToken2Metadata,
            });
            importedTokensStore.set({
              importedTokens: [importedToken1Data, importedToken2Data],
              certified: true,
            });

            vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockImplementation(
              async ({ canisterId }) => {
                const balancesMap = {
                  [CKBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
                  [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
                  [CKETH_UNIVERSE_CANISTER_ID.toText()]: 0n,
                  [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: ckUSDCBalanceE8s,
                  [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]:
                    ckETHBalanceUlps,
                  [ledgerCanisterIdTetris.toText()]: tetrisBalanceE8s,
                  [ledgerCanisterIdPacman.toText()]: 0n,
                  [importedToken1Id.toText()]: 10n,
                  [importedToken2Id.toText()]: 0n,
                };
                if (isNullish(balancesMap[canisterId.toText()])) {
                  throw new Error(
                    `Account not found for canister ${canisterId.toText()}`
                  );
                }
                return balancesMap[canisterId.toText()];
              }
            );
          });

          it("should display imported tokens after important with balance", async () => {
            const po = await renderPage();
            const tokensPagePo = po.getTokensPagePo();
            expect(await tokensPagePo.getTokenNames()).toEqual([
              "Internet Computer",
              // ck with balance
              "ckBTC",
              "ckUSDC",
              // Imported tokens should be placed with the SNS tokens that have a non-zero balance
              // and should be sorted alphabetically.
              "ATOKEN2", // Imported without balance
              "Tetris", // SNS with balance
              "ZTOKEN1", // Imported with balance
              // Zero balance
              "ckETH",
              "Pacman",
            ]);
          });
        });

        describe("when logged out", () => {
          beforeEach(() => {
            setNoIdentity();
          });

          it("should display token in specific order", async () => {
            const po = await renderPage();
            const tablePo = po.getSignInTokensPagePo().getTokensTablePo();
            expect(await tablePo.getTokenNames()).toEqual([
              "Internet Computer",
              "ckBTC",
              "ckETH",
              "ckUSDC",
              "Pacman",
              "Tetris",
            ]);
          });
        });
      });
    });

    describe("failed imported tokens", () => {
      const failedImportedTokenIdText = "aaaaa-aa";
      const failedImportedTokenId = Principal.fromText(
        failedImportedTokenIdText
      );
      beforeEach(() => {
        resetIdentity();
        overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);

        vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockImplementation(
          async ({ canisterId }) => {
            const balancesMap = {
              [CKBTC_UNIVERSE_CANISTER_ID.toText()]: ckBTCBalanceE8s,
              [CKETH_UNIVERSE_CANISTER_ID.toText()]: 0n,
              [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: ckUSDCBalanceE8s,
              [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: ckETHBalanceUlps,
              [ledgerCanisterIdTetris.toText()]: tetrisBalanceE8s,
              [ledgerCanisterIdPacman.toText()]: 0n,
              [importedToken1Id.toText()]: 10n,
              [importedToken2Id.toText()]: 0n,
              [failedImportedTokenIdText]: 0n,
            };
            if (isNullish(balancesMap[canisterId.toText()])) {
              throw new Error(
                `Account not found for canister ${canisterId.toText()}`
              );
            }
            return balancesMap[canisterId.toText()];
          }
        );

        // Add 3 imported tokens
        importedTokensStore.set({
          importedTokens: [
            importedToken1Data,
            importedToken2Data,
            {
              ledgerCanisterId: failedImportedTokenId,
              indexCanisterId: undefined,
            },
          ],
          certified: true,
        });
        failedImportedTokenLedgerIdsStore.add(failedImportedTokenIdText);
      });

      it("should render failed imported tokens in the table", async () => {
        const po = await renderPage();
        const tokensPagePo = po.getTokensPagePo();
        const tokenNames = await tokensPagePo.getTokenNames();

        expect(tokenNames).toEqual([
          "Internet Computer",
          "ckBTC",
          "ckUSDC",
          "ATOKEN2",
          "Tetris",
          "ZTOKEN1",
          failedImportedTokenIdText, // failed imported token
          "ckETH",
          "Pacman",
        ]);
      });

      it("should render multiple failed imported tokens", async () => {
        failedImportedTokenLedgerIdsStore.add(importedToken2Id.toText());

        const po = await renderPage();
        const tokensPagePo = po.getTokensPagePo();
        const tokenNames = await tokensPagePo.getTokenNames();

        expect(tokenNames).toEqual([
          "Internet Computer",
          "ckBTC",
          "ckUSDC",
          "Tetris",
          "ZTOKEN1",
          failedImportedTokenIdText, // failed
          importedToken2Id.toText(), // failed
          "ckETH",
          "Pacman",
        ]);
      });

      it("should display failed imported token UI", async () => {
        const po = await renderPage();
        const tokensPagePo = po.getTokensPagePo();
        const failedTokenRow = await tokensPagePo
          .getTokensTable()
          .getRowByName(failedImportedTokenIdText);

        expect(
          await failedTokenRow.getFailedLedgerCanisterHashPo().getFullText()
        ).toEqual(failedImportedTokenIdText);
        expect(await failedTokenRow.hasUnavailableBalance()).toEqual(true);
        expect(
          await failedTokenRow.getFailedTokenTooltipPo().getTooltipText()
        ).toEqual(
          "The NNS dapp couldn’t load an imported token. Please try again later, or contact the developers."
        );
      });

      it("should not display failed token UI for not failed tokens", async () => {
        const po = await renderPage();
        const tokensPagePo = po.getTokensPagePo();
        const rowsPos = await tokensPagePo.getTokensTable().getRows();

        const checkForFailedUI = async (rowPo: TokensTableRowPo) => {
          expect(
            await rowPo.getFailedLedgerCanisterHashPo().isPresent()
          ).toEqual(false);
          expect(await rowPo.hasUnavailableBalance()).toEqual(false);
          expect(await rowPo.getFailedTokenTooltipPo().isPresent()).toEqual(
            false
          );
        };

        for (const rowPo of rowsPos) {
          if ((await rowPo.getProjectName()) !== failedImportedTokenIdText) {
            await checkForFailedUI(rowPo);
          }
        }
      });

      it("should not display failed token actions for not failed tokens", async () => {
        const po = await renderPage();
        const tokensPagePo = po.getTokensPagePo();
        const ckBTCTokenRow = await tokensPagePo
          .getTokensTable()
          .getRowByName("ckBTC");
        const notFailedTokenRow = await tokensPagePo
          .getTokensTable()
          .getRowByName("ZTOKEN1");

        expect(
          await ckBTCTokenRow.getGoToDashboardButton().isPresent()
        ).toEqual(false);
        expect(await ckBTCTokenRow.getRemoveActionButton().isPresent()).toEqual(
          false
        );
        expect(
          await notFailedTokenRow.getGoToDashboardButton().isPresent()
        ).toEqual(false);
        expect(
          await notFailedTokenRow.getRemoveActionButton().isPresent()
        ).toEqual(false);
      });

      it("should have view on dashboard action button", async () => {
        const po = await renderPage();
        const tokensPagePo = po.getTokensPagePo();
        const failedTokenRow = await tokensPagePo
          .getTokensTable()
          .getRowByName(failedImportedTokenIdText);

        expect(
          await failedTokenRow.getGoToDashboardButton().isPresent()
        ).toEqual(true);
        expect(await failedTokenRow.getGoToDashboardButton().getHref()).toEqual(
          `https://dashboard.internetcomputer.org/canister/${failedImportedTokenIdText}`
        );
      });

      it("provides possibility to remove failed imported token", async () => {
        vi.spyOn(importedTokensApi, "setImportedTokens").mockResolvedValue();
        vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
          imported_tokens: [
            {
              ledger_canister_id: importedToken1Id,
              index_canister_id: [],
            },
            {
              ledger_canister_id: importedToken2Id,
              index_canister_id: [],
            },
          ],
        });
        const po = await renderPage();
        const removeConfirmationPo = po.getImportTokenRemoveConfirmationPo();
        const tokensPagePo = po.getTokensPagePo();
        const failedTokenRow = await tokensPagePo
          .getTokensTable()
          .getRowByName(failedImportedTokenIdText);

        expect(await po.getTokensPagePo().getTokenNames()).toEqual([
          "Internet Computer",
          "ckBTC",
          "ckUSDC",
          "ATOKEN2",
          "Tetris",
          "ZTOKEN1",
          "aaaaa-aa", // failedTokenRow
          "ckETH",
          "Pacman",
        ]);

        // Initiating the removal.
        await failedTokenRow.getRemoveActionButton().click();
        await runResolvedPromises();

        // Confirm the removal.
        expect(await removeConfirmationPo.isPresent()).toBe(true);
        expect(get(importedTokensStore).importedTokens).toEqual([
          importedToken1Data,
          importedToken2Data,
          {
            ledgerCanisterId: failedImportedTokenId,
            indexCanisterId: undefined,
          },
        ]);
        expect(get(failedImportedTokenLedgerIdsStore)).toEqual([
          failedImportedTokenId.toText(),
        ]);

        await removeConfirmationPo.clickYes();
        await removeConfirmationPo.waitForClosed();
        await runResolvedPromises();

        expect(get(importedTokensStore).importedTokens).toEqual([
          importedToken1Data,
          importedToken2Data,
        ]);
        expect(get(failedImportedTokenLedgerIdsStore)).toEqual([]);
        expect(await po.getTokensPagePo().getTokenNames()).toEqual([
          "Internet Computer",
          "ckBTC",
          "ckUSDC",
          "ATOKEN2",
          "Tetris",
          "ZTOKEN1",
          "ckETH",
          "Pacman",
        ]);
      });

      it("should not reload balances after an imported token becomes failed", async () => {
        const po = await renderPage();
        const rows = await po.getTokensPagePo().getTokensTable().getRows();
        const notFailedTokenCount = 8;
        expect(
          (
            await Promise.all(
              rows.map(
                async (row) =>
                  !(await row.getFailedTokenTooltipPo().isPresent())
              )
            )
          ).filter(Boolean).length
        ).toEqual(notFailedTokenCount);

        await runResolvedPromises();
        expect(icrcLedgerApi.queryIcrcBalance).toBeCalledTimes(
          notFailedTokenCount
        );

        // Add a failed token
        expect(
          get(failedImportedTokenLedgerIdsStore).includes(
            importedToken2Id.toText()
          )
        ).toEqual(false);
        failedImportedTokenLedgerIdsStore.add(importedToken2Id.toText());

        await runResolvedPromises();
        expect(icrcLedgerApi.queryIcrcBalance).toBeCalledTimes(
          notFailedTokenCount
        );
      });
    });

    describe("when logged out", () => {
      beforeEach(() => {
        setNoIdentity();
      });

      it("should render sign-in if not logged in", async () => {
        const po = await renderPage();

        expect(await po.hasLoginPage()).toBe(true);
        expect(await po.hasTokensPage()).toBe(false);
      });

      it("renders 'Projects' as tokens table first column", async () => {
        const po = await renderPage();

        const tablePo = po.getSignInTokensPagePo().getTokensTablePo();
        expect(await tablePo.getFirstColumnHeader()).toEqual("Projects");
      });

      describe("when ckBTC is enabled", () => {
        beforeEach(() => {
          overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
        });

        it("should render ICP and SNS tokens", async () => {
          const po = await renderPage();

          const signInPo = po.getSignInTokensPagePo();
          expect(await signInPo.getTokenNames()).toEqual([
            "Internet Computer",
            "ckBTC",
            "ckETH",
            "ckUSDC",
            "Pacman",
            "Tetris",
          ]);
        });
      });

      it("should render an anchor tag with href", async () => {
        const po = await renderPage();

        const tablePo = po.getSignInTokensPagePo().getTokensTablePo();

        const icpRow = await tablePo.getRowByName("Internet Computer");
        expect(await icpRow.getHref()).toEqual(
          `/accounts/?u=${OWN_CANISTER_ID_TEXT}`
        );

        const snsRow = await tablePo.getRowByName("Tetris");
        expect(await snsRow.getHref()).toEqual(
          `/wallet/?u=${rootCanisterIdTetris.toText()}`
        );

        const ckEthRow = await tablePo.getRowByName("ckETH");
        expect(await ckEthRow.getHref()).toEqual(
          `/wallet/?u=${CKETH_UNIVERSE_CANISTER_ID.toText()}`
        );
      });
    });
  });
});
