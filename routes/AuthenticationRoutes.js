const express = require('express')
const router = express.Router()
const { get_signup, get_login, get_user, post_login, post_logout, post_signup, update_user, update_user_avatar } = require('../controllers/AuthenticationController')


router.get('/signup', get_signup)
router.post('/signup', post_signup)

router.get('/login', get_login)
router.post('/login', post_login)

router.post('/logout', post_logout);

router.get('/users/:rank-:username', get_user)
router.put('/users/:rank-:username', update_user)
router.put('/users/:rank-:username/avatar', update_user_avatar)

module.exports = router



