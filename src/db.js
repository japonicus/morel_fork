/***********************************************************************
 * DB MODULE
 *
 * Module responsible for large data management.
 **********************************************************************/

var morel = morel || {};
morel.db = (function (m) {
  "use strict";
  /*global _log, IDBKeyRange*/

  //todo: move to CONF.
  m.DB_VERSION = 1;
  m.DB_MAIN = "morel";
  m.STORE_MAIN = "main";

  /**
   * Opens a database.
   *
   * @param name
   * @param storeName
   * @param callback
   */
  m.open = function (name, storeName, callback) {
    var req = window.indexedDB.open(name, m.DB_VERSION);

    req.onsuccess = function (e) {
      _log("DB: opened successfully.", morel.LOG_DEBUG);
      var db = e.target.result;
      var transaction = db.transaction([storeName], "readwrite");
      var store = transaction.objectStore(storeName);

      if (callback) {
        callback(store);
      }
    };

    req.onupgradeneeded = function (e) {
      _log("DB: upgrading.", morel.LOG_INFO);
      var db = e.target.result;

      db.deleteObjectStore(morel.db.STORE_MAIN);
      db.createObjectStore(morel.db.STORE_MAIN);
    };

    req.onerror = function (e) {
      _log("DB: NOT opened successfully:" + e, morel.LOG_ERROR);
    };

    req.onblocked = function (e) {
      _log("DB: database blocked:" + e, morel.LOG_ERROR);
    };
  };

  /**
   * Adds a record to the database store.
   *
   * @param record
   * @param key
   * @param callback
   */
  m.add = function (record, key, callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log("DB: adding to the store.", morel.LOG_DEBUG);

      store.add(record, key);
      store.transaction.db.close();

      if (callback) {
        callback();
      }
    });
  };

  /**
   * Gets a specific record from the database store.
   *
   * @param key
   * @param callback
   */
  m.get = function (key, callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log('DB: getting from the store.', morel.LOG_DEBUG);

      var result = store.get(key);
      if (callback) {
        callback(result);
      }

    });
  };

  /**
   * Gets all the records from the database store.
   *
   * @param callback
   */
  m.getAll = function (callback) {
    m.open(m.DB_MAIN, m.STORE_MAIN, function (store) {
      _log('DB: getting all from the store.', morel.LOG_DEBUG);

      // Get everything in the store
      var keyRange = IDBKeyRange.lowerBound(0);
      var req = store.openCursor(keyRange);

      var data = [];
      req.onsuccess = function (e) {
        var result = e.target.result;

        // If there's data, add it to array
        if (result) {
          data.push(result.value);
          result.continue();

          // Reach the end of the data
        } else {
          if (callback) {
            callback(data);
          }
        }
      };

    });
  };

  /**
   * Checks if the record exists in the database store.
   *
   * @param key
   * @param callback
   */
  m.is = function (key, callback) {
    //todo: implement
  };

  /**
   * Clears the database store.
   *
   * @param callback
   */
  m.clear = function (callback) {
    m.open(m.DB_MAIN, m.STORE_RECORDS, function (store) {
      _log('DB: clearing store', morel.LOG_DEBUG);
      store.clear();

      if (callback) {
        callback();
      }
    });
  };

  return m;
}(morel.db || {}));