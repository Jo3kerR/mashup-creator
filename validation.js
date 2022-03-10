const axios = require("axios");
require("dotenv/config");

async function validateUsers(users) {
  try {
    // remove all solved problems
    const handleList = users.join(";");
    await axios.get(
      `https://codeforces.com/api/user.info?handles=${handleList}`
    );
    return 1;
  } catch (err) {
    console.log(err.response.data.comment);
    return err.response.data.comment;
  }
}

async function validateRatings(ratings) {
  for (const rating of ratings) {
    if (rating % 100 !== 0 || rating < 800 || rating > 3500) {
      return "Please enter valid rating(s)";
    }
  }
  return 1;
}

module.exports = {
  validateUsers,
  validateRatings,
};
