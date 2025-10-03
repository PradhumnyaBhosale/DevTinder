

const validateEditProfile = (req) => {

  const allowedUpdates = [
    'firstName', 
    'lastName', 
    'email', 
    'age',
    'about',
    'skills',
    'photourl'
]; 
 
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    console.log(isValidOperation);

    return isValidOperation;
   
    
}

module.exports = validateEditProfile;