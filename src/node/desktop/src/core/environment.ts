/*
 * sample.ts
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

export interface Option {
  name: string,
  value: string
}

/**
 * Get value of process environment variable; returns empty string it not found.
 */
export function getenv(name: string) {
  return process.env[name] ?? '';
}

/**
 * Add given name=value to process environment.
 */
export function setenv(name: string, value: string) {
  process.env[name] = value;
}

/**
 * Unset given environment variable in process environment.
 */
export function unsetenv(name: string) {
  delete process.env[name];
}

/**
 * Expand environment variables in a string; for example /$USER/foo to
 * /bob/foo when USER=bob
 */
export function expandEnvVars(environment: Array<Option>, str: string) {
  let result = str;
  for (let option of environment) {
    // replace bare forms (/home/$USER)
    let reVar = new RegExp('\\$\\b' + option.name + '\\b', 'g');
    result = result.replace(reVar, option.value);

    // replace curly brace forms (/home/${USER})
    let reBraceVar = new RegExp('\\${' + option.name + '}', 'g');
    result = result.replace(reBraceVar, option.value);
  }
  return result;
}
