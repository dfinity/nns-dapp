import type { Identity } from "@dfinity/agent";
import { get } from "svelte/store";
import * as api from "../api/governance.api";
import { i18n } from "../stores/i18n";
import { knownNeuronsStore } from "../stores/knownNeurons.store";

export const listKnownNeurons = async ({
  identity,
}: {
  identity: Identity | undefined | null;
}) => {
  if (!identity) {
    // TODO: https://dfinity.atlassian.net/browse/L2-346
    throw new Error(get(i18n).error.missing_identity);
  }

  // Use updateAndQuery helper
  const knownNeuronsQuery = await api.queryKnownNeurons({
    identity,
    certified: false,
  });

  knownNeuronsStore.setNeurons(knownNeuronsQuery);

  const knowNeuronsUpdate = await api.queryKnownNeurons({
    identity,
    certified: true,
  });

  knownNeuronsStore.setNeurons(knowNeuronsUpdate);
};
