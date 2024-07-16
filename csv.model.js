const { Schema, model } = require("mongoose");

const schema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
});

module.exports = model("data_schema", schema, "data_schema");
