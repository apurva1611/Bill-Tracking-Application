const passwordValidator = require('password-validator');
var validator = require("email-validator");

exports.checkemail = (email) => {
  return validator.validate(email); 
};

exports.checkPassword = (password) => {
    // Create a schema
    var schema = new passwordValidator();
    // Add properties to it
    schema
    .is().min(9)                                    // Minimum length 9
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
    
    // Validate against a password string
     return schema.validate(password);
    
}