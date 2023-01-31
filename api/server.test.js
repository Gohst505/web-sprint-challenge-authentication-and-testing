// Write your tests here
const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server');
const bcrypt = require('bcrypt');



test('[0] sanity', () => {
  expect(true).toBe(true)
  expect(process.env.NODE_ENV).toBe('testing')
})

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

beforeEach(async () => {
  await db('users').truncate();
})

afterAll(async () => {
  await db.destroy();
})

const dummyUser = {username: 'New User', password: 'Password'};

describe('[Post] Register endpoint testing', () => {
  test('[1] Successfully registers new users', async () => {
    const res = await request(server).post('/api/auth/register').send(dummyUser)
    expect(res.body).toMatchObject({username: dummyUser.username})
    expect(res.status).toEqual(201)
     
  }, 750)

  test('[2] Returns proper error message when username or password are wrong', async () => {
    const noPass = await request(server).post('/api/auth/register').send({username: 'New User'})
    expect(noPass.body).toMatchObject({message: /username and password required/i})
    
    const noUser  = await request(server).post('/api/auth/register').send({password: 'Password'})
    expect(noUser.body).toMatchObject({message: /username and password required/i})
    
    const blankUser = await request(server).post('/api/auth/register').send({})
    expect(blankUser.body).toMatchObject({message: /username and password required/i})
  }, 750)
})

describe('[Post] Testing Login Endpoints', () => {
  test('[3] Successfully logs in and returns valid token', async () => {
    await request(server).post('/api/auth/register').send(dummyUser)

    const login = await request(server).post('/api/auth/login').send(dummyUser)
    expect(login.body).toMatchObject({message: `welcome, ${dummyUser.username}`})
  }, 750)

  test('[4] Unable to login without correct username, password, and token', async () => {
    await request(server).post('/api/auth/register').send(dummyUser)

    const invalidUsername = await request(server).post('/api/auth/login').send({username: 'Fake User', password: 'Password'})
    expect(invalidUsername.body).toMatchObject({message: 'invalid credentials'})
  

  const invalidPassword = await request(server).post('/api/auth/login').send({username: 'New User', password: 'pa55w0rd'})
  expect(invalidPassword.body).toMatchObject({message: 'invalid credentials'})
}, 750)
})

describe('[GET] Testing Joke Endpoints', () => {
  test('[5] gets all jokes when user is logged in', async () => {
    await request(server).post('/api/auth/register').send(dummyUser)
    await request(server).post('/api/auth/login').send(dummyUser)
    
    .then(async (res) => {
      const jokes = await request(server).get('/api/jokes').set({Authorization: res.body.token})
      expect (jokes.body).not.toBeNull();
      expect(jokes.body).toHaveLength(3);
    })
  }, 750)

  test('[6] return an error message if user is not logged in', async () => {
    const jokesError = await request(server).get('/api/jokes');
    expect(jokesError.body).toMatchObject({message: 'token required'})
    expect(jokesError.status).toEqual(401)
  }, 750)
})