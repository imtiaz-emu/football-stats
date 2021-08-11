const mongoose = require('mongoose');
const Player = require('../models/player')
const _ = require('lodash');

const matchSchema = mongoose.Schema({
  ffs_match_id: {
    type: String,
    required: true,
    trim: true
  },
  away_score: {
    type: String,
    required: true,
    trim: true
  },
  home_score: {
    type: String,
    required: true,
    trim: true
  },
  away_team: {
    type: String,
    required: true,
    trim: true
  },
  home_team: {
    type: String,
    required: true,
    trim: true
  },
  matchday: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
})

matchSchema.virtual('players', {
  ref: 'Player',
  localField: '_id',
  foreignField: 'player_id'
})

function convertStringToDate(string) {
  let newmatchday = string.replace(/(rd|th|nd|st)/, '');
  return Date.parse(newmatchday)
}

function convertFullDateToShort(dateAsString) {
  return new Date(dateAsString).toLocaleString().split(',')[0]
}

matchSchema.statics.saveMatchAndPlayerStats = async (data) => {
  const requiredParams = Object.keys(Match.schema.tree)
  const permittedParams = _.pick(data, requiredParams)

  if (_.isEmpty(permittedParams)) {
    return { error: 'Match data not found' }
  }

  try {
    const match = new Match()

    Object.keys(permittedParams).forEach((key) => {
      if (key == 'matchday') {
        match[key] = convertStringToDate(permittedParams[key])
      }
      else if (key != 'players') {
        match[key] = permittedParams[key]
      }
    })
    await match.save()

    permittedParams['players'].forEach(async (player) => {
      await Player.create({ player_name: player.Player, stats: player.Stats, match_id: match._id })
    })

    return match
  } catch (e) {
    console.log(e)
    return { error: 'Unable to save match data' }
  }
}

matchSchema.methods.toJSON = function () {
  const match = this
  const matchObject = match.toObject()

  return matchObject
}

matchSchema.statics.allMatchesAsDataset = async () => {
  try {
    const matches = await Match.find({})
    return matches.map(m => { return [m._id.toString(), m.home_team, m.home_score, m.away_team, m.away_score, convertFullDateToShort(m.matchday)] })
  } catch (e) {
    return []
  }
}

/*
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, 'This is my secure Key');

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next();
});

userSchema.post('remove', async function (user, next) {
  await Task.deleteMany({ user_id: user._id })

  next();
});
*/

const Match = mongoose.model('Match', matchSchema)

module.exports = Match
