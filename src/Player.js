const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: String,
  wcl_id: Number,
  raids: Array,
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;