// Tanzanian phone number validation
export const validatePhoneNumber = (phone) => {
  // Remove spaces and common separators
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Check for Tanzanian format: +2557XXXXXXXX or 07XXXXXXXX
  const tzRegex = /^(\+255|0)?7[0-9]{8}$/;
  
  if (!tzRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid Tanzanian phone number (e.g., +255712345678 or 0712345678)'
    };
  }
  
  // Normalize to +255 format
  const normalizedPhone = cleanPhone.startsWith('+255') 
    ? cleanPhone 
    : cleanPhone.startsWith('0') 
      ? '+255' + cleanPhone.substring(1)
      : '+255' + cleanPhone;
  
  return {
    isValid: true,
    normalizedPhone
  };
};

// Name validation
export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters long'
    };
  }
  
  if (name.trim().length > 50) {
    return {
      isValid: false,
      error: 'Name must be less than 50 characters'
    };
  }
  
  // Only allow letters, spaces, and hyphens
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens and apostrophes'
    };
  }
  
  return {
    isValid: true,
    normalizedName: name.trim()
  };
};

// License plate validation (Tanzanian format)
export const validatePlateNumber = (plate) => {
  if (!plate || plate.trim().length < 3) {
    return {
      isValid: false,
      error: 'Please enter a valid license plate number'
    };
  }
  
  // Common TZ formats: T 123 ABC, T123ABC, etc.
  const plateRegex = /^[A-Za-z]{1,3}\s*\d{1,4}\s*[A-Za-z]{0,3}$/i;
  if (!plateRegex.test(plate.trim())) {
    return {
      isValid: false,
      error: 'Please enter a valid Tanzanian license plate (e.g., T 123 ABC)'
    };
  }
  
  return {
    isValid: true,
    normalizedPlate: plate.trim().toUpperCase()
  };
};

// Email validation (optional field)
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  
  return {
    isValid: true,
    normalizedEmail: email.trim().toLowerCase()
  };
};

// Form validation helper
export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, validation] of Object.entries(fields)) {
    if (!validation.isValid) {
      errors[fieldName] = validation.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

// Display error message
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || null;
};

export const hasFieldError = (errors, fieldName) => {
  return !!errors[fieldName];
};
