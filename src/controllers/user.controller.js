import User from '../models/user.model.js';

/**
 * @desc    Get all users
 * @route   GET /users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /users/:id
 * @access  Private
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json({
        message: 'User retrieved successfully',
        data: user
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user
 * @route   PUT /users/:id
 * @access  Private
 */
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // If password is provided, it will be hashed in the pre-save hook
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Only admin can change admin status
    if (req.user.isAdmin && req.body.isAdmin !== undefined) {
      user.isAdmin = req.body.isAdmin;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'User updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent deletion of admin users by checking both request user and target user
      if (user.isAdmin) {
        return res.status(400).json({ message: 'Cannot delete admin user' });
      }

      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 