/*
 * xdg.ts
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

/*
 * These routines return system and user paths for RStudio configuration and data, roughly in
 * accordance with the FreeDesktop XDG Base Directory Specification.
 *
 * https://standards.freedesktop.org/basedir-spec/basedir-spec-latest.html
 *
 * All of these can be configured with environment variables as described below.
 *
 * The values of the environment variables can include the following special variables:
 *
 * $USER  The user's name
 * $HOME  The user's home directory
 * ~      The user's home directory
 *
 * These values will be resolved against the current user by default. If you wish to
 * resolve them against a different user, supply their name and home directory using
 * the boost::optional arguments.
 */

import os from 'os';
import path from 'path';
import { expandEnvVars, getenv, setenv, EnvOption } from '../core/environment';
import { username, userHomePath } from '../core/system';
import { resolveAliasedPath } from '../core/file-path';

enum WinFolderID {
  FOLDERID_RoamingAppData,
  FOLDERID_LocalAppData,
  FOLDERID_ProgramData
}

/**
 * Simplified implementation of Windows SHGetKnownFolderPath API using environment
 * variables.
 */
function SHGetKnownFolderPath(folderId: WinFolderID): string {
  let envVar = "";
  switch (folderId) {
    case WinFolderID.FOLDERID_RoamingAppData:
      envVar = "APPDATA";
      break;
    case WinFolderID.FOLDERID_LocalAppData:
      envVar = "LOCALAPPDATA";
      break;
    case WinFolderID.FOLDERID_ProgramData:
      envVar = "ProgramData";
      break;
  }
  return getenv(envVar);
}

/**
 * Returns the hostname from the operating system
 */
function getHostname(): string {
   // Use a static string to store the hostname so we don't have to look it up
   // multiple times
  static let hostname = "";

  if (!hostname) {
    hostname = os.hostname();
  }
  return hostname;
}

/**
 * Resolves an XDG directory based on the user and environment.
 *
 * @param rstudioEnvVer The RStudio-specific environment variable specifying
 *   the directory (given precedence)
 * @param xdgEnvVar The XDG standard environment variable
 * @param defaultDir Fallback default directory if neither environment variable
 *   is present
 * @param windowsFolderId The ID of the Windows folder to resolve against
 * @param user Optionally, the user to return a directory for; if omitted the
 *   current user is used
 * @param homeDir Optionally, the home directory to resolve against; if omitted
 *   the current user's home directory is used
 */
function resolveXdgDir(
  rstudioEnvVar: string,
  xdgEnvVar: string,
  windowsFolderId: WinFolderID,
  defaultDir: string,
  user?: string,
  homeDir?: string)
{
  let xdgHome = '';
  let finalPath = true;

   // Look for the RStudio-specific environment variable
  let env = getenv(rstudioEnvVar);
  if (!env) {
    // The RStudio environment variable specifices the final path; if it isn't
    // set we will need to append "rstudio" to the path later.
    finalPath = false;
    env = getenv(xdgEnvVar);
  }

  if (!env) {
    // No root specified for xdg home; we will need to generate one.
    if (process.platform === 'win32') {
      // On Windows, the default path is in Application Data/Roaming.
      let path = SHGetKnownFolderPath(windowsFolderId);
      if (path) {
        xdgHome = path;
      } else {
        // TODO: LOG_EROR_MESSAGE
        console.log(`Unable to retrieve app settings path (${windowsFolderId}).`);
      }
    }
    if (!xdgHome) {
      // Use the default subdir for POSIX. We also use this folder as a fallback on Windows
      //if we couldn't read the app settings path.
      xdgHome = defaultDir;
    }
  } else {
    // We have a manually specified xdg directory from an environment variable.
    xdgHome = env;
  }

  // expand HOME, USER, and HOSTNAME if given
  let environment = new Array<EnvOption>();
  environment.push({
    name: "HOME",
    value: homeDir ? path.resolve(homeDir) : path.resolve(userHomePath())
  });
  environment.push({
    name: "USER",
    value: user ? user : username()
  });

  // check for manually specified hostname in environment variable
  let hostname = getenv("HOSTNAME");

  // when omitted, look up the hostname using a system call
  if (!hostname) {
    hostname = getHostname();
  }
  environment.push({ name: "HOSTNAME", value: hostname });

  const expanded = expandEnvVars(environment, path.resolve(xdgHome));

  // resolve aliases in the path
  xdgHome = resolveAliasedPath(expanded, homeDir ? homeDir : userHomePath());

  // If this is the final path, we can return it as-is
  if (finalPath) {
    return xdgHome;
  }

  // Otherwise, it's a root folder in which we need to create our own subfolder
  const folderName = process.platform === 'win32' ? 'RStudio' : 'rstudio';
  return path.join(xdgHome, folderName);
}

