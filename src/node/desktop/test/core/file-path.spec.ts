/*
 * file-path.spec.ts
 *
 * Copyright (C) 2021 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import { describe } from "mocha";
import { expect } from "chai";

import { FilePath } from "../src/file-path";
import fs from "fs";
import path from "path";
import os from "os";
import { Err, Success } from "../src/err";
import { fileURLToPath } from "url";

function randomString() {
  return Math.trunc(Math.random() * 2147483647).toString();
}

describe("FilePath", () => {
  describe("Constructor checks", () => {
    it("Should store and return the supplied path", () => {
      const path = "hello/world";
      expect(new FilePath(path).getAbsolutePath()).to.equal(path);
    });
    it("Should create empty path when given no arguments", () => {
      const path = new FilePath();
      expect(path.getAbsolutePath().length).to.equal(0);
      expect(path.isEmpty());
    });
  });

  describe("Get a safe current path", () => {
    it("Should return current working directory if it exists", () => {
      const cwd = new FilePath(process.cwd());
      const rootPath = new FilePath('/');
      const currentPath = FilePath.safeCurrentPath(rootPath);
      expect(currentPath.getAbsolutePath()).to.equal(cwd.getAbsolutePath());
      expect(cwd.getAbsolutePath()).to.equal(process.cwd());
    });
    it("Should change to supplied safe path and return it if cwd doesn't exist", () => {
      const origDir = new FilePath(process.cwd());

      // create a temp folder, chdir to it, then delete it
      const testDir = path.join(os.tmpdir(), 'temp-folder-for-FilePath-tests-' + randomString());
      fs.mkdirSync(testDir);
      process.chdir(testDir);
      fs.rmdirSync(testDir);

      const currentPath = FilePath.safeCurrentPath(origDir);
      //expect(currentPath.path).to.not.equal(cwd.path);
      //expect(rootPath.path).to.equal(process.cwd());
    });
  });

  describe("Path existence checks", () => {
    it("Should detect if this object's path is empty", () => {
      expect(new FilePath().isEmpty()).is.true;
    });
    it("Should detect when object's path exists", () => {
      expect(new FilePath(os.tmpdir()).exists()).is.true;
    });
    it("Should detect when object's path doesn't exist", () => {
      expect(new FilePath("/super/bogus/path/42").exists()).is.false;
    });
    it("Should detect when a supplied path exists", () => {
      expect(FilePath.exists(os.tmpdir())).is.true;
    });
    it("Should detect when a supplied path doesn't exist", () => {
      expect(FilePath.exists("/super/bogus/path/42")).is.false;
    });
    it("Should return false for existence of a null path", () => {
      expect(new FilePath().exists()).is.false;
    });
  });

  describe("Directory creation", () => {
    it("Should create directory stored in FilePath", () => {
      const target = path.join(os.tmpdir(), randomString());
      const fp = new FilePath(target);
      const result = fp.createDirectory();
      expect(!!result).is.false;
      expect(fp.exists()).is.true;
      fs.rmdirSync(target);
    });
    it("Should succeed if directory in FilePath already exists", () => {
      const target = path.join(os.tmpdir(), randomString());
      const fp = new FilePath(target);
      let result = fp.createDirectory();
      expect(fp.exists()).is.true;
      result = fp.createDirectory();
      expect(!!result).is.false;
      expect(fp.exists()).is.true;
      fs.rmdirSync(target);
    });
    it("Should create directory relative to path in FilePath", () => {
      const target = randomString();
      const fp = new FilePath(os.tmpdir());
      const result = fp.createDirectory(target);
      expect(!!result).is.false;
      const newPath = path.join(os.tmpdir(), target);
      expect(fs.existsSync(newPath)).is.true;
      fs.rmdirSync(newPath);
    });
    it("Should create multiple directories", () => {
      const target = path.join(os.tmpdir(), randomString(), randomString());
      const fp = new FilePath(target);
      const result = fp.createDirectory();
      expect(!!result).is.false;
      expect(fp.exists()).is.true;
      fs.rmdirSync(target);
    });
    it("Should create multiple directories relative to path in FilePath", () => {
      const firstLevel = randomString();
      const extraFolder = randomString();
      const target = path.join(os.tmpdir(), firstLevel, randomString());
      const fp = new FilePath(target);
      const result = fp.createDirectory(extraFolder);
      expect(!!result).is.false;
      let newPath = path.join(target, extraFolder);
      expect(fs.existsSync(newPath)).is.true;
      fs.rmdirSync(path.join(os.tmpdir(), firstLevel), { recursive: true });
    });
    it("Should return success when asked to ensure existing directory exists", () => {
      const existingFolder = new FilePath(os.homedir());
      expect(existingFolder.exists()).is.true;
      const result = existingFolder.ensureDirectory();
      expect(!!result).is.false;
    });
    it("Should create directory when asked to ensure it exists", () => {
      const newFolder = path.join(os.tmpdir(), randomString());
      const newFilePath = new FilePath(newFolder);
      expect(fs.existsSync(newFolder)).is.false;
      const result = newFilePath.ensureDirectory();
      expect(!!result).is.false;
      expect(fs.existsSync(newFolder)).is.true;
      fs.rmdirSync(newFolder);
    });
 });
});
