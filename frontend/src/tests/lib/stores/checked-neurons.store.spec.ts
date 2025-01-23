import { checkedNeuronSubaccountsStore } from "$lib/stores/checked-neurons.store";
import { get } from "svelte/store";

describe("checked-neurons.store", () => {
  describe("checkedNeuronSubaccountsStore", () => {
    it("should initially be empty", () => {
      expect(get(checkedNeuronSubaccountsStore)).toEqual({});
    });

    it("should add a subaccount", () => {
      expect(get(checkedNeuronSubaccountsStore)).toEqual({});
      const universeId = "abc-efg-cai";
      const subaccountHex = "12ab90";
      checkedNeuronSubaccountsStore.addSubaccount({
        universeId,
        subaccountHex,
      });
      expect(get(checkedNeuronSubaccountsStore)).toEqual({
        [universeId]: {
          [subaccountHex]: true,
        },
      });
    });

    it("should return whether a subaccount was added", () => {
      const universeId = "abc-efg-cai";
      const subaccountHex = "12ab90";
      expect(
        checkedNeuronSubaccountsStore.addSubaccount({
          universeId,
          subaccountHex,
        })
      ).toBe(true);
      expect(
        checkedNeuronSubaccountsStore.addSubaccount({
          universeId,
          subaccountHex,
        })
      ).toBe(false);
      expect(
        checkedNeuronSubaccountsStore.addSubaccount({
          universeId,
          subaccountHex,
        })
      ).toBe(false);
    });
  });
});
