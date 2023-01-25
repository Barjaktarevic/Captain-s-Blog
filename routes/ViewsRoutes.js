const express = require('express')
const router = express.Router()
const { get_blog, get_events, get_galaxies, get_homepage, get_random_blog, get_titlepage, post_blog, post_comment, update_draft, delete_blog, delete_comment, compose_and_show_logs, get_contact, get_about, update_comment, get_privacy_policy, get_faqs } = require('../controllers/ViewsController')
const isLoggedIn = require('../utils/isLoggedIn')

router.get('/', get_titlepage)

router.get('/home', get_homepage)

router.get('/contact', get_contact)

router.get('/about', get_about)

router.get('/randomblog', get_random_blog)

router.get('/contact', get_contact)

router.get('/privacy-policy', get_privacy_policy)
router.get('/faqs', get_faqs)

router.get('/logs/:id', isLoggedIn, get_blog)
router.delete('/logs/:id', isLoggedIn, delete_blog)
router.post('/logs/:id', isLoggedIn, post_comment)

router.delete('/logs/comments/:id', isLoggedIn, delete_comment)

router.get('/jump/:galaxy/logs/:event', isLoggedIn, compose_and_show_logs)
router.post('/jump/:galaxy/logs/:event', isLoggedIn, post_blog)
router.put('/jump/:galaxy/logs/:event', isLoggedIn, update_draft)


router.get('/jump', get_galaxies)

router.get('/jump/:galaxy', get_events)

module.exports = router