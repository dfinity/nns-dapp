import { heightTransition } from "$lib/utils/transition.utils";

describe("transition.utils", () => {
  const element = {
    offsetHeight: 50,
  } as HTMLElement;

  describe("heightTransition", () => {
    it("should pass delay and duration unchanged", () => {
      expect(
        heightTransition(element, {
          delay: 100,
          duration: 200,
        })
      ).toMatchObject({
        delay: 100,
        duration: 200,
      });

      expect(
        heightTransition(element, {
          duration: 400,
        })
      ).toMatchObject({
        delay: undefined,
        duration: 400,
      });

      expect(heightTransition(element, {})).toMatchObject({
        delay: undefined,
        duration: undefined,
      });

      // Expecting undefined does actually fail if the property is not undefined
      expect(() => {
        expect(
          heightTransition(element, {
            delay: 100,
            duration: 200,
          })
        ).toMatchObject({
          delay: undefined,
          duration: undefined,
        });
      }).toThrow();
    });

    it("should return css function", () => {
      const { css } = heightTransition(element, {});
      expect(css(0)).toBe(
        "height: 0px; transform: scale(1, 0); transform-origin: top"
      );
      expect(css(0.2)).toBe(
        "height: 10px; transform: scale(1, 0.2); transform-origin: top"
      );
      expect(css(0.5)).toBe(
        "height: 25px; transform: scale(1, 0.5); transform-origin: top"
      );
      expect(css(1)).toBe(
        "height: 50px; transform: scale(1, 1); transform-origin: top"
      );
    });
  });
});
