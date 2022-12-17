const axios = require("axios");
require("dotenv/config");

const validateUsers = async (users) => {
  try {
    const handleList = users.join(";");
    await axios.get(
      `https://codeforces.com/api/user.info?handles=${handleList}`
    );
    return 1;
  } catch (err) {
    console.log(err.response.data.comment);
    return err.response.data.comment;
  }
};

module.exports = {
  validateUsers,
};
