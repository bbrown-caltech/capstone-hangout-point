var express = require('express');
var router = express.Router();

module.exports = router;

/***
 * Get Health Status
 */
 router.get('/', function(req, res) {
    res.status(200).json({
        message: 'Service is alive...'
    });
});
