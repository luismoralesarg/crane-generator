#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { introspectDatabase } from "../db/introspect";
import { generateCrudModules } from "../generators/crudGenerator";
const argv = yargs(hideBin(process.argv))
  .option("host", { type: "string", demandOption: true })
  .option("user", { type: "string", demandOption: true })
  .option("password", { type: "string", demandOption: true })
  .option("database", { type: "string", demandOption: true })
  .option("port", { type: "number", default: 3306 })
  .option("output", { type: "string", default: process.cwd() })
  .help().argv;

(async () => {
  const argvResolved = await argv;
  const tables = await introspectDatabase(argvResolved);
  await generateCrudModules(tables, argvResolved.output);
})();
