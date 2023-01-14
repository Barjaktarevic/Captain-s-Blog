const express = require('express')
const router = express.Router()
const { get_blog, get_events, get_galaxies, get_homepage, get_random_blog, get_titlepage, post_blog, post_comment, update_draft, delete_blog, delete_comment, compose_and_show_logs, get_contact, get_about} = require('../controllers/ViewsController')

router.get('/', get_titlepage)

router.get('/home', get_homepage)

router.get('/contact', get_contact)

router.get('/about', get_about)

router.get('/randomblog', get_random_blog)

router.get('/contact', get_contact)

router.get('/logs/:id', get_blog)
router.delete('/logs/:id', delete_blog)
router.post('/logs/:id', post_comment)

router.delete('/logs/comments/:id', delete_comment)

router.get('/jump/:galaxy/logs/:event', compose_and_show_logs)
router.post('/jump/:galaxy/logs/:event', post_blog)
router.put('/jump/:galaxy/logs/:event', update_draft)


router.get('/jump', get_galaxies)

router.get('/jump/:galaxy', get_events)
  
module.exports = router