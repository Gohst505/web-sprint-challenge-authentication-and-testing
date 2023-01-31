const db = require('../../data/dbConfig');

function checkUserIsValid(req, res, next) {
    const {username, password} = req.body

    if(typeof username != 'string' || username.trim() === '' || typeof password != 'string' || !password || password.trim() === ''){
        next({status: 401, message: "username and password required"})
    }

    req.user = {
        username: username.trim(),
        password
    }
    next()
}

//Checks database to see if a username is available
async function checkUsernameFree(req, res, next) {
    const taken = await db('users').select('username').where({username: req.user.username})
    if(taken.length != 0){
        next({status: 400, message: "username taken"})
    }
    next()
}

module.exports = {
    checkUserIsValid,
    checkUsernameFree
}