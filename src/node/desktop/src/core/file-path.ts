/*
 * file-path.ts
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

import fs from 'fs';
import os from 'os';
import path from 'path';
import { Err, Success } from './err';
import { User } from './user'

function logError(path: string, error: Err) {
  // TODO logging
}

// Analogous to BOOST_FS_COMPLETE in FilePath.cpp
function fs_complete(p: string, base: string) {
  return path.join(base, p);
}
// Analogous to BOOST_FS_PATH2STR
function fs_path2str(p: string): string {
  return p;
}

/**
 * Class representing a path on the system. May be any type of file (e.g. directory, symlink,
 * regular file, etc.)
 */
export class FilePath {
  private path: string;

  constructor(path: string = "") {
    this.path = path;
  }

  static homePathAlias = "~/";
  static homePathLeafAlias = "~";

  /**
   * Resolves the '~' alias within the path to the user's home path.
   */
  static resolveAliasedPath(aliasedPath: string, userHomePath: FilePath): FilePath {
    // Special case for empty string or "~"
    if (!aliasedPath || aliasedPath == this.homePathLeafAlias)
      return userHomePath;

    // if the path starts with the home alias then substitute the home path
    if (aliasedPath.startsWith(this.homePathAlias)) {
      const resolvedPath = userHomePath.getAbsolutePath() + aliasedPath.substr(1);
      return new FilePath(resolvedPath);
    } else {
      // no aliasing, this is either an absolute path or path
      // relative to the current directory
      return FilePath.safeCurrentPath(userHomePath).completePath(aliasedPath);
    }
  }

  /**
   * Checks whether the current working directory exists. If it does not, moves the
   * current working directory to the provided path and returns the new current working
   * directory.
   */
  static safeCurrentPath(revertToPath: FilePath): FilePath {
    try {
      return new FilePath(process.cwd());
    }
    catch (err) {
      // TODO log::logError(Error(err.code(), ERROR_LOCATION));
    }

    // revert to the specified path if it exists, otherwise
    // take the user home path from the system
    let safePath = revertToPath;
    if (!fs.existsSync(safePath.path)) {
      safePath = User.getUserHomePath();
    }

    let error = safePath.makeCurrentPath();
    if (error) {
      // TODO: log::logError(error);
    }

    return safePath;
  }

  /**
   * Checks whether this file path contains a path or not.
   */
  isEmpty() {
    return !this.path;
  }

  /**
   * Gets the full absolute representation of this file path.
   */
  getAbsolutePath() {
    return this.path;
  }

  /**
   * Changes the current working directory to location represented by this file path.
   */
  makeCurrentPath(autoCreate = false): Err {
    if (autoCreate) {
      const autoCreateError = this.ensureDirectory();
      if (autoCreateError)
        return autoCreateError;
    }

    try {
      process.chdir(this.path);
      return Success();
    }
    catch (err) {
      // TODO addErrorProperties(m_impl->Path, &error);
      return err;
    }
    return Success();
  }

  /**
   * Creates this directory, if it does not exist.
   */
  ensureDirectory(): Err {
    if (!this.exists())
      return this.createDirectory();
    else
      return Success();
  }

  /**
   * Checks whether this file path exists in the file system.
   */
  exists(): boolean {
    try {
      return !this.isEmpty() && fs.existsSync(this.path);
    } catch (err) {
      logError(this.path, err);
      return false;
    }
  }

  /**
   * Checks whether the specified path exists.
   */
  static exists(filePath: string): boolean {
    if (!filePath) {
      return false;
    }
    try {
      return fs.existsSync(filePath);
    } catch (err) {
      logError(filePath, err);
      return false;
    }
  }

  /**
   * Creates the specified directory, relative to this directory.
   */
  createDirectory(filePath: string = ''): Err {
    let targetDirectory: string;
    if (!filePath) {
      targetDirectory = this.path;
    } else {
      targetDirectory = fs_complete(filePath, this.path);
    }
    try {
      fs.mkdirSync(targetDirectory, { recursive: true });
    } catch (err) {
      // TODO addErrorProperties(this.path, &error);
      // TODO error.addProperty("target-dir", filePath);
      return err;
    }
    return Success();
  }

  /**
   * Completes the provided path relative to this path. If the provided path is not relative,
   * it will be returned as is. Relative paths such as ".." are permitted.
   */
  completePath(filePath: string): FilePath {
    try {
      return new FilePath(fs_path2str(fs_complete(filePath, this.path)));
    }
    catch (err) {
      //Error error(e.code(), ERROR_LOCATION);
      //addErrorProperties(m_impl -> Path, & error);
      //error.addProperty("path", in_filePath);
      // TODO logging log::logError(error);
      return this;
    }
    return new FilePath(filePath);
  }
}
