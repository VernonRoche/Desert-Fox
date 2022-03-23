import fs from "fs";
import path from "path";

describe("Check files in src folder", function () {
  it("They should all be .ts files", function () {
    const notTsFiles: string[] = [];
    function checkFolder(folderPath: string) {
      const files = fs.readdirSync(folderPath);
      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          checkFolder(filePath);
        } else {
          if (path.extname(filePath) !== ".ts") {
            notTsFiles.push(filePath);
          }
          console.log("filePath:", filePath, "is valid");
        }
      });
    }
    checkFolder("./src");
    if (notTsFiles.length > 0) {
      throw new Error(`The following files are not .ts files: [${notTsFiles.join(", ")}]`);
    }
  });

  it("Files containing class should be capitalized", function () {
    const notCapitalizedFiles: string[] = [];
    function checkFolder(folderPath: string) {
      const files = fs.readdirSync(folderPath);
      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          checkFolder(filePath);
        } else {
          const hasAClass = fs.readFileSync(path.join(folderPath, file), "utf-8").includes("class");
          if (hasAClass && file.charAt(0).toLowerCase() === file.charAt(0)) {
            notCapitalizedFiles.push(filePath);
          }
          console.log("filePath:", filePath, "is valid");
        }
      });
    }
    checkFolder("./src/main");
    if (notCapitalizedFiles.length > 0) {
      throw new Error(
        `The following files do not start with capital letter: [${notCapitalizedFiles.join(", ")}]`,
      );
    }
  });
});
