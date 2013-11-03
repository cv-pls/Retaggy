/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper, chrome */

(function() {

  'use strict';

  var running, apiBaseUrl, apiBaseQuery, opParams, workerTab, dataSet, totalItems = 0, itemsCompleted = 0;

  apiBaseUrl = 'http://api.stackexchange.com/2.1/search/advanced';
  apiBaseQuery = {
    site: 'stackoverflow',
    filter: '!nR5-t*(cQf',
    sort: 'creation',
    order: 'asc',
    key: '3V0dEoWetO4Py4mcPbv8Xw(('
  };

  running = false;

  /**
   * Create a query string from an object
   *
   * @param object map    The source object
   * @param string prefix String to prefix keys, used in recursion
   *
   * @return string The query string
   */
  function buildQueryString(map, prefix) {
    var key, inner, result = [];
    prefix = prefix || false;
    function getPrefix(key) {
      return prefix ? prefix+'['+key+']' : key;
    }

    for (key in map) {
      if (map.hasOwnProperty(key)) {
        if (typeof map[key] === 'object') {
          inner = buildQueryString(map[key], getPrefix(key));
          if (inner !== '') {
            result.push(inner);
          }
        } else if (typeof map[key] !== 'function') {
          result.push(encodeURIComponent(getPrefix(key)) + '=' + encodeURIComponent(map[key]));
        }
      }
    }

    return '?' + result.join('&');
  }

  function makeAPIUrl() {
    var url, i, query = {};

    for (i in apiBaseQuery) {
      if (apiBaseQuery.hasOwnProperty(i)) {
        query[i] = apiBaseQuery[i];
      }
    }

    query.tagged = opParams.tagged.join(';');
    query.pagesize = opParams.pagesize;
    
    if (opParams.nottagged.length) {
      query.nottagged = opParams.nottagged.join(';');
    }

    url = apiBaseUrl + buildQueryString(query);

    return url;
  }

  function startProcess() {
    var xhr, url, results;

    url = makeAPIUrl();

    xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);

    try {
      dataSet = JSON.parse(xhr.responseText).items;
    } catch (e) {
      return {result: false, message: 'API communication error'};
    }

    totalItems = dataSet.length;
    if (dataSet.length) {
      chrome.tabs.create({url: dataSet.shift().link}, function(tab) {
        workerTab = tab;
      });
      running = true;
      return {result: true};
    }

    return {result: false, message: 'No results returned by API'};
  }

  chrome.extension.onMessage.addListener(function(request, sender, callBack) {
    switch(request.method) {
      case 'startProcess':
        if (running) {
          callBack.call(null, {result: false, message: 'Process already running'})
        } else {
          opParams = request;
          itemsCompleted = 0;

          callBack.call(null, startProcess())
        }
        break;

      case 'stopProcess':
        if (!running) {
          callBack.call(null, {result: false, message: 'Process not running'})
        }

        running = false;
        callBack.call(null, {result: true})
        break;

      case 'queryStatus':
        callBack.call(null, {running: running, done: itemsCompleted, total: totalItems})
        break;

      case 'pageInit':
        chrome.pageAction.show(sender.tab.id);
        if (running && sender.tab && sender.tab.id === workerTab.id) {
          callBack.call(null, opParams)
        }
        break;

      case 'pageComplete':
        itemsCompleted++;
        if (running && dataSet.length) {
          callBack.call(null, dataSet.shift());
        } else {
          running = false;
        }
        break;
    }
  });

}());