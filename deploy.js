import { exec } from "child_process";
import { copyFileSync } from "fs";
import { join } from "path";

const argEnv = process.argv[2];
const restArgs = process.argv.slice(2);
const environment = getEnvironmentFromArgumentOrThowError(argEnv);

const targetEnvironmentFile = join(
  "environments",
  `environments.${environment}.js`
);

const devEnvironmentFile = join("environments", "environment.dev.js");
const environmentFile = join("environments", "environment.js");

exec(`firebase use ${environment}`);
copyFileSync(targetEnvironmentFile, environmentFile);

if (
  (restArgs[0] === "--only" && restArgs[1].includes("hosting")) ||
  restArgs.length === 0
)
  exec("npm run build");

exec(`firebase deploy ${restArgs.join(" ")}`);
copyFileSync(devEnvironmentFile, environmentFile);
exec("firebase use dev");

function getEnvironmentFromArgumentOrThowError(environmentFromArgument) {
  if (environmentFromArgument === "dev") return "dev";
  if (environmentFromArgument === "staging") return "staging";
  if (environmentFromArgument === "prod") return "prod";
  throw new Error("Unknown environment");
}
