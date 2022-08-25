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

/**
 * Generate the TypeScript interfaces from the english translation file.
 *
 * Note: only supports "a one child depth" in the data structure.
 */
const generate = () => {
  const rootData = mapKeys(en);
  const governanceData = mapKeys(en_governance);

  const data = [
    ...rootData,
    ...governanceData,
  ];

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

generate();
