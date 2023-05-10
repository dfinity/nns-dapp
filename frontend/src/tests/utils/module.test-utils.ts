/**
 * Tool to block all non-mocked calls to a module during a test.
 * Useful to make sure you are aware of all calls made to a certain module and
 * to make sure each one is mocked in the test.
 */

/**
 * Mock out all functions on a given module with, either a given
 * implementation or, if not specified, a function that will throw
 * and cause the test to fail.
 *
 * Call this inside a describe() block outside beforeEach() because it defines
 * its own beforeEach() and afterEach().
 */
export const installImplAndBlockRest = ({
  modulePath,
  implementedFunctions = {},
}: {
  modulePath: string;
  implementedFunctions: { [key: string]: (args: unknown) => unknown };
}) => {
  const blockedCalls: string[] = [];

  const failOnCall = (
    {
      modulePath,
      fn,
    }: {
      modulePath: string;
      fn: string;
    },
    ...args
  ): never => {
    // Without this, JSON.stringify crashes on objects with bgint values.
    const argsString = JSON.stringify(args, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
    const message = `"${modulePath}".${fn} is called (with ${argsString}) but not mocked.`;
    blockedCalls.push(message);
    throw new Error(message);
  };

  const mockModule = async () => {
    const module = await import(modulePath);
    let hasMockFunction = false;
    for (const fn in module) {
      if (module[fn].mock) {
        hasMockFunction = true;
        const fnImplementation =
          implementedFunctions[fn] || failOnCall.bind(null, { modulePath, fn });
        module[fn].mockImplementation(fnImplementation);
      }
    }
    if (!hasMockFunction) {
      // The module didn't have any mocked functions so it wasn't actually mocked.
      // vi.mock() can't be done here because vi does some magic to move all
      // those calls to the top of test to make sure they happen before any
      // import.
      throw new Error(`You must add 'vi.mock("${modulePath}");' to your test.`);
    }
    for (const fn in implementedFunctions) {
      if (!module[fn]?.mock) {
        throw new Error(
          `${fn} is provided in implementedFunctions but can't be mocked on "${modulePath}".`
        );
      }
    }
  };

  beforeEach(async () => {
    blockedCalls.length = 0;
    await mockModule();
  });

  afterEach(() => {
    expect(blockedCalls).toEqual([]);
  });
};

// Call this inside a describe() block outside beforeEach() because it defines
// its own beforeEach() and afterEach().
export const blockAllCallsTo = (modulePaths: string[]) => {
  for (const modulePath of modulePaths) {
    installImplAndBlockRest({ modulePath, implementedFunctions: {} });
  }
};

/**
 * Takes an object with functions keyed by name and returns a new object with
 * the same names referring to corresponding functions that can be paused and
 * resumed. It also returns functions `pause` and `resume` to do the pausing and
 * resuming, and `reset` to resume and clear pending calls.
 * The functions must return promises.
 */
export const makePausable = (functions: {
  [key: string]: (...args: unknown[]) => Promise<unknown>;
}): {
  pause: () => void;
  resume: () => void;
  reset: () => void;
  pausableFunctions: {
    [key: string]: (...args: unknown[]) => Promise<unknown>;
  };
} => {
  let isPaused = false;
  const pendingCalls: (() => void)[] = [];

  /**
   * Calls the passed function and returns its result.  If the fake is paused,
   * the function will be queued and an unresolved promise is returned which
   * will resolve when the fake is resumed and the function called.
   */
  const wrapMaybePaused = async <T>(fn: () => Promise<T>): Promise<T> => {
    if (!isPaused) {
      return fn();
    }
    let resolve: (value: Promise<T>) => void;
    const responsePromise = new Promise<T>((res) => {
      resolve = res;
    });
    pendingCalls.push(() => {
      resolve(fn());
    });
    return responsePromise;
  };

  const pausableFunctions = {};
  for (const name in functions) {
    pausableFunctions[name] = (...args: unknown[]) => {
      return wrapMaybePaused(() => functions[name](...args));
    };
  }

  const pause = () => {
    if (isPaused) {
      throw new Error("The fake was already paused");
    }
    isPaused = true;
  };

  const resume = () => {
    if (!isPaused) {
      throw new Error("The fake wasn't paused.");
    }
    for (const call of pendingCalls) {
      call();
    }
    pendingCalls.length = 0;
    isPaused = false;
  };

  const reset = () => {
    pendingCalls.length = 0;
    isPaused = false;
  };

  return {
    pausableFunctions,
    pause,
    resume,
    reset,
  };
};