/**
 * Returns the RStudio XDG user config directory.
 * 
 * On Unix-alikes, this is ~/.config/rstudio, or XDG_CONFIG_HOME.
 * On Windows, this is 'FOLDERID_RoamingAppData' (typically 'AppData/Roaming').
 */
export function userConfigDir(user?: string, homeDir?: string) {
  return resolveXdgDir(
    "RSTUDIO_CONFIG_HOME",
    "XDG_CONFIG_HOME",
    WinFolderID.FOLDERID_RoamingAppData,
    "~/.config",
    user,
    homeDir
  );
}

/**
 * Returns the RStudio XDG user data directory.
 *
 * On Unix-alikes, this is ~/.local/share/rstudio, or XDG_DATA_HOME.
 * On Windows, this is 'FOLDERID_LocalAppData' (typically 'AppData/Local').
 */
export function userDataDir(user?: string, homeDir?: string) {
  return resolveXdgDir(
    "RSTUDIO_DATA_HOME",
    "XDG_DATA_HOME",
    WinFolderID.FOLDERID_LocalAppData,
    "~/.local/share",
    user,
    homeDir
   );
}

/**
 * Returns the RStudio XDG system config directory.
 *
 * On Unix-alikes, this is /etc/rstudio, XDG_CONFIG_DIRS.
 * On Windows, this is 'FOLDERID_ProgramData' (typically 'C:/ProgramData').
 */
export function systemConfigDir() {
  if (process.platform !== 'win32') {
    if (getenv("RSTUDIO_CONFIG_DIR").empty()) {
      // On POSIX operating systems, it's possible to specify multiple config
      // directories. We have to select one, so read the list and take the first
      // one that contains an "rstudio" folder.
      std:: string env = getenv("XDG_CONFIG_DIRS");
      if (env.find_first_of(":") != std:: string:: npos)
      {
        std:: vector < std:: string > dirs = algorithm:: split(env, ":");
        for (const std:: string& dir: dirs)
        {
          FilePath resolved = FilePath(dir).completePath("rstudio");
          if (resolved.exists()) {
            return resolved;
          }
        }
      }
    }
  }
   return resolveXdgDir("RSTUDIO_CONFIG_DIR",
         "XDG_CONFIG_DIRS",
#ifdef _WIN32
         FOLDERID_ProgramData,
#endif
         "/etc",
         boost::none,  // no specific user
         boost::none   // no home folder resolution
   );
}

// Convenience method for finding a configuration file. Checks all the
// directories in XDG_CONFIG_DIRS for the file. If it doesn't find it,
// the path where we expected to find it is returned instead.
export FilePath systemConfigFile(const std::string& filename)
{
#ifdef _WIN32
    // Passthrough on Windows
    return systemConfigDir().completeChildPath(filename);
#else
   if (getenv("RSTUDIO_CONFIG_DIR").empty())
   {
      // On POSIX, check for a search path.
      std::string env = getenv("XDG_CONFIG_DIRS");
      if (env.find_first_of(":") != std::string::npos)
      {
         // This is a search path; check each element for the file.
         std::vector<std::string> dirs = algorithm::split(env, ":");
         for (const std::string& dir: dirs)
         {
            FilePath resolved = FilePath(dir).completePath("rstudio")
                  .completeChildPath(filename);
            if (resolved.exists())
            {
               return resolved;
            }
         }
      }
   }

   // We didn't find the file on the search path, so return the location where
   // we expected to find it.
   return systemConfigDir().completeChildPath(filename);
#endif
}

// Sets relevant XDG environment varibles
export void forwardXdgEnvVars(Options *pEnvironment)
{
   // forward relevant XDG environment variables (i.e. all those we respect above)
   for (auto&& xdgVar: {"RSTUDIO_CONFIG_HOME", "RSTUDIO_CONFIG_DIR",
                        "RSTUDIO_DATA_HOME",   "RSTUDIO_DATA_DIR",
                        "XDG_CONFIG_HOME",     "XDG_CONFIG_DIRS",
                        "XDG_DATA_HOME",       "XDG_DATA_DIRS"})
   {
      // only forward value if non-empty; avoid overwriting a previously set
      // value with an empty one
      std::string val = core::system::getenv(xdgVar);
      if (!val.empty())
      {
         // warn if we're changing values; we typically are forwarding values in
         // order to ensure a consistent view of configuration and state across
         // RStudio processes, which merits overwriting, but it's also hard to
         // imagine that these vars would be set unintentionally in the existing
         // environment.
         std::string oldVal = core::system::getenv(*pEnvironment, xdgVar);
         if (!oldVal.empty() && oldVal != val)
         {
             LOG_WARNING_MESSAGE("Overriding " + std::string(xdgVar) +
                                 ": '" + oldVal + "' => '" + val + "'");
         }
         core::system::setenv(pEnvironment, xdgVar, val);
      }
   }
}
