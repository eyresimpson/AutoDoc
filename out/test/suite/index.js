"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const path = require("path");
const Mocha = require("mocha");
const glob = require("glob");
const configuration_1 = require("./util/configuration");
const generic_1 = require("./util/generic");
async function run() {
    // Let VS Code load the test workspace.
    await (0, generic_1.openDocument)(generic_1.Test_Md_File_Path);
    await (0, generic_1.sleep)(2000);
    await (0, configuration_1.resetConfiguration)();
    // Create the mocha test
    const mocha = new Mocha({
        color: true,
        ui: 'tdd',
    });
    // Load the test suite.
    const testSuiteRoot = path.resolve(__dirname);
    const globOptions = { cwd: testSuiteRoot };
    const unitTests = glob.sync("unit/**/*.test.js", globOptions);
    const integrationTests = glob.sync("integration/**/*.test.js", globOptions);
    unitTests.forEach(f => mocha.addFile(path.resolve(testSuiteRoot, f))); // Run unit tests first.
    integrationTests.forEach(f => mocha.addFile(path.resolve(testSuiteRoot, f)));
    // Run tests.
    return new Promise((resolve, reject) => {
        try {
            mocha.run(failures => {
                // Ensure the control returns only after tests finished.
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                }
                resolve();
            });
        }
        catch (err) {
            console.error(err); // https://github.com/microsoft/vscode/issues/80757
            throw err;
        }
    });
}
exports.run = run;
//# sourceMappingURL=index.js.map