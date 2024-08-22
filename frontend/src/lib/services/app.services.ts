import { loadActionableProposals } from "$lib/services/actionable-proposals.services";
import { loadActionableSnsProposals } from "$lib/services/actionable-sns-proposals.services";
import { loadImportedTokens } from "$lib/services/imported-tokens.services";
import { ENABLE_IMPORT_TOKEN } from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";
import { loadSnsProjects } from "./$public/sns.services";
import { initAccounts } from "./icp-accounts.services";

export const initAppPrivateData = async (): Promise<void> => {
  const initNns: Promise<void>[] = [initAccounts()];
  // Reload the SNS projects even if they were loaded.
  // Get latest data and create wrapper caches for the logged in identity.
  const initSns: Promise<void>[] = [loadSnsProjects()];

  // TODO: load imported tokens after Nns.
  /**
   * If Nns load but Sns load fails it is "fine" to go on because Nns are core features.
   */
  await Promise.allSettled([
    Promise.all(initNns).then(() =>
      // When you log in with a new account for the first time, the account is created in the NNS dapp.
      // If you request imported tokens before the account is created, an `AccountNotFound` error will be thrown.
      // To avoid this, the imported tokens should only be requested after the NNS accounts have been initialized.
      Promise.all(get(ENABLE_IMPORT_TOKEN) ? [loadImportedTokens()] : [])
    ),
    Promise.all(initSns),
  ]);

  // Load the actionable proposals only after the Nns and Sns projects have been loaded.
  // Because it's a non-critical enhancement, the loading of actionable proposals should not delay the execution of this function.
  loadActionableProposals();
  loadActionableSnsProposals();
};
