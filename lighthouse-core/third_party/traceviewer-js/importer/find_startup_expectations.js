"use strict";require("../model/user_model/startup_expectation.js");'use strict';global.tr.exportTo('tr.importer',function(){function getAllFrameEvents(modelHelper){var frameEvents=[];frameEvents.push.apply(frameEvents,modelHelper.browserHelper.getFrameEventsInRange(tr.model.helpers.IMPL_FRAMETIME_TYPE,modelHelper.model.bounds));tr.b.iterItems(modelHelper.rendererHelpers,function(pid,renderer){frameEvents.push.apply(frameEvents,renderer.getFrameEventsInRange(tr.model.helpers.IMPL_FRAMETIME_TYPE,modelHelper.model.bounds));});return frameEvents.sort(tr.importer.compareEvents);}function getStartupEvents(modelHelper){function isStartupSlice(slice){return slice.title==='BrowserMainLoop::CreateThreads';}var events=modelHelper.browserHelper.getAllAsyncSlicesMatching(isStartupSlice);var deduper=new tr.model.EventSet();events.forEach(function(event){var sliceGroup=event.parentContainer.sliceGroup;var slice=sliceGroup&&sliceGroup.findFirstSlice();if(slice)deduper.push(slice);});return deduper.toArray();}function findStartupExpectations(modelHelper){var openingEvents=getStartupEvents(modelHelper);var closingEvents=getAllFrameEvents(modelHelper);var startups=[];openingEvents.forEach(function(openingEvent){closingEvents.forEach(function(closingEvent){if(openingEvent.closingEvent)return;if(closingEvent.openingEvent)return;if(closingEvent.start<=openingEvent.start)return;if(openingEvent.parentContainer.parent.pid!==closingEvent.parentContainer.parent.pid)return;openingEvent.closingEvent=closingEvent;closingEvent.openingEvent=openingEvent;var se=new tr.model.um.StartupExpectation(modelHelper.model,openingEvent.start,closingEvent.end-openingEvent.start);se.associatedEvents.push(openingEvent);se.associatedEvents.push(closingEvent);startups.push(se);});});return startups;}return{findStartupExpectations:findStartupExpectations};});