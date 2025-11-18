import { hashPassword, verifyPassword, generateSalt } from './passwordUtils';

const USERS_STORAGE_KEY = 'carpool_users';
const CURRENT_USER_KEY = 'current_user';

// Initialize users storage if it doesn't exist
const initializeUsersStorage = () => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all users from localStorage
const getUsers = () => {
  initializeUsersStorage();
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return JSON.parse(usersJson || '[]');
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Register a new user
export const registerUser = async (userData) => {
  const { name, email, password, userType } = userData;

  // Validate input
  if (!name || !email || !password) {
    throw new Error('All fields are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if user already exists
  const users = getUsers();
  const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const salt = generateSalt();
  const hashedPassword = await hashPassword(password, salt);

  // Create new user object
  const newUser = {
    id: Date.now().toString(), // Simple ID generation
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    salt,
    userType: userType === 'driver' ? 'DRIVER' : 'PASSENGER',
    createdAt: new Date().toISOString(),
  };

  // Add user to storage
  users.push(newUser);
  saveUsers(users);

  // Return user data without password
  const { password: _, salt: __, ...userWithoutPassword } = newUser;
  return {
    user: userWithoutPassword,
    message: 'Registration successful',
  };
};

// Login user
export const loginUser = async (email, password, expectedUserType = null) => {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password, user.salt);
  
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Check user type if specified
  if (expectedUserType) {
    const expectedType = expectedUserType.toUpperCase();
    if (user.userType !== expectedType) {
      throw new Error(`This account is not registered as a ${expectedUserType.toLowerCase()}`);
    }
  }

  // Save current user to localStorage (without password)
  const { password: _, salt: __, ...userWithoutPassword } = user;
  
  // Add session timestamp
  const userWithSession = {
    ...userWithoutPassword,
    sessionStartTime: new Date().toISOString(),
  };
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithSession));

  // Generate a simple token (in a real app, this would be from the backend)
  const token = btoa(`${user.id}:${Date.now()}`);
  localStorage.setItem('token', token);
  
  // Store session info
  localStorage.setItem('session_active', 'true');

  return {
    user: userWithoutPassword,
    token,
    message: 'Login successful',
  };
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('session_active');
  localStorage.removeItem('user'); // Also remove the old user key for compatibility
};

// Get current user
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem(CURRENT_USER_KEY);
};

// Get user by ID (useful for other parts of the app)
export const getUserById = (userId) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  const { password: _, salt: __, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

