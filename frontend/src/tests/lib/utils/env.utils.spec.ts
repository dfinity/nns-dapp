/**
 * @jest-environment jsdom
 */

import { isNnsAlternativeOrigin } from "$lib/utils/env.utils";

describe("env-utils", () => {
  let location;

  beforeAll(() => {
    location = window.location;
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...location },
    });
  });

  it("should be an alternative origin", () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...location,
        origin: `https://nns.internetcomputer.org`,
      },
    });

    expect(isNnsAlternativeOrigin()).toBeTruthy();
  });

  it("should not be an alternative origin", () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...location,
        origin: `https://nns.ic0.app`,
      },
    });

    expect(isNnsAlternativeOrigin()).toBeFalsy();

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...location,
        origin: `https://ic0.app`,
      },
    });

    expect(isNnsAlternativeOrigin()).toBeFalsy();

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...location,
        origin: `https://test.com`,
      },
    });

    expect(isNnsAlternativeOrigin()).toBeFalsy();

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...location,
        origin: `https://internetcomputer.org`,
      },
    });

    expect(isNnsAlternativeOrigin()).toBeFalsy();

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...location,
        origin: `https://ii.internetcomputer.org`,
      },
    });

    expect(isNnsAlternativeOrigin()).toBeFalsy();
  });
});
