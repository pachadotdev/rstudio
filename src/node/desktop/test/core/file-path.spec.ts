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

import fs from "fs";
import path from "path";
import os from "os";

import { FilePath } from "../src/file-path";

function randomString() {
  return Math.trunc(Math.random() * 2147483647).toString();
}

function real(path: string): string {
  return fs.realpathSync(path);
}

const bogusPath = "/super/bogus/path/42";

describe("FilePath", () => {
  afterEach(() => {
    // make sure we leave cwd in a valid place
    process.chdir(__dirname);
  });
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
    it("safeCurrentPath should return current working directory if it exists", () => {
      const cwd = new FilePath(process.cwd());
      const rootPath = new FilePath("/");
      const currentPath = FilePath.safeCurrentPath(rootPath);
      expect(currentPath.getAbsolutePath()).to.equal(cwd.getAbsolutePath());
      expect(real(cwd.getAbsolutePath())).to.equal(real(process.cwd()));
    });
    it("safeCurrentPath should change to supplied safe path if it exists if cwd doesn't exist", () => {
      const origDir = new FilePath(process.cwd());

      // create a temp folder, chdir to it, then delete it
      let testDir = path.join(
        os.tmpdir(),
        "temp-folder-for-FilePath-tests-" + randomString()
      );
      fs.mkdirSync(testDir);
      process.chdir(testDir);
      testDir = real(testDir);
      fs.rmdirSync(testDir);

      const currentPath = FilePath.safeCurrentPath(origDir);
      expect(real(origDir.getAbsolutePath())).to.equal(real(process.cwd()));
      expect(real(currentPath.getAbsolutePath())).to.equal(real(process.cwd()));
    });
    it("safeCurrentPath should change to home folder when both cwd and revert paths don't exist", () => {
      // create a temp folder, chdir to it, then delete it
      let testDir = path.join(
        os.tmpdir(),
        "temp-folder-for-FilePath-tests-" + randomString()
      );
      fs.mkdirSync(testDir);
      process.chdir(testDir);
      testDir = real(testDir);
      fs.rmdirSync(testDir);

      const currentPath = FilePath.safeCurrentPath(new FilePath(bogusPath));
      expect(real(currentPath.getAbsolutePath())).to.equal(real(os.homedir()));
    });
 });

  describe("Path existence checks", () => {
    it("isEmpty should detect if this object's path is empty", () => {
      expect(new FilePath().isEmpty()).is.true;
    });
    it("exists should detect when object's path exists", () => {
      expect(new FilePath(os.tmpdir()).exists()).is.true;
    });
    it("exists should detect when object's path doesn't exist", () => {
      expect(new FilePath(bogusPath).exists()).is.false;
    });
    it("exists should detect when a supplied path exists", () => {
      expect(FilePath.exists(os.tmpdir())).is.true;
    });
    it("exists should detect when a supplied path doesn't exist", () => {
      expect(FilePath.exists(bogusPath)).is.false;
    });
    it("exists should return false for existence of a null path", () => {
      expect(new FilePath().exists()).is.false;
    });
  });

  describe("Directory creation", () => {
    it("createDirectory should create directory stored in FilePath", () => {
      const target = path.join(os.tmpdir(), randomString());
      const fp = new FilePath(target);
      const result = fp.createDirectory();
      expect(!!result).is.false;
      expect(fp.exists()).is.true;
      fs.rmdirSync(target);
    });
    it("createDirectory should succeed if directory in FilePath already exists", () => {
      const target = path.join(os.tmpdir(), randomString());
      const fp = new FilePath(target);
      let result = fp.createDirectory();
      expect(fp.exists()).is.true;
      result = fp.createDirectory();
      expect(!!result).is.false;
      expect(fp.exists()).is.true;
      fs.rmdirSync(target);
    });
    it("createDirectory should create directory relative to path in FilePath", () => {
      const target = randomString();
      const fp = new FilePath(os.tmpdir());
      const result = fp.createDirectory(target);
      expect(!!result).is.false;
      const newPath = path.join(os.tmpdir(), target);
      expect(fs.existsSync(newPath)).is.true;
      fs.rmdirSync(newPath);
    });
    it("createDirectory should recursively create directories", () => {
      const target = path.join(os.tmpdir(), randomString(), randomString());
      const fp = new FilePath(target);
      const result = fp.createDirectory();
      expect(!!result).is.false;
      expect(fp.exists()).is.true;
      fs.rmdirSync(target);
    });
    it("createDirectory should recursively create directories relative to path in FilePath", () => {
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
    it("ensureDirectory should return success when asked to ensure existing directory exists", () => {
      const existingFolder = new FilePath(os.homedir());
      expect(existingFolder.exists()).is.true;
      const result = existingFolder.ensureDirectory();
      expect(!!result).is.false;
    });
    it("ensureDirectory should create directory when asked to ensure it exists", () => {
      const newFolder = path.join(os.tmpdir(), randomString());
      const newFilePath = new FilePath(newFolder);
      expect(fs.existsSync(newFolder)).is.false;
      const result = newFilePath.ensureDirectory();
      expect(!!result).is.false;
      expect(fs.existsSync(newFolder)).is.true;
      fs.rmdirSync(newFolder);
    });
  });
  describe("Manipulate current working directory", () => {
    it("makeCurrentPath should change cwd to existing folder", () => {
      const cwd = new FilePath(process.cwd());
      const newFolder = path.join(os.tmpdir(), randomString());
      fs.mkdirSync(newFolder);
      const newFilePath = new FilePath(newFolder);
      const result = newFilePath.makeCurrentPath();
      expect(!!result).is.false;
      expect(real(process.cwd())).equals(real(newFolder));
      process.chdir(cwd.getAbsolutePath());
      fs.rmdirSync(newFolder);
    });
  });
  describe("completePath should do what's expected", () => {

  });
});
