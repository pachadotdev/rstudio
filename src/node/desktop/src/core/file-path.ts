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

/**
 * Resolves the '~' alias within the path to the user's home path.
 */
export function resolveAliasedPath(aliasedPath: string, userHomePath: string) {
  // Special case for empty string or "~"
  if (!aliasedPath || (aliasedPath == homePathLeafAlias())) {
    return userHomePath;
  }

  // if the path starts with the home alias then substitute the home path
  if (aliasedPath.find(homePathAlias()) == 0) {
    const resolvedPath = userHomePath.getAbsolutePath() + aliasedPath.substr(1);
    return resolvedPath;
  } else {
    // no aliasing, this is either an absolute path or path
    // relative to the current directory
    return safeCurrentPath(userHomePath).completePath(aliasedPath);
   }
}
