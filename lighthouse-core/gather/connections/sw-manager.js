/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const SWSession = require('./sw');

class SWManager {
  constructor(connection, {requiredType}) {
    this._connection = connection;
    this._requiredType = requiredType;
    this._targets = [];
  }

  listen() {
    const opts = {autoAttach: true, waitForDebuggerOnStart: false};
    return this._connection.sendCommand('Target.setAutoAttach', opts).then(_ =>
      this._connection.on('notification', event => {
        if (event.method === 'Target.attachedToTarget') this.onTargetAttached(event.params);
        if (event.method === 'Target.detachedFromTarget') this.onTargetDetached(event.params);
      })
    );
  }

  sendCommand(method, params) {
    // const p = this._targets.map(({session, manager}) => {
      const target = this._targets[0];
      if (!target) {
        console.log('no targetz');
        return Promise.resolve();
      }
      const session = target.session;
      const manager = target.manager;
      // const {session = undefined, manager = undefined} = this._targets[0];
      if (manager) return manager.sendCommand(method, params);
      else return session.sendCommand(method, params);
    // })[0];
    // return Promise.all(p);
  }

  onTargetAttached({sessionId, targetInfo}) {
    if (targetInfo.type !== this._requiredType) return;

    // setup message passing to wrap/unwrap Target messages
    const session = new SWSession(sessionId, targetInfo, this._connection);

    // `service_worker` targets are phantom pages. They have a `worker` target within that we want
    let manager;
    if (this._requiredType === 'service_worker') {
      manager = new SWManager(session, {requiredType: 'worker'});
      manager.listen();
    }

    this._targets.push({session, manager});
  }

  onTargetDetached({sessionId}) {
    this._targets = this._targets.filter(session => session.sessionId() !== sessionId);
  }
}

// .then(_ => this._connection.sendCommand('Target.setDiscoverTargets', {discover: true}))
// "{"method":"Target.attachedToTarget","params":{"sessionId":"dedicated:92334.8-2","targetInfo":{"targetId":"dedicated:92334.8","type":"worker","title":"https://caltrainschedule.io/sw.js","url":"https://caltrainschedule.io/sw.js","attached":true},"waitingForDebugger":false}}"

module.exports = SWManager;
