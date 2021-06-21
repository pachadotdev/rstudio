/*
 * detect_r.test.ts
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

import { describe } from 'mocha';
import { assert } from 'chai';
import { saveAndClear, restore } from '../unit-utils';

import { scanForR } from '../../../src/main/detect_r';
import { FilePath } from '../../../src/core/file-path';

describe('detect_r', () => {
  const vars: Record<string, string> = {
    RSTUDIO_WHICH_R: ''
  };
 
  beforeEach(() => {
    saveAndClear(vars);
  });

  afterEach(() => {
    restore(vars);
  });

  it('scanForR uses RSTUDIO_WHICH_R', async () => {
    const rstudioWhichR = new FilePath('/usr/local/R');
    const result = await scanForR(rstudioWhichR);
    assert.equal(result, rstudioWhichR);
  });
});