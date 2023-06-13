/**
 * @jest-environment jsdom
 */

import * as api from "$lib/api/ckbtc-minter.api";
import CkBTCInfoLoader from "$lib/components/accounts/CkBTCInfoLoader.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { authStore } from "$lib/stores/auth.store";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import { render, waitFor } from "@testing-library/svelte";
import {OWN_CANISTER_ID_TEXT} from "$lib/constants/canister-ids.constants";

describe("CkBTCInfoLoader", () => {
  let spy;

  beforeEach(() => {
    jest.resetAllMocks();

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    spy = jest
      .spyOn(api, "minterInfo")
      .mockImplementation(() => Promise.resolve(mockCkBTCMinterInfo));
  });

  describe("info not loaded", () => {
    beforeEach(() => {
      ckBTCInfoStore.reset();
    });

    describe("ckbtc universe", () => {
      beforeEach(() => {
        page.mock({
          data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
          routeId: AppPath.Wallet,
        });
      });

      it("should call api to load ckBTC info", async () => {
        render(CkBTCInfoLoader);

        await waitFor(() => expect(spy).toBeCalled());
      });
    });

    describe("not ckbtc universe", () => {
      beforeEach(() => {
        page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      });

      it("should call api to load ckBTC info", async () => {
        render(CkBTCInfoLoader);

        expect(spy).not.toBeCalled();
      });
    });
  });

  describe("info loaded", () => {
    beforeEach(() => {
      ckBTCInfoStore.setInfo({
        info: mockCkBTCMinterInfo,
        certified: true,
        canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    it("should not call api to load ckBTC info", () => {
      render(CkBTCInfoLoader);

      expect(spy).not.toBeCalled();
    });
  });
});
