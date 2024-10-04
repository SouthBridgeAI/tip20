import fs from "fs";
import { tip20streaming } from "../src/tip20";

(async function test() {
  const testData = fs.readFileSync(__dirname + "/test-typescript.txt", "utf8");

  console.log("Cleaning up test: ");

  const tip20stream = await tip20streaming(
    "typescript",
    testData,
    "claude-3-haiku-20240307"
  );

  for await (const token of tip20stream) {
    console.log("Got packet ", token);

    if (token.type === "fullMessage") {
      fs.writeFileSync(
        __dirname + "/test-typescript-cleaned.txt",
        token.message
      );
    }
  }
})();
