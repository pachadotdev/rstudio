/*
 * environment.spec.ts
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
import fs from 'fs';
import path from 'path';
import os from 'os';

function randomString() {
  return Math.trunc(Math.random() * 2147483647).toString();
}

describe("FilePath", () => {
  describe("Constructor checks", () => {
    it("Should store and return the supplied path", () => {
      const path = new FilePath('hello/world');
      expect(path.getAbsolutePath()).to.equal('hello/world');
    });
    it("Should accept no arguments", () => {
      const path = new FilePath();
      expect(path.getAbsolutePath()).to.equal('');
    });
  });
  // describe("Get a safe current path", () => {
  //   it("Should return current working directory if it exists", () => {
  //     const cwd = new FilePath(process.cwd());
  //     const rootPath = new FilePath('/');
  //     const currentPath = FilePath.safeCurrentPath(rootPath);
  //     expect(currentPath.getAbsolutePath()).to.equal(cwd.getAbsolutePath());
  //     expect(cwd.getAbsolutePath()).to.equal(process.cwd());
  //   });
  //   it("Should change to supplied safe path and return it if cwd doesn't exist", () => {
  //     const origDir = new FilePath(process.cwd());

  //     // create a temp folder, chdir to it, then delete it
  //     const testDir = path.join(os.tmpdir(), 'temp-folder-for-FilePath-tests-' + randomString());
  //     fs.mkdirSync(testDir);
  //     process.chdir(testDir);
  //     fs.rmdirSync(testDir);

  //     const currentPath = FilePath.safeCurrentPath(origDir);
  //     // expect(currentPath.path).to.not.equal(cwd.path);
  //     // expect(rootPath.path).to.equal(process.cwd());
  //   });
  // });
  describe("Path existence checks", () => {
    it("Should detect if this object's path is empty", () => {
      const emptyPath = new FilePath();
      expect(emptyPath.isEmpty()).is.true;
    });
    it("Should detect when object's path exists", () => {
      const cwd = new FilePath(os.tmpdir());
      expect(cwd.exists()).is.true;
    });
    it("Should detect when object's path doesn't exist", () => {
      const cwd = new FilePath('/super/bogus/path/42');
      expect(cwd.exists()).is.false;
    });
    it("Should detect when a supplied path exists", () => {
      expect(FilePath.exists(os.tmpdir())).is.true;
    });
    it("Should detect when a supplied path doesn't exist", () => {
      expect(FilePath.exists('/super/bogus/path/42')).is.false;
    });
  })
});
