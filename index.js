import express from 'express';
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { queue } from 'async';

const port = process.env.PORT || 80;

const app = express();
const adminkey = "SET_A_SECTET_ADMINISTRSTION_KEY_HERE";

// db.json file path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

// Configure lowdb to write data to JSON file
const adapter = new JSONFile(file);
const defaultData = {
  lists: {
    default: {
      enemyPlayers: [],
      allyPlayers: [],
      enemyClans: [],
      allyClans: []
    }
  }
};
const db = new Low(adapter, defaultData);

// Read data from JSON file, this will set db.data content
// If JSON file doesn't exist, defaultData is used instead
await db.read();
await db.write()

const saveQueue = queue(async () => {
  db.write();
  console.log("Database saved!");
});

app.get('/api/:key', (req, res) => {
  try{
    const key = req.params.key;
    validateKey(key);
    const list = db.data.lists[key];
    if(list===undefined){
      throw new Error("Key doesn't Exist");
    }
    res.status(200).json(list);
  }catch(err){
    res.status(400).send(err.message);
  }
});

app.get('/api/:key/:operation/:id', (req, res) => {
  try{
    const key = req.params.key;
    const operation = req.params.operation;
    const id = req.params.id;
    validateKey(key);
    const list = db.data.lists[key];
    if(list===undefined){
      throw new Error("Key doesn't Exist");
    }
    if(operation==="addAllyPlayer"){
      validateUUID(id);
      const index = list.allyPlayers.indexOf(id);
      if (index === -1) {
        list.allyPlayers.push(id);
      } else {
        throw new Error("This Player is already on this list");
      }
      saveQueue.push();
      res.status(200).json(list);
    }
    else if (operation==="addEnemyPlayer"){
      validateUUID(id);
      const index = list.enemyPlayers.indexOf(id);
      if (index === -1) {
        list.enemyPlayers.push(id);
      } else {
        throw new Error("This Player is already on this list");
      }
      saveQueue.push();
      res.status(200).json(list);
    }
    else if (operation==="addAllyClan"){
      validateClan(id);
      const index = list.allyClans.indexOf(id);
      if (index === -1) {
        list.allyClans.push(id);
      } else {
        throw new Error("This Clan is already on this list");
      }
      saveQueue.push();
      res.status(200).json(list);
    }
    else if (operation==="addEnemyClan"){
      validateClan(id);
      const index = list.enemyClans.indexOf(id);
      if (index === -1) {
        list.enemyClans.push(id);
      } else {
        throw new Error("This Clan is already on this list");
      }
      saveQueue.push();
      res.status(200).json(list);
    }
    else if(operation==="removeAllyPlayer"){
      validateUUID(id);
      const index = list.allyPlayers.indexOf(id);
      if (index > -1) {
        list.allyPlayers.splice(index, 1);
      } else {
        throw new Error("This Player is not on the list");
      }
      saveQueue.push();
      res.status(200).json(list);
    }
    else if (operation==="removeEnemyPlayer"){
      validateUUID(id);
      const index = list.enemyPlayers.indexOf(id);
      if (index > -1) {
        list.enemyPlayers.splice(index, 1);
      } else {
        throw new Error("This Player is not on the list");
      }
      saveQueue.push();
      res.status(200).json(list);
    }
    else if (operation==="removeAllyClan"){
      validateClan(id);
      const index = list.allyClans.indexOf(id);
      if (index > -1) {
        list.allyClans.splice(index, 1);
      } else {
        throw new Error("This Clan is not on the list");
      }
      saveQueue.push();
      res.status(200).json(list);
    }
    else if (operation==="removeEnemyClan"){
      validateClan(id);
      const index = list.enemyClans.indexOf(id);
      if (index > -1) {
        list.enemyClans.splice(index, 1);
      } else {
        throw new Error("This Clan is not on the list");
      }
      saveQueue.push();
      res.status(200).json(list);
    } else {
      throw new Error("Invalid Operation!")
    }
  }catch(err){
    res.status(400).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


function validateUUID(uuid) {
  if (uuid == null) {
    throw new Error('UUID cannot be null or undefined');
  }
  const isValidHex = /^[0-9a-fA-F]{32}$/.test(uuid);
  if (!isValidHex) {
    throw new Error('UUID must be a valid hexadecimal string of length 32');
  }
}

function validateKey(name) {
  if (name == null) {
    throw new Error('List cannot be null or undefined');
  }
  const isValidHex = /^[0-9a-fA-F]{32}$/.test(name);
  if (!(isValidHex || name==="default")) {
    throw new Error('Key must be "default" or a valid hexadecimal string of length 32');
  }
}

function validateClan(str) {
  const regex = /^[1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\-#_.,$&]{2,5}$/;
  if(!regex.test(str)){
    throw new Error("Invalid Clan Tag")
  }
}
