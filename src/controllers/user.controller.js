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
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.department = req.body.department || user.department;
    user.position = req.body.position || user.position;
    user.bio = req.body.bio || user.bio;
    
    // Update skills if provided
    if (req.body.skills) {
      user.skills = req.body.skills;
    }

    // If password is provided, it will be hashed in the pre-save hook
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Only admin can change role
    if (req.user.role === 'admin' && req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'User updated successfully',
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        employeeId: updatedUser.employeeId,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        position: updatedUser.position,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        avatar: updatedUser.avatar
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
      if (user.role === 'admin') {
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