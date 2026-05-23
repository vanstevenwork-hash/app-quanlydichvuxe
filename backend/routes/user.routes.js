const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const userController = require('../controllers/user.controller');

// Admin routes
router.get('/', auth, authorize('admin'), userController.getUsers);
router.get('/:id', auth, authorize('admin'), userController.getUser);
router.put('/:id', auth, authorize('admin'), userController.updateUser);
router.post('/technician', auth, authorize('admin'), userController.createTechnician);

module.exports = router;
