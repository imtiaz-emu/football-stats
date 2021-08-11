const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  player_name: {
    type: String,
    required: true,
    trim: true
  },
  stats: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
