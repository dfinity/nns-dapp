/**
 * @jest-environment jsdom
 */

import { sanitize } from "../../../lib/utils/security.utils";

describe("security.utils", () => {
  describe("sanitize", () => {
    beforeAll(() => {
      jest.mock(
        "/assets/assets/libs/purify.min.js",
        () => ({
          sanitize: (value: string) => value + "-pong",
        }),
        { virtual: true }
      );
    });

    it("should call DOMPurify.sanitize", async () => {
      expect((await sanitize())("ping")).toBe("ping-pong");
    });
  });
});
