//
// APNQueries.js — APNRS
// today is 11/13/12, it is now 04:42 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var mysqlConnector = require('mysql'),
    util = require('util'),
    sqlTagsQueue = require("function-queue")();
//Definitions
var APNDeviceDatabaseMysqlKey = "apnrs_devices",
    APNTagsDatabaseMysqlKey = "apnrs_tags",
    APNDeviceTagsDatabaseMysqlKey = "apnrs_devices_tags",
    APNDeviceRegisterDatabaseMysqlKey = "apnrs_devices_register" ;
module.exports = function () { return new APNQueries(); }
function APNQueries() { }


/**
* Create or Update device into database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.createUpdate = function createUpdate(connection,active,token,tags,startDateGMT,endDateGMT,deviceBadge,callback) {
  var strQuery = util.format('INSERT INTO %s (active,token,silentStartGMT,silentEndGMT,deviceBadge) VALUES (%s,\'%s\',\'%s\',\'%s\',%s) ON DUPLICATE KEY UPDATE active=%s,token=\'%s\',silentStartGMT=\'%s\',silentEndGMT=\'%s\',deviceBadge=%s ',APNDeviceDatabaseMysqlKey,active,token,startDateGMT,endDateGMT,deviceBadge,active,token,startDateGMT,endDateGMT,deviceBadge);
  var instance = this;
  //Insert Device
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes are necessary and it really exists on DB)
      if (result.insertId == 0) {
        instance.getDeviceByToken(connection,'\''+token+'\'',function (okay,responseSelect) {
          if (okay) { callback(true,responseSelect['id']); }
          else { callback(false,result); }
        });
      }else { callback(true,result.insertId); }
    } 
    else { callback(false,result); }
  });
} 

/**
* Unregister(update) device into database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.unregister = function unregister(connection,token,callback) {
  var strQuery = util.format('UPDATE %s SET active=0,token=\'%s\'',APNDeviceDatabaseMysqlKey,token);
  var instance = this;
  //Insert Device
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { 
      //Check if not inserted and not updated (because no changes are necessary and it really exists on DB)
      if (result.insertId == 0) {
        instance.getDeviceByToken(connection,'\''+token+'\'',function (okay,responseSelect) {
          if (okay) { callback(true,responseSelect['id']); }
          else { callback(false,result); }
        });
      }else { callback(true,result.insertId); }
    } 
    else { callback(false,result); }
  });
} 
/**
* Get object in DB and fill object
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String value - value to be searched by key - REQUIRED
* @param String key - key to be match the value - REQUIRED
* @param String database - database name to be used in querys - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.errored - if filled okay (false) or with errored (true).
* @param String callback.resp - response string when convinient.
* 
**/
APNQueries.prototype.getObjetctInDB = function getObjetctInDB(connection,key,value,database,callback) {
  var strQuery = util.format('SELECT * FROM %s WHERE %s=%s',database,key,value);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result[0]) { callback(true,result[0]); }
    else { callback(false,err); }
  });
}
/**
* Get device by token in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String token - device token to be searched - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.errored - if filled okay (false) or with errored (true).
* @param String callback.resp - response string when convinient.
* 
**/
APNQueries.prototype.getDeviceByToken = function getDeviceByToken(connection,token,callback) {
  this.getObjetctInDB(connection,'token',token,APNDeviceDatabaseMysqlKey,callback);
}
/**
* List Devices in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the devices (resgitration order) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listDevices = function listDevices(connection,order,callback) {
  var strQuery = util.format('SELECT `active`,`token`,`silentStartGMT`,`silentEndGMT`,`deviceBadge`,`lastRegisterDate` FROM `%s` ORDER BY `lastRegisterDate` %s ',APNDeviceDatabaseMysqlKey,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(true,result); }
    else { callback(false,err); }
  });
}
/**
* List Active Devices in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the devices (resgitration order) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listActiveDevices = function listActiveDevices(connection,order,callback) {
  var strQuery = util.format('SELECT `active`,`token`,`silentStartGMT`,`silentEndGMT`,`deviceBadge`,`lastRegisterDate` FROM `%s` WHERE `active`=1 ORDER BY `lastRegisterDate` %s ',APNDeviceDatabaseMysqlKey,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(true,result); }
    else { callback(false,err); }
  });
}
/**
* List Active Devices With tags associated with DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Array(string) tags - tags name that devices must have - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listActiveDevicesWithTags = function listActiveDevicesWithTags(connection,tags,callback) {
  var instance = this;
  //Fetch tags with that name
  this.listFullTagsByName(connection,'ASC',tags,function (err,tagsID) {
    if ((!err || err == null) && tagsID) {
      if (tagsID.length <= 0) {
        instance.associatedDevicesWithTagsID(connection,tagsID,function (err2,devicesID) {
          if ((!err2 || err2 == null) && devicesID) {
            if (devicesID.length <= 0) {
              //Get device for WHERE clause
              var deviceQuery = '';
              for (device in devicesID) {
                if (deviceQuery.length > 0) { deviceQuery += (' OR `id`='+devicesID[device]); }
                else { deviceQuery += ('`id`='+devicesID[device]); }
              }
              //
              var strQuery = util.format('SELECT * FROM %s WHERE %s',APNDeviceDatabaseMysqlKey,deviceQuery);
              var query = connection.query(strQuery, function(err3, result) {
                if ((!err3 || err3 == null) && result[0]) { callback(true,result[0]); }
                else { callback(false,err3); }
              });
            }else { callback(false,'no devices found with respective tags'); }
          }else { callback(false,err2); }
        });
      }else { callback(false,'no tags found with respective names'); }
    }else { callback(false,err); }
  });
}  
/**
* Log Device register call
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Integer deviceID - device ID on database that registered - REQUIRED
* @param Integer registering - if device is registering (true) or unregistering (false) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.logRegister = function logRegister(connection,deviceID,registering,callback) {
  var strQuery = util.format('INSERT INTO %s (deviceID,registering) VALUES (%s,%s)',APNDeviceRegisterDatabaseMysqlKey,deviceID,registering);
  var instance = this;
  //Insert Device
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result.insertId != undefined) { callback(true,result.insertId); } 
    else { callback(false,result); }
  });
} 
/**
* List Register Datapoints in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Date startDate - date to start datapoints of registering and unregistering
* @param Date endDate - date to end datapoints of registering and unregistering
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listRegisterCalls = function listRegisterCalls(connection,startDate,endDate,callback) {
  var strQuery = util.format('SELECT `deviceID`,`registering`,`createDate` FROM `%s` WHERE `createDate` BETWEEN \'%s\' AND \'%s\' ',APNDeviceRegisterDatabaseMysqlKey,startDate,endDate);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(true,result); }
    else { callback(false,err); }
  });
} 




/**
* Create or Update tag into database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Array tags - array of string to create tags with - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.createUpdateTags = function createUpdateTags(connection,tags,callback) {
  var current = 0, 
      lenght = (tags ? tags.length : 0),
      ids = [],
      instance = this;
  for (tag in tags) {
    sqlTagsQueue.push(function (nextTag) {
      var strQuery = util.format('INSERT INTO %s (tag) VALUES (\'%s\') ON DUPLICATE KEY UPDATE tag=\'%s\'',APNTagsDatabaseMysqlKey,tags[tag],tags[tag]);
        var query = connection.query(strQuery, function(err, result) { 
          current = current+1;
          if ((!err || err == null) && result.insertId != undefined) { 
            //Check if not inserted and not updated (because no changes are necessary and it really exists on DB)
            if (result.insertId == 0) {
              instance.getObjetctInDB(connection,'tag','\''+tags[current-1]+'\'',APNTagsDatabaseMysqlKey,function (okay,responseSelect) {
                if (okay) /* Fetched tag */ { 
                  ids.push(responseSelect['id']);
                  if (lenght == current) { callback(true,ids); }
                  nextTag();
                } 
                else /* Error in fetching existing tag */ { 
                  if (lenght == current) { callback(false,responseSelect); } 
                  nextTag(); 
                }
              });
            } else /* Inserted new tag */ { 
              ids.push(result.insertId);
              if (lenght == current) { callback(true,ids); }
              nextTag();
            }
          } else /* Errored in inserting new tag */ { 
            if (lenght == current) { callback(false,err); }
            nextTag();
          }
        });
    });
  }
  if (!tags || tags.length==0) { callback(true,null); }
}  
/**
* Associate Device with Tag in database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String deviceID - device ID on database to associated tags with - REQUIRED
* @param String tagIDs - tags ID on database to associated the device with - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.associateDeviceWithTag = function associateDeviceWithTag(connection,deviceID,tagIDs,callback) {
  var current = 0, lenght = (tagIDs ? tagIDs.length : 0);
  for (tagID in tagIDs) {
    var strQuery = util.format('INSERT INTO %s (deviceID,tagID) VALUES (%s,%s) ON DUPLICATE KEY UPDATE deviceID=%s,tagID=%s',APNDeviceTagsDatabaseMysqlKey,deviceID,tagIDs[tagID],deviceID,tagID);
    var query = connection.query(strQuery, function(err, result) { 
      current = current+1;
      if ((!err || err == null) && result.insertId != undefined) { 
        if (lenght == current) { callback(true,null); }
      } else if (lenght == current) { callback(false,err); }
    });
  }
  if (!tagIDs || tagIDs.length==0) { callback(true,null); }
} 
/**
* Associated Devices with Tags ID in database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String tagIDs - tags ID on database to associated the device with - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.associatedDevicesWithTagsID = function associatedDevicesWithTagsID(connection,tagIDs,callback) {
  //Get tags WHERE clause
  var tagsQuery = '';
  for (tag in tagIDs) {
    if (tagsQuery.length > 0) { tagsQuery += (' OR `tagID`='+tagIDs[tag]); }
    else { tagsQuery += ('`tagID`='+tagIDs[tag]); }
  }
  if (!tagIDs || tagIDs.length==0) { callback(true,null); return; }
  //
  var strQuery = util.format('SELECT * FROM %s WHERE %s',APNDeviceTagsDatabaseMysqlKey,tagsQuery);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result[0]) { callback(true,result[0]); }
    else { callback(false,err); }
  });
} 
/**
* Clean Tags by device in database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String deviceID - device ID on database to clean that tags associated with - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.cleanTagsOfDevice = function cleanTagsOfDevice(connection,deviceID,callback) {
  if (deviceID) {
   var strQuery = util.format('DELETE FROM %s WHERE deviceID=%s',APNDeviceTagsDatabaseMysqlKey,deviceID);
    var query = connection.query(strQuery, function(err, result) {
        if (!err || err == null) { callback(true,null); }
        else { callback(false,err); }
    }); 
  }else { callback(true,null); }
}
/*
* Clean not used Tags in database
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
**/
APNQueries.prototype.cleanUnusedTags = function cleanUnusedTags(connection,callback) {
  var strQuery = util.format('DELETE a FROM %s a WHERE a.id NOT IN ( SELECT b.tagID FROM %s b )',APNTagsDatabaseMysqlKey,APNDeviceTagsDatabaseMysqlKey);
  var query = connection.query(strQuery, function(err, result) {
    if (!err || err == null) { callback(true,null); }
    else { callback(false,err); }
  });
}    
/**
* List Tags in DB (Full Mode)
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the tags (resgitration order) - REQUIRED
* @param Array(string) tags - tags name to be fetched
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listFullTagsByName = function listFullTagsByName(connection,order,tags,callback) {
  //Get tags WHERE clause
  var tagsQuery = '';
  for (tag in tags) {
    if (tagsQuery.length > 0) { tagsQuery += (' OR `tag`='+tags[tag]); }
    else { tagsQuery += ('`tag`='+tags[tag]); }
  }
  //
  var strQuery = util.format('SELECT * FROM `%s` WHERE %s ORDER BY `createDate` %s ',APNTagsDatabaseMysqlKey,tagsQuery,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(true,result); }
    else { callback(false,err); }
  });
}   
/**
* List Tags in DB
* @param ConnectionObj connection - mysql connection object created by 'defaultDatabaseConnection' function - REQUIRED
* @param String order - order to listed the tags (resgitration order) - REQUIRED
* @param Function callback - function callback - REQUIRED
* @param Boolean callback.okay - if filled okay (true) or with errored (false).
* @param String callback.resp - response string|obj when convinient.
* 
**/
APNQueries.prototype.listTags = function listTags(connection,order,callback) {
  var strQuery = util.format('SELECT `tag`,`createDate` FROM `%s` ORDER BY `createDate` %s ',APNTagsDatabaseMysqlKey,order);
  var query = connection.query(strQuery, function(err, result) {
    if ((!err || err == null) && result && result.length > 0) { callback(true,result); }
    else { callback(false,err); }
  });
} 





/*Private Database functions*/
APNQueries.prototype.defaultDatabaseConnection = function defaultDatabaseConnection(databaseInfo,successCb,errorCb) {
  var mysqlOptions = databaseInfo;
  var connection = mysqlConnector.createConnection(mysqlOptions);
  var errorCount = 0;
  function handleDisconnect(connection) {
    connection.on('error', function(err) {
      errorCount++;
      if (errorCount >= 3) {
        connection.destroy();
      }else {
        console.log('re-connecting lost mysql connection: '+err.stack); 
        connection = mysqlConnector.createConnection(mysqlOptions);
        handleDisconnect(connection);
        var connectionTimeout = setTimeout(function () { connection.destroy(); },10000);
        connection.connect(function(err) {
          if (err) console.log(err);
          clearTimeout(connectionTimeout);
        });
      }
    });
  }
  handleDisconnect(connection);
  var connectionTimeout = setTimeout(function () { connection.destroy(); },1000);
  connection.connect(function(err) {
    if (err) { console.log(err); errorCb('Error in connecting to mysql database: '+err); }
    else { successCb(connection); }
    clearTimeout(connectionTimeout);
  });
}