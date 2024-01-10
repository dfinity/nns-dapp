import { ckbtcPendingUtxosStore } from "$lib/stores/ckbtc-pending-utxos.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("ckBTC pending UTXOs store", () => {
  beforeEach(() => {
    ckbtcPendingUtxosStore.reset();
  });

  const ckbtcUniverseId = principal(0);
  const cktestbtcUniverseId = principal(1);

  const pendingUtxo1 = {
    outpoint: { txid: new Uint8Array([5, 7, 4]), vout: 0 },
    value: 13_000_000n,
    confirmations: 10,
  };

  const pendingUtxo2 = {
    outpoint: { txid: new Uint8Array([7, 4, 1, 1]), vout: 1 },
    value: 3_700_000n,
    confirmations: 1,
  };

  it("should store a pending UTXO", () => {
    ckbtcPendingUtxosStore.setUtxos({
      universeId: ckbtcUniverseId,
      utxos: [pendingUtxo1],
    });

    const store = get(ckbtcPendingUtxosStore);
    expect(store[ckbtcUniverseId.toText()]).toEqual([pendingUtxo1]);
  });

  it("should override existing values", () => {
    ckbtcPendingUtxosStore.setUtxos({
      universeId: ckbtcUniverseId,
      utxos: [pendingUtxo1],
    });

    ckbtcPendingUtxosStore.setUtxos({
      universeId: ckbtcUniverseId,
      utxos: [pendingUtxo2],
    });

    const store = get(ckbtcPendingUtxosStore);
    expect(store[ckbtcUniverseId.toText()]).toEqual([pendingUtxo2]);
  });

  it("should store a different pending UTXOs in different universes", () => {
    ckbtcPendingUtxosStore.setUtxos({
      universeId: ckbtcUniverseId,
      utxos: [pendingUtxo1],
    });
    ckbtcPendingUtxosStore.setUtxos({
      universeId: cktestbtcUniverseId,
      utxos: [pendingUtxo2],
    });

    const store = get(ckbtcPendingUtxosStore);
    expect(store[ckbtcUniverseId.toText()]).toEqual([pendingUtxo1]);
    expect(store[cktestbtcUniverseId.toText()]).toEqual([pendingUtxo2]);
  });

  it("should sort pending UTXOs by confirmations", () => {
    ckbtcPendingUtxosStore.setUtxos({
      universeId: ckbtcUniverseId,
      utxos: [pendingUtxo1, pendingUtxo2],
    });

    const store = get(ckbtcPendingUtxosStore);
    expect(store[ckbtcUniverseId.toText()]).toEqual([
      pendingUtxo2,
      pendingUtxo1,
    ]);
  });

  it("should not change the input parameter", () => {
    const originalInputArray = [pendingUtxo1, pendingUtxo2];
    const inputArray = [...originalInputArray];

    ckbtcPendingUtxosStore.setUtxos({
      universeId: ckbtcUniverseId,
      utxos: inputArray,
    });

    expect(inputArray).toEqual(originalInputArray);
  });
});
