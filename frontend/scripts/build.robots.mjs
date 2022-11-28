#!/usr/bin/env node

import * as dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { findHtmlFiles } from "./build.utils.mjs";

dotenv.config();

const buildRobots = (htmlFile) => {
  const updatedIndexHTML = updateRobots(htmlFile);
  writeFileSync(htmlFile, updatedIndexHTML);
};

/**
 * No search engines indexation locally or testnet otherwise remove comments.
 */
const updateRobots = (htmlFile) => {
  const content = readFileSync(htmlFile, "utf-8");

  return content.replace(
    "<!-- ROBOTS -->",
    ["local", "testnet"].includes(process.env.VITE_DFX_NETWORK)
      ? '<meta name="robots" content="noindex, nofollow" />'
      : ""
  );
};

const htmlFiles = findHtmlFiles();
htmlFiles.forEach((htmlFile) => buildRobots(htmlFile));
