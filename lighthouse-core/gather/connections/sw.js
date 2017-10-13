/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Connection = require('./connection.js');

class SWSession extends Connection {
  constructor(sessionId, targetInfo, parentConnection) {
    super();
    this._targetInfo = targetInfo;
    this._sessionId = sessionId;
    this._parent = parentConnection;

    this._parent.on('notification', this._onEvent.bind(this));
    // now we repeat and do this again. we need to autoattach and grab a type: `worker` within
  }

  sessionId() {
    return this._sessionId;
  }

  /**
   * @override
   * @return {!Promise}
   */
  connect() {
    return Promise.resolve();
  }

  /**
   * @override
   */
  disconnect() {
    return Promise.resolve();
  }

  _onEvent({method, params}) {
    if (method === 'Target.receivedMessageFromTarget' && params.sessionId === this._sessionId) {
      // debugger;
      this.handleRawMessage(params.message);
    }

    //     debugger;
    // Target.receivedMessageFromTarget', ({method, params}) => this.emitNotification(method, params));
  }

  /**
   * @override
   * @param {string} message
   */
  sendRawMessage(message) {
    // get the message string here. i'm going to send it with page's connection.
    // debugger;
    return this._parent.sendCommand('Target.sendMessageToTarget', {
      sessionId: this._sessionId,
      message
    });
  }
}

module.exports = SWSession;
