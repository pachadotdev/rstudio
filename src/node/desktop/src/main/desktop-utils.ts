/*
 * desktop-utils.ts
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

import { systemPreferences } from 'electron';

export function initializeLang() {

  if (process.platform !== 'darwin') {
    return;
  }

  let lang: string | null = null;

  // We try to simulate the behavior of R.app.

  // Highest precedence: force.LANG. If it has a value, use it.

  // TODO: native, see https://github.com/electron/electron/issues/17031
  // ---------------------------------------------------------------------
  // NSUserDefaults * defaults =[NSUserDefaults standardUserDefaults];
  // [defaults addSuiteNamed:@"org.R-project.R"];
  // lang = [defaults stringForKey:@"force.LANG"];
  // if (lang && ![lang length]) {
  // }

  // Next highest precedence: ignore.system.locale. If it has a value,
  // hardcode to en_US.UTF-8.
  // if (!lang && [defaults boolForKey:@"ignore.system.locale"])
  // {
  //   lang = @"en_US.UTF-8";
  // }
  // ---------------------------------------------------------------------

  // Next highest precedence: LANG environment variable.
  if (!lang) {
    let envLang = process.env.LANG ?? "";
    if (!envLang.length) {
      lang = envLang;
    }
  }

  // // Next highest precedence: Try to figure out language from the current
  // // locale.
  // if (!lang) {
  //   lang = readSystemLocale();
  // }

  // // None of the above worked. Just hard code it.
  // if (!lang) {
  //   lang = @"en_US.UTF-8";
  // }

  // const char* clang =[lang cStringUsingEncoding: NSASCIIStringEncoding];
  // core:: system:: setenv("LANG", clang);
  // core:: system:: setenv("LC_CTYPE", clang);

  // initializeSystemPrefs();
}