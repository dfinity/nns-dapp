#!/usr/bin/env node

import * as dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import {join} from "path";

dotenv.config();

const buildRobots = () => {
    const updatedIndexHTML = updateRobots();
    writeFileSync("./public/index.html", updatedIndexHTML);
};


/**
 * No search engines indexation locally or testnet otherwise remove comments.
 */
const updateRobots = () => {
    const content = readFileSync(
        join(process.cwd(), "public", "index.html"),
        "utf-8"
    );

    return content.replace(
        "<!-- ROBOTS -->",
        ["local", "testnet"].includes(process.env.VITE_DFX_NETWORK)
            ? '<meta name="robots" content="noindex, nofollow" />'
            : ""
    );
}

buildRobots();