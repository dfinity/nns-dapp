import { secondsToDuration } from "../../../lib/utils/date.utils";
import en from "../../mocks/i18n.mock";

describe("secondsToDuration", () => {
  it("should give year details", () => {
    const MORE_THAN_ONE_YEAR = BigInt(60 * 60 * 24 * 365 * 1.5);
    expect(secondsToDuration(MORE_THAN_ONE_YEAR)).toContain(en.time.year);
  });

  it("should give day details", () => {
    const MORE_THAN_ONE_DAY = BigInt(60 * 60 * 24 * 4);
    expect(secondsToDuration(MORE_THAN_ONE_DAY)).toContain(en.time.day);
  });

  it("should give hour details", () => {
    const MORE_THAN_ONE_HOUR = BigInt(60 * 60 * 4);
    expect(secondsToDuration(MORE_THAN_ONE_HOUR)).toContain(en.time.hour);
  });

  it("should give minute details", () => {
    const MORE_THAN_ONE_MINUTE = BigInt(60 * 4);
    expect(secondsToDuration(MORE_THAN_ONE_MINUTE)).toContain(en.time.minute);
  });
});
