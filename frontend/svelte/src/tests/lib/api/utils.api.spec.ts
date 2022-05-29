import { toSubAccountId } from "../../../lib/api/utils.api";

describe("toSubAccountId", () => {
  it("should successfully transform subaccount to ids", () => {
    expect(toSubAccountId([0, 0, 0, 0, 1])).toBe(1);
    expect(toSubAccountId([0, 0, 3, 0, 1])).toBe(196609);
    expect(toSubAccountId([4, 0, 0, 0, 1])).toBe(1);
    expect(toSubAccountId([0, 4, 0, 0, 1])).toBe(67108865);
  });
});
