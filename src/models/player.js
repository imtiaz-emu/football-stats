const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Match'
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

playerSchema.methods.toJSON = function () {
  const player = this;
  const playerObject = player.toObject();

  return playerObject;
}

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
