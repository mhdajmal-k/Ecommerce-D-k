function generateOrderNumber() {
    let now = Date.now().toString(); // Get current Unix time in milliseconds
    now += now + Math.floor(Math.random() * 10); // Add a random digit as padding
    return [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join('-'); // Format the order number (4-6-4)
  }

module.exports=
  generateOrderNumber