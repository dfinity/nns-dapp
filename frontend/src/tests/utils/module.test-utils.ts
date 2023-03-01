/**
 * Tool to block all non-mocked calls to a module during a test.
 * Useful to make sure you are aware of all calls made to a certain module and
 * to make sure each one is mocked in the test.
 */


const blockedCalls: string[] = [];

const failOnCall = ({
  modulePath,
  fn,
  args,
}: {
  modulePath: string;
  fn: string;
  args: unknown;
}): never => {
  const message = `"${modulePath}".${fn} is called (with ${JSON.stringify(
    args
  )}) but not mocked.`;
  blockedCalls.push(message);
  throw new Error(message);
};

const blockModule = ({ module, modulePath }) => {
  let hasMockFunction = false;
  for (const fn in module) {
    if (module[fn].mock) {
      hasMockFunction = true;
      module[fn].mockImplementation(async (args) => {
        failOnCall({ modulePath, fn, args });
      });
    }
  }
  if (!hasMockFunction) {
    // The module didn't have any mocked functions so it wasn't actually mocked.
    // jest.mock() can't be done here because jest does some magic to move all
    // those calls to the top of test to make sure they happen before any
    // import.
    throw new Error(`You must add 'jest.mock("${modulePath}");' to your test.`);
  }
};

export const blockAllCallsTo = (modulePaths: string[]) => {
  beforeEach(async () => {
    blockedCalls.length = 0;
    for (const modulePath of modulePaths) {
      const module = await import(modulePath);
      blockModule({ module, modulePath });
    }
  });

  afterEach(() => {
    expect(blockedCalls).toEqual([]);
  });
};
