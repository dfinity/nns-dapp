#!/usr/bin/env node

const { writeFileSync } = require("fs");
const prettier = require("prettier");

const en = require("../src/lib/i18n/en.json");
const en_governance = require("../src/lib/i18n/en.governance.json");

const mapKeys = (entries) =>
  Object.keys(entries).map((key) => {
    const properties = Object.keys(entries[key]).map(
      (prop) => `${prop}: string;`
    );

    return {
      key,
      name: `I18n${key.charAt(0).toUpperCase()}${key.slice(1)}`,
      properties,
    };
  });

const assertUniqueKeys = ({ governance, core }) => {
  const coreKeys = core.map(({ key }) => key);
  const diff = governance.filter(({ key }) => coreKeys.includes(key));

  if (diff.length) {
    console.error("Duplicate keys:", diff.map(({ key }) => key).join(","));
    throw new Error("Some i18n governance keys are declared in the core keys.");
  }
};

/**
 * Generate the TypeScript interfaces from the english translation file.
 *
 * Note: only supports "a one child depth" in the data structure.
 */
const generate = () => {
  const rootData = mapKeys(en);
  const governanceData = mapKeys(en_governance);

  // Ensure there are no keys in en.governance.json that duplicates en.json
  assertUniqueKeys({ governance: governanceData, core: rootData });

  const data = [...rootData, ...governanceData];

  const lang = `lang: Languages;`;

  const main = `\n\ninterface I18n {${lang}${data
    .map((i) => `${i.key}: ${i.name};`)
    .join("")}}`;
  const interfaces = data
    .map((i) => `\n\ninterface ${i.name} {${i.properties.join("")}}`)
    .join("");

  const comment = `/**\n* Auto-generated definitions file ("npm run i18n")\n*/`;

  const output = prettier.format(`${comment}${interfaces}${main}`, {
    parser: "babel",
  });

  writeFileSync("./src/lib/types/i18n.d.ts", output);
};

try {
  generate();
} catch (e) {
  console.error(e);
}
