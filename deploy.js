import { execSync } from "child_process";
import { copyFileSync } from "fs";
import { join } from "path";

const argEnv = process.argv[2];
const restArgs = process.argv.slice(3);
const environment = getEnvironmentFromArgumentOrThowError(argEnv);

const targetEnvironmentFile = join(
  "environments",
  `environment.${environment}.js`
);

const devEnvironmentFile = join("environments", "environment.dev.js");
const environmentFile = join("environments", "environment.js");

console.log(`firebase use ${environment}`);
execSync(`firebase use ${environment}`);

console.log(`Copying environment.${environment}.js to environment.js`);
copyFileSync(targetEnvironmentFile, environmentFile);

const onlyArgIndex = restArgs.findIndex((a) => a === "--only");

if (onlyArgIndex === -1 || restArgs[onlyArgIndex + 1]?.includes("hosting")) {
  console.log("Building application");
  execSync("npm run build");
}

console.log(`firebase deploy ${restArgs.join(" ")}`);
execSync(`firebase deploy ${restArgs.join(" ")}`);

console.log("Copying environment.dev.js to environment.js");
copyFileSync(devEnvironmentFile, environmentFile);

console.log("firebase use dev");
execSync("firebase use dev");

function getEnvironmentFromArgumentOrThowError(environmentFromArgument) {
  if (environmentFromArgument === "dev") return "dev";
  if (environmentFromArgument === "staging") return "staging";
  if (environmentFromArgument === "prod") return "prod";
  throw new Error("Unknown environment");
}
