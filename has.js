const bcrypt = require("bcryptjs");

const password = "Baguswidodo"; // ganti dengan password yang kamu mau

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log("Hashed password:", hash);
});
