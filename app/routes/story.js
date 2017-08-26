var express = require('express');
var router = express.Router();
var multer = require('multer');

// Require controllers
var story_controller = require('../controllers/storyController');

//TODO place this in a better location
//Only accept images
// const imageFilter = function (req, file, cb) {
//     // accept image only
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };

var upload = multer({
  dest: 'temp/',
  limits: {fileSize: 1000000, files:1}
  // fileFilter: imageFilter
});

/* GET Story page. */
router.get('/:id([a-z0-9]+)', story_controller.story_detail);

/* GET Stories page. */
router.get('/list', story_controller.story_list);

/* GET New Story page. */
router.get('/new', story_controller.story_new_get);

/* POST to Add Story Service */
router.post('/add', upload.single('thumbnail'), story_controller.story_new_post);

/* GET Edit Story page. */
router.get('/:id([a-z0-9]+)/update', story_controller.story_update_get);

/* POST to Edit Story page. */
router.post('/:id([a-z0-9]+)/update', story_controller.story_update_post);

/* POST to Delete Story */
router.post('/:id([a-z0-9]+)/delete', story_controller.story_delete);

module.exports = router;
