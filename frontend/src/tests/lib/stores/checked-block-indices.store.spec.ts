import { checkedAttachCanisterBlockIndicesStore } from "$lib/stores/checked-block-indices.store";
import { get } from "svelte/store";

describe("checked-block-indices.store", () => {
  describe("checkedAttachCanisterBlockIndicesStore", () => {
    it("should initially be empty", () => {
      expect(get(checkedAttachCanisterBlockIndicesStore)).toEqual({});
    });

    it("should add a block index", () => {
      expect(get(checkedAttachCanisterBlockIndicesStore)).toEqual({});
      const blockIndex = 1234567890n;
      checkedAttachCanisterBlockIndicesStore.addBlockIndex(blockIndex);
      expect(get(checkedAttachCanisterBlockIndicesStore)).toEqual({
        [blockIndex.toString()]: true,
      });
    });

    it("should return whether a block index was added", () => {
      const blockIndex = 1234567890n;
      expect(
        checkedAttachCanisterBlockIndicesStore.addBlockIndex(blockIndex)
      ).toBe(true);
      expect(
        checkedAttachCanisterBlockIndicesStore.addBlockIndex(blockIndex)
      ).toBe(false);
      expect(
        checkedAttachCanisterBlockIndicesStore.addBlockIndex(blockIndex)
      ).toBe(false);
    });
  });
});
