const validator = require('validator');

exports.validateUserUpdate = (data) => {
  const errors = {};
  
  if (data.username && !validator.isLength(data.username, { min: 3, max: 30 })) {
    errors.username = 'Username must be between 3 and 30 characters';
  }
  
  if (data.email && !validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio cannot exceed 500 characters';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};