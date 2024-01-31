import { ckbtcRetrieveBtcStatusesStore } from "$lib/stores/ckbtc-retrieve-btc-statuses.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("ckBTC retrieve BTC statuses store", () => {
  beforeEach(() => {
    ckbtcRetrieveBtcStatusesStore.reset();
  });

  const ckbtcUniverseId = principal(0);
  const cktestbtcUniverseId = principal(1);

  const status1 = {
    id: 673n,
    status: {
      Pending: null,
    },
  };

  const status2 = {
    id: 677n,
    status: {
      Confirmed: { txid: new Uint8Array([7, 6, 7, 8]) },
    },
  };

  it("should store a status", () => {
    ckbtcRetrieveBtcStatusesStore.setForUniverse({
      universeId: ckbtcUniverseId,
      statuses: [status1],
    });

    const store = get(ckbtcRetrieveBtcStatusesStore);
    expect(store[ckbtcUniverseId.toText()]).toEqual([status1]);
  });

  it("should override existing values", () => {
    ckbtcRetrieveBtcStatusesStore.setForUniverse({
      universeId: ckbtcUniverseId,
      statuses: [status1],
    });

    ckbtcRetrieveBtcStatusesStore.setForUniverse({
      universeId: ckbtcUniverseId,
      statuses: [status2],
    });

    const store = get(ckbtcRetrieveBtcStatusesStore);
    expect(store[ckbtcUniverseId.toText()]).toEqual([status2]);
  });

  it("should store different statuses in different universes", () => {
    ckbtcRetrieveBtcStatusesStore.setForUniverse({
      universeId: ckbtcUniverseId,
      statuses: [status1],
    });
    ckbtcRetrieveBtcStatusesStore.setForUniverse({
      universeId: cktestbtcUniverseId,
      statuses: [status2],
    });

    const store = get(ckbtcRetrieveBtcStatusesStore);
    expect(store[ckbtcUniverseId.toText()]).toEqual([status1]);
    expect(store[cktestbtcUniverseId.toText()]).toEqual([status2]);
  });
});
