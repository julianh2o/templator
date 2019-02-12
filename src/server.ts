import { assert } from "chai";
import logger from "logger";

// greeter.ts
function greeter(person: string) {
    return `Hello ${person}!`;
}

const name = "Node Hero";

logger.info(greeter(name));
