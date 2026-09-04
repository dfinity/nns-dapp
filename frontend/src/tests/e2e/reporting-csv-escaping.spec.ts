import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { ReportingTransactionsPo } from "$tests/page-objects/ReportingTransactions.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";
import { readFileSync } from "fs";

// A spreadsheet reads a cell that starts with one of these characters as a
// formula. The CSV export must break the formula with a single quote.
const FORMULA_CHARACTERS = ["=", "+", "-", "@", "|", "\t", "\r", "\n"];

// The account name is the shortest path from the user interface to a CSV cell.
// The canister limits the name to 24 bytes, so this payload is 22 characters.
const PAYLOAD_ACCOUNT_NAME = "-2+3+cmd|' /C calc'!A0";

// A plain signed number. A spreadsheet reads it as a number, so the export
// leaves it as it is.
const SIGNED_NUMBER = /^[+-]\d[\d'.]*$/;

// The wrapper that the export uses for a neuron id.
const EXCEL_STRING_FORMULA = /^="\d+"$/;

/**
 * Splits CSV text into rows of unquoted cells, as a spreadsheet does.
 */
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index++) {
    const character = text[index];

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (character !== "\r") {
      cell += character;
    }
  }

  row.push(cell);
  rows.push(row);

  return rows;
};

test("Test the CSV export escapes formula characters", async ({
  page,
  context,
}) => {
  await page.goto("/accounts");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const accountsPo = appPo.getAccountsPo();
  const nnsAccountsPo = accountsPo.getNnsAccountsPo();
  const tokensTablePo = nnsAccountsPo.getTokensTablePo();

  step("Wait for the main account");

  const mainAccountRow = await tokensTablePo.getRowByName("Main");
  await mainAccountRow.waitFor();

  step("Create a linked account whose name is a spreadsheet formula");

  await nnsAccountsPo.clickAddAccount();

  const addAccountModalPo = accountsPo.getAddAccountModalPo();
  expect(await addAccountModalPo.isPresent()).toBe(true);

  await addAccountModalPo.addAccount(PAYLOAD_ACCOUNT_NAME);
  await addAccountModalPo.waitForClosed();

  const payloadRow = await tokensTablePo.getRowByName(PAYLOAD_ACCOUNT_NAME);
  await payloadRow.waitFor();

  step("Get ICP so that the export holds a signed amount");

  // The accounts page has no menu button.
  await appPo.goBack();
  await appPo.getIcpTokens(20);

  step("Export the transactions to CSV");

  await page.goto("/reporting");

  const reportingTransactionsPo = ReportingTransactionsPo.under(pageElement);
  await reportingTransactionsPo.waitFor();

  const exportButtonPo =
    reportingTransactionsPo.getReportingTransactionsButtonPo();
  await exportButtonPo.waitFor();

  const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
  await exportButtonPo.click();
  const download = await downloadPromise;

  const downloadPath = await download.path();
  if (downloadPath === null) {
    throw new Error("The download produced no local file path.");
  }
  const csvText = readFileSync(downloadPath, "utf-8");
  const cells = parseCsv(csvText).flat();

  step("Check that the export escapes every formula cell");

  // The account name reaches the CSV with a single quote in front of it.
  expect(cells).toContain(`'${PAYLOAD_ACCOUNT_NAME}`);
  expect(cells).not.toContain(PAYLOAD_ACCOUNT_NAME);

  // No cell starts with a formula character, unless it is a plain signed
  // number or the neuron id wrapper.
  const unescaped = cells.filter(
    (cell) =>
      FORMULA_CHARACTERS.includes(cell[0]) &&
      !SIGNED_NUMBER.test(cell) &&
      !EXCEL_STRING_FORMULA.test(cell)
  );
  expect(unescaped).toEqual([]);

  step("Check that the amount column keeps its sign and no quote");

  // The export holds the credit of 20 ICP, with its sign and no quote.
  const amounts = cells.filter((cell) => SIGNED_NUMBER.test(cell));
  expect(amounts.length).toBeGreaterThan(0);
  expect(amounts.some((amount) => /^\+20(\.0+)?$/.test(amount))).toBe(true);

  // No amount cell carries the quote prefix.
  expect(cells.filter((cell) => /^'[+-]\d/.test(cell))).toEqual([]);
});
