/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";
import { page } from "$mocks/$app/stores";
import en from "$tests/mocks/i18n.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { get } from "svelte/store";

describe("title token selector derived store", () => {
  it("should return select token text if path is not related to neurons", () => {
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Accounts,
    });
    const $store1 = get(titleTokenSelectorStore);
    expect($store1).toEqual(en.universe.select_token);

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Wallet,
    });
    const $store2 = get(titleTokenSelectorStore);
    expect($store2).toEqual(en.universe.select_token);

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Proposals,
    });
    const $store3 = get(titleTokenSelectorStore);
    expect($store3).toEqual(en.universe.select_nervous_system);
  });

  it("should return select nervous system text if path is related to neurons", () => {
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neuron,
    });
    const $store1 = get(titleTokenSelectorStore);
    expect($store1).toEqual(en.universe.select_nervous_system);

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });
    const $store2 = get(titleTokenSelectorStore);
    expect($store2).toEqual(en.universe.select_nervous_system);
  });

  it("should change depending on page", () => {
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Accounts,
    });
    const $store1 = get(titleTokenSelectorStore);
    expect($store1).toEqual(en.universe.select_token);

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });
    const $store2 = get(titleTokenSelectorStore);
    expect($store2).toEqual(en.universe.select_nervous_system);

    page.mock({
      data: {
        universe: rootCanisterIdMock.toText(),
      },
      routeId: AppPath.Wallet,
    });
    const $store3 = get(titleTokenSelectorStore);
    expect($store3).toEqual(en.universe.select_token);
  });
});
