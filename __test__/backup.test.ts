import { Backup } from "../src/Backup";
import * as fs from "fs-extra";
import * as path from "path";

async function getTestPaths(): Promise<any> {
  const testPath: any = {};
  testPath.base = path.join(__dirname, "tests");
  testPath.backupDest = path.join(testPath.base, "Backup");
  testPath.joplinProfile = path.join(testPath.base, "joplin-desktop");
  testPath.templates = path.join(testPath.joplinProfile, "templates");
  return testPath;
}

let backup = null;

async function createTestStructure() {
  const test = await getTestPaths();
  fs.emptyDirSync(test.base);
  fs.emptyDirSync(test.backupDest);
  fs.emptyDirSync(test.joplinProfile);
  fs.emptyDirSync(test.templates);
}

describe("Backup", function () {
  beforeEach(async () => {
    await createTestStructure();
    backup = new Backup() as any;
    backup.log.transports.console.level = "warn";
    backup.log.transports.file.level = "warn";
  });

  it(`File`, async () => {
    const testPath = await getTestPaths();
    const src1 = path.join(testPath.joplinProfile, "settings.json");
    const src2 = path.join(testPath.joplinProfile, "doesNotExist.json");
    const dst = path.join(testPath.backupDest, "settings.json");
    fs.writeFileSync(src1, "data");

    expect(await backup.backupFile(src1, dst)).toBe(true);
    expect(fs.existsSync(dst)).toBe(true);

    expect(await backup.backupFile(src2, dst)).toBe(false);
  });

  it(`Folder`, async () => {
    const testPath = await getTestPaths();
    const file1 = path.join(testPath.templates, "template1.md");
    const file2 = path.join(testPath.templates, "template2.md");

    const doesNotExist = path.join(testPath.base, "doesNotExist");

    const dst = path.join(testPath.backupDest, "templates");
    const checkFile1 = path.join(dst, "template1.md");
    const checkFile2 = path.join(dst, "template2.md");

    fs.writeFileSync(file1, "template1");
    fs.writeFileSync(file2, "template2");

    expect(await backup.backupFolder(testPath.templates, dst)).toBe(true);
    expect(fs.existsSync(checkFile1)).toBe(true);
    expect(fs.existsSync(checkFile2)).toBe(true);

    expect(await backup.backupFolder(doesNotExist, dst)).toBe(false);
  });
});
