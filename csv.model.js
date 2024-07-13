const { Schema, model } = require("mongoose");

const schema = new Schema({
    username: String,
    password: String,
    mobile: String,
});

module.exports = model("data_schema", schema, "data_schema");
