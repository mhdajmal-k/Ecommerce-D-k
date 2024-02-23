const { v4: uuidv4 } = require('uuid');

function generateProductId() {
  return uuidv4();
}

// Example usage
const productId = generateProductId();
console.log(productId);

module.exports=generateProductId