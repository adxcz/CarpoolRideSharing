// Function to hash a password using SHA-256 with a salt
const hashPassword = async (password, salt = '') => {
  // Combine password with salt
  const saltedPassword = password + salt;
  
  // Encode the salted password as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(saltedPassword);
  
  try {
    // Generate the hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert the hash to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    return hashHex;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

// Function to verify a password against a hash
const verifyPassword = async (password, hashedPassword, salt = '') => {
  const hashed = await hashPassword(password, salt);
  return hashed === hashedPassword;
};

// Generate a simple salt (for demonstration - in production, use a more secure method)
const generateSalt = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export { hashPassword, verifyPassword, generateSalt };
