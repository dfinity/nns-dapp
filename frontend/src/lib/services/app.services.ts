import { loadActionableProposals } from "$lib/services/actionable-proposals.services";
import { loadActionableSnsProposals } from "$lib/services/actionable-sns-proposals.services";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { get } from "svelte/store";
import { loadSnsProjects } from "./$public/sns.services";
import { initAccounts } from "./icp-accounts.services";

export const initAppPrivateData = async (): Promise<void> => {
  const initNns: Promise<void>[] = [initAccounts()];
  const initImportedTokens: Promise<void>[] = [loadSnsProjects()];
  // Reload the SNS projects even if they were loaded.
  // Get latest data and create wrapper caches for the logged in identity.
  const initSns: Promise<void>[] = [loadSnsProjects()];

  // TODO: load imported tokens after Nns.

  /**
   * If Nns load but ImportedTokens or Sns load fails it is "fine" to go on because Nns are core features.
   */
  await Promise.allSettled([
    Promise.all(initNns),
    Promise.all(initImportedTokens),
    Promise.all(initSns),
  ]);

  console.log("App private data initialized.", get(importedTokensStore));

  // Load the actionable proposals only after the Nns and Sns projects have been loaded.
  // Because it's a non-critical enhancement, the loading of actionable proposals should not delay the execution of this function.
  loadActionableProposals();
  loadActionableSnsProposals();
};
