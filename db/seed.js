const client = require("./client.js");
const { createUser } = require('./adapters/users');
const { createRoutines } = require('./adapters/routines');
const { users, routines } = require("./seedData");

async function dropTables() {
  console.log("Dropping tables");
  try {
    await client.query(`DROP TABLE IF EXISTS routineactivities;`);
    await client.query(`DROP TABLE IF EXISTS activities;`);
    await client.query(`DROP TABLE IF EXISTS routines;`);
    await client.query(`DROP TABLE IF EXISTS users;`);
    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
  }
}

async function createTables() {
  console.log("Creating tables");
  try {
    await client.query(`
    CREATE TABLE users(
        id SERIAL PRIMARY KEY, 
        username TEXT UNIQUE NOT NULL, 
        password TEXT NOT NULL
    );

    CREATE TABLE routines(
        id SERIAL PRIMARY KEY,
        "creator_id" INTEGER REFERENCES users(id),
        is_public BOOLEAN DEFAULT false,
        name VARCHAR(255) NOT NULL,
        goal TEXT NOT NULL
        );

    CREATE TABLE activities(
        id SERIAL PRIMARY KEY, 
        name VARCHAR(255) UNIQUE NOT NULL, 
        description TEXT NOT NULL
    );

    CREATE TABLE routineactivities(
        id SERIAL PRIMARY KEY, 
        routine_id INTEGER UNIQUE REFERENCES routines(id),
        activity_id INTEGER UNIQUE REFERENCES activities(id),
        duration INTEGER NOT NULL, 
        count INTEGER NOT NULL
    );
    `);
  } catch (error) {
    console.error(error);
  }
}

async function populateTables() {
  console.log("Populating tables");
  try {
    for(const user of users){
    const createdUser = await createUser(user)
    console.log(createdUser)
    }
    for(const routine of routines){
      const createdRoutine = await createRoutines(routine)
      console.log(createdRoutine)
    }
  } catch (error) {
    console.error(error);
  }
}

async function rebuildDb() {
  client.connect();
  try {
    await dropTables();
    await createTables();
    await populateTables();
  } catch (error) {
    console.error(error);
  } finally {
    client.end();
  }
}

rebuildDb();
