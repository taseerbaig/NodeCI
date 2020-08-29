const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;


mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify( options.key || '');
  return this;
}

mongoose.Query.prototype.exec = async function () {
  if(!this.useCache){
    console.log('Usecache function')
    return exec.apply(this , arguments);
  }

  const key =JSON.stringify( Object.assign( {} , this.getQuery() , {
    collection : this.mongooseCollection.name
  }));

  const cachevalue = await client.hget(this.hashKey , key);

  if(cachevalue){
    const doc = JSON.parse(cachevalue);
    console.log('Cached Data: ', doc);
    return Array.isArray(doc) 
      ? doc.map(d => new this.model(d))//array
      : new this.model(doc); //object
  }

  const result = await exec.apply(this , arguments);
  
  client.hmset(this.hashKey ,key , JSON.stringify(result) , 'EX' , 10);

  return result;
}

module.exports = {
  clearHash(hashKey){
    client.del(JSON.stringify(hashKey));
  }
}