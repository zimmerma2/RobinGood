var express = require('express');
var router = express.Router();

// Require controllers
var story_controller = require('../controllers/storyController');

/* GET Story page. */
router.get('/:id([a-z0-9]+)', story_controller.story_detail);

/* GET Stories page. */
router.get('/list', story_controller.story_list);

/* GET New Story page. */
router.get('/new', story_controller.story_new_get);

/* POST to Add Story Service */
router.post('/add', story_controller.story_new_post);

/* GET Edit Story page. */
router.get('/:id([a-z0-9]+)/update', story_controller.story_update_get);

/* POST to Edit Story page. */
router.post('/:id([a-z0-9]+)/update', story_controller.story_update_post);

/* POST to Delete Story */
router.post('/:id([a-z0-9]+)/delete', story_controller.story_delete);

module.exports = router;
