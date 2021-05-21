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

function logError(path: string, error: Error) {
  // TODO: logging
  console.error(path + '\n' + error);
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
    if (!aliasedPath || aliasedPath == this.homePathLeafAlias) {
      return userHomePath;
    }

    // if the path starts with the home alias then substitute the home path
    if (aliasedPath.startsWith(this.homePathAlias)) {
      const resolvedPath = userHomePath.getAbsolutePath() + aliasedPath.substr(1);
      return new FilePath(resolvedPath);
    } else {
      // no aliasing, this is either an absolute path or path
      // relative to the current directory
      // return FilePath.safeCurrentPath(userHomePath).completePath(aliasedPath);
      return new FilePath();
    }
  }

  /**
   * Checks whether the current working directory exists. If it does not, moves the
   * current working directory to the provided path and returns the new current working 
   * directory.
   */
  // static safeCurrentPath(revertToPath: FilePath): FilePath {
  //   try {
  //     return new FilePath(process.cwd());
  //   }
  //   catch (error) {
  //     if (error instanceof Error) {
  //       // TODO log::logError(Error(e.code(), ERROR_LOCATION));
  //       console.error(error);
  //     } else {
  //       throw error;
  //     }
  //   }

  //   // revert to the specified path if it exists, otherwise
  //   // take the user home path from the system
  //   let safePath = revertToPath;
  //   if (!fs.existsSync(safePath.path)) {
  //     safePath = FilePath.getUserHomePath();
  //   }

  //   Error error = safePath.makeCurrentPath();
  //   if (error)
  //     log::logError(error);

  //   return safePath;
  // }

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
  // makeCurrentPath(autoCreate = false) {
  //   if (autoCreate) {
  //     Error autoCreateError = ensureDirectory();
  //     if (autoCreateError)
  //        return autoCreateError;
  //  }

  //  try
  //  {
  //     boost::filesystem::current_path(m_impl->Path);
  //     return Success();
  //  }
  //  catch(const boost::filesystem::filesystem_error& e)
  //  {
  //     Error error(e.code(), ERROR_LOCATION);
  //     addErrorProperties(m_impl->Path, &error);
  //     return error;
  //  }
  // }

  // TODO temp stub for code in user.ts
  static getUserHomePath() {
    return os.homedir();
  }

  /**
   * Creates this directory, if it does not exist.
   */
  // ensureDirectory(): Error | undefined {
  //   if (!FilePath.exists())
  //     return createDirectory(std::string());
  //  else
  //     return Success();
  //   return undefined;
  // }

  /**
   * Checks whether this file path exists in the file system.
   */
  exists(): boolean {
    try {
      return !this.isEmpty() && fs.existsSync(this.path);
    }
    catch(error) {
      if (error instanceof Error) {
        logError(this.path, error);
      }
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
    }
    catch (error) {
      logError(filePath, error);
      return false;
    }
  }
}
