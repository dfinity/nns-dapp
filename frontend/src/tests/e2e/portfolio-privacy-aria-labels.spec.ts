/**
 * The "Hide Balance" option must keep the amounts out of the accessibility
 * tree, and it must still leave every cell with a usable accessible name.
 *
 * The Portfolio cards mask the amounts on screen with PrivacyAwareAmount.
 * PrivacyAwareAmount masks the element content only. An aria-label on the same
 * element replaces that content as the accessible name, so the label must
 * follow the same store as the visible value.
 *
 * This test drives the real application and reads the accessible names in both
 * states.
 */
import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

// A Playwright spec cannot import $lib/i18n/en.json, because ESM asks for an
// import attribute of type json. The expected strings are copied here.
const HELD_ICP_CARD_TITLE = "ICP Balance";
const STAKED_ICP_CARD_TITLE = "ICP Staking Balance";
const HIDDEN_BALANCE_LABEL = "hidden";

const DIGIT = /\d/;

// playwright.config.ts sets expect.timeout to 0, so every poll needs its own
// timeout. Without one a failing poll hangs until the 300 s test timeout.
const POLL = { timeout: 30_000 };

test("Privacy mode keeps the balances out of the Portfolio accessible names", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Portfolio | Network Nervous System");

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Sign in");
  await signInWithNewUser({ page, context: browser.contexts()[0] });

  step("Get some ICP");
  await appPo.getIcpTokens(20);

  step("Stake a neuron, so the staked tokens card has a row");
  await appPo.goToStaking();
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: 10, dissolveDelayDays: "max" });
  await appPo.getNeuronsPo().waitFor();

  step("Open the Portfolio page");
  await page.goto("/");
  const portfolioPagePo = appPo.getPortfolioPo().getPortfolioPagePo();
  const heldCardPo = portfolioPagePo.getHeldICPCardPo();
  const stakedCardPo = portfolioPagePo.getStakedICPCardPo();
  await heldCardPo.waitFor();
  await stakedCardPo.waitFor();

  // Every accessible name that carries a balance on the Portfolio page.
  const getBalanceAriaLabels = async (): Promise<(string | null)[]> => [
    ...(await heldCardPo.getHeldTokensBalanceInUsdAriaLabels()),
    await heldCardPo.getAmountAriaLabel(),
    ...(await stakedCardPo.getStakedTokensStakeInUsdAriaLabels()),
    ...(await stakedCardPo.getStakedTokensStakeInNativeCurrencyAriaLabels()),
    await stakedCardPo.getAmountAriaLabel(),
  ];

  // Every attribute inside the two cards that a screen reader can use as an
  // accessible name.
  const getAllAccessibleNamesInCards = (): Promise<string[]> =>
    page
      .locator(
        [
          '[data-tid="held-icp-card"] [aria-label]',
          '[data-tid="held-icp-card"] [title]',
          '[data-tid="held-icp-card"] [alt]',
          '[data-tid="staked-icp-card"] [aria-label]',
          '[data-tid="staked-icp-card"] [title]',
          '[data-tid="staked-icp-card"] [alt]',
        ].join(", ")
      )
      .evaluateAll((elements) =>
        elements.flatMap((element) =>
          ["aria-label", "title", "alt"]
            .map((attribute) => element.getAttribute(attribute))
            .filter((value): value is string => value !== null)
        )
      );

  const toggleBalancePrivacy = async () => {
    // The Popover backdrop closes on click or on Enter/Space, not Escape
    // (gix-components handleKeyPress only handles those two keys). The
    // backdrop covers the whole screen, including the account-menu button
    // itself, so a click on "backdrop" is the reliable way to close it.
    const accountMenuPo = appPo.getAccountMenuPo();
    await accountMenuPo.openMenu();
    await accountMenuPo.getToggleBalancePrivacyOptionPo().click();
    await accountMenuPo.click("backdrop");
    await expect.poll(() => accountMenuPo.isOpen(), POLL).toBe(false);
  };

  step("Privacy mode off: every accessible name carries its amount");
  await expect
    .poll(getBalanceAriaLabels, POLL)
    .toEqual([
      expect.stringMatching(/^Internet Computer USD: \d/),
      expect.stringMatching(new RegExp(`^${HELD_ICP_CARD_TITLE}: \\d`)),
      expect.stringMatching(/^Internet Computer USD: \d/),
      expect.stringMatching(/^Internet Computer ICP: \d/),
      expect.stringMatching(new RegExp(`^${STAKED_ICP_CARD_TITLE}: \\d`)),
    ]);

  step("Turn privacy mode on");
  await toggleBalancePrivacy();

  step("Privacy mode on: the amounts are masked on screen");
  await expect.poll(() => heldCardPo.getAmount(), POLL).toContain("•");
  await expect.poll(() => stakedCardPo.getAmount(), POLL).toContain("•");

  step("Privacy mode on: no accessible name carries an amount");
  // Each name still says which token and which unit the cell holds, so a
  // screen reader user can still tell the cells apart.
  await expect
    .poll(getBalanceAriaLabels, POLL)
    .toEqual([
      `Internet Computer USD: ${HIDDEN_BALANCE_LABEL}`,
      `${HELD_ICP_CARD_TITLE}: ${HIDDEN_BALANCE_LABEL}`,
      `Internet Computer USD: ${HIDDEN_BALANCE_LABEL}`,
      `Internet Computer ICP: ${HIDDEN_BALANCE_LABEL}`,
      `${STAKED_ICP_CARD_TITLE}: ${HIDDEN_BALANCE_LABEL}`,
    ]);

  step("Privacy mode on: no attribute in either card holds a digit");
  const namesWithADigit = (await getAllAccessibleNamesInCards()).filter(
    (name) => DIGIT.test(name)
  );
  expect(namesWithADigit).toEqual([]);

  step("Turn privacy mode off again: the amounts come back");
  await toggleBalancePrivacy();
  await expect
    .poll(getBalanceAriaLabels, POLL)
    .toEqual([
      expect.stringMatching(/^Internet Computer USD: \d/),
      expect.stringMatching(new RegExp(`^${HELD_ICP_CARD_TITLE}: \\d`)),
      expect.stringMatching(/^Internet Computer USD: \d/),
      expect.stringMatching(/^Internet Computer ICP: \d/),
      expect.stringMatching(new RegExp(`^${STAKED_ICP_CARD_TITLE}: \\d`)),
    ]);
});
