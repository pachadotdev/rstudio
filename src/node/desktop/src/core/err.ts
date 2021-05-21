/*
 * err.ts
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
 * Type to return from non-throwing functions. Enables returning null
 * to represent "no error" aka Success. Per existing pattern in RStudio code,
 * we expect an "Err" result to be falsy if there is no error, and truthy if
 * there is an error.
 */

export type Err = Error | null;

/**
 * Convenience function for returning "no error" state from a function that
 * can return an Error.
 */
export function Success(): null {
  return null;
}

export function UnexpectedExceptionError(e: any, caller: string): Error {
  // TODO: include more info?
  return new Error(`Unexpected exception type thrown in ${caller}`);
}
