const path = require("path");
const { spawnSync } = require("child_process");
const generateHtmlReport = require("./generate-html-report");

// ANSI color codes for terminal output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    success: "\x1b[32m",
    error: "\x1b[31m",
    warning: "\x1b[33m",
    info: "\x1b[36m",
    header: "\x1b[44m\x1b[37m"
};

function log(message, color = "reset") {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
    console.log(`\n${colors.header} ${message} ${colors.reset}\n`);
}

function logSuccess(message) {
    log(`✓ ${message}`, "success");
}

function logError(message) {
    log(`✗ ${message}`, "error");
}

function logWarning(message) {
    log(`⚠ ${message}`, "warning");
}

function logInfo(message) {
    log(`ℹ ${message}`, "info");
}

const rootDir = path.resolve(__dirname, "..");
const cucumberBin = path.join(rootDir, "node_modules", "@cucumber", "cucumber", "bin", "cucumber.js");

logHeader("RUNNING CUCUMBER TESTS");

const forwardedArgs = process.argv.slice(2);
const hasFeaturePathArg = forwardedArgs.some((arg) => typeof arg === "string" && arg.toLowerCase().endsWith(".feature"));
const defaultPaths = hasFeaturePathArg ? [] : ["features/**/*.feature"];

const cucumberRun = spawnSync(
    process.execPath,
    [
        cucumberBin,
        "--require-module",
        "ts-node/register",
        "--require",
        "src/hooks/**/*.ts",
        "--require",
        "src/step-definitions/**/*.ts",
        "--format",
        "progress",
        "--format",
        "json:reports/cucumber-report.json",
        ...defaultPaths,
        ...forwardedArgs
    ],
    {
        cwd: rootDir,
        stdio: "inherit"
    }
);

logHeader("GENERATING HTML REPORT");

let reportGenerationFailed = false;
let reportPath = null;

try {
    reportPath = generateHtmlReport();
    logSuccess(`HTML report generated at: ${reportPath}`);
} catch (error) {
    reportGenerationFailed = true;
    logError("Failed to generate HTML report");
    console.error(error instanceof Error ? error.message : error);
}

logHeader("EXECUTION SUMMARY");

if (typeof cucumberRun.status === "number") {
    if (cucumberRun.status === 0) {
        logSuccess("All Cucumber tests passed");
    } else {
        logError(`Cucumber tests exited with status code: ${cucumberRun.status}`);
    }

    if (!reportGenerationFailed) {
        logSuccess("Report generation completed successfully");
        logInfo(`Open your report: ${reportPath}`);
    } else {
        logError("Report generation failed - check errors above");
    }

    const exitCode = cucumberRun.status !== 0 ? cucumberRun.status : (reportGenerationFailed ? 1 : 0);
    console.log(`\nExit code: ${exitCode}\n`);
    process.exit(exitCode);
}

if (cucumberRun.error) {
    logError(`Failed to execute Cucumber: ${cucumberRun.error.message}`);
}

process.exit(1);
