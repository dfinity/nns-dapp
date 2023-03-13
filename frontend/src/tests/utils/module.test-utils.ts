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
      // jest.mock() can't be done here because jest does some magic to move all
      // those calls to the top of test to make sure they happen before any
      // import.
      throw new Error(
        `You must add 'jest.mock("${modulePath}");' to your test.`
      );
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
