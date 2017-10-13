/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const PageExecutionTimings = require('../../audits/page-execution-timings.js');
const fs = require('fs');
const assert = require('assert');

// sadly require(file) is not working correctly.
// traceParser parser returns preact trace data the same as JSON.parse
// fails when require is used
const readFile = (file, cb) => {
  let output = '';
  const readStream = fs.createReadStream(__dirname + file, {
    encoding: 'utf-8',
  });

  readStream.on('data', (chunk) => {
    output += chunk.toString();
  });
  readStream.on('end', () => {
    cb(JSON.parse(output));
  });
}

/* eslint-env mocha */
describe('Performance: page execution timings audit', () => {
  it('should compute the correct pageExecutionTiming values', (done) => {
    readFile('/../fixtures/traces/progressive-app-m60.json', fileData => {
      const artifacts = {
        traces: {
          [PageExecutionTimings.DEFAULT_PASS]: fileData,
        },
      };

      const output = PageExecutionTimings.audit(artifacts);
      assert.equal(output.details.items.length, 12);
      assert.equal(output.score, false);
      assert.equal(Math.round(output.rawValue), 611);

      const valueOf = name => Math.round(output.extendedInfo.value[name]);
      assert.equal(valueOf('Recalculate Style'), 170);
      assert.equal(valueOf('Layout'), 138);
      assert.equal(valueOf('Evaluate Script'), 131);
      assert.equal(valueOf('Paint'), 52);
      assert.equal(valueOf('DOM GC'), 33);
      assert.equal(valueOf('Update Layer Tree'), 25);
      assert.equal(valueOf('Compile Script'), 25);
      assert.equal(valueOf('Parse HTML'), 14);
      assert.equal(valueOf('Major GC'), 8);
      assert.equal(valueOf('Minor GC'), 7);
      assert.equal(valueOf('Composite Layers'), 6);
      assert.equal(valueOf('Image Decode'), 1);

      done();
    });
  });

  it('should get no data when no events are present', () => {
    readFile('/../fixtures/traces/airhorner_no_fcp.json', fileData => {
      const artifacts = {
        traces: {
          [PageExecutionTimings.DEFAULT_PASS]: fileData,
        },
      };

      const output = PageExecutionTimings.audit(artifacts);
      assert.equal(output.details.items.length, 0);
      assert.equal(output.score, false);
      assert.equal(Math.round(output.rawValue), 0);
    });
  });
});
