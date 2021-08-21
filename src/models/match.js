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
  },
  gameweek: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

matchSchema.virtual('players', {
  ref: 'Player',
  localField: '_id',
  foreignField: 'match_id'
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
    return matches.map(m => { return [m._id.toString(), m.gameweek, m.home_team, m.home_score, m.away_score, m.away_team, convertFullDateToShort(m.matchday)] })
  } catch (e) {
    return []
  }
}

const Match = mongoose.model('Match', matchSchema)

module.exports = Match
