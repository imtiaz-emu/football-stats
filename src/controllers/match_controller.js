const Match = require('../models/match');
const Player = require('../models/player');
const got = require('got');
const _ = require('lodash');

const comparison = async (params, elements) => {
  const predefinedParametes = ['p_1', 'p_2', 'p_3'];
  const permittedParams = _.pick(params, predefinedParametes);
  const sanitizedParams = _.pickBy(permittedParams, _.identity);
  let analytics = [];

  if (_.isEmpty(sanitizedParams)) {
    return analytics;
  }

  for (const key of Object.keys(sanitizedParams)) {
    const expression = /(?<player>.*)\((?<team>.*)\)/g;
    let [player, team] = [null, null];

    try{
      const expMatch = expression.exec(sanitizedParams[key]);
      [player, team] = Object.values(expMatch.groups);
    }catch{
      return;
    }
    
    if (player == null || team == null) 
      return;

    const element = elements.find(element => {
      if (sanitizedParams[key] == element.name)
        return element;
    })
    
    const playerAnalytics = await fetchPlayerAnalytics(player.trim(), team, element);
    analytics.push(playerAnalytics);
  }

  return analytics;
}

const allElements = async () => {
  const response = await got.get('https://fantasy.premierleague.com/api/bootstrap-static/').then(response => {
    return JSON.parse(response.body);
  }).catch(error => {
    return {};
  });

  return response;
}

const allPlayers = async () => {
  const response = await allElements();

  try {
    const players = await formattedPlayers(response.elements, response.teams);
    return players;
  } catch {
    return {};
  }
}

const formattedPlayers = async (elements, teams) => {
  let players = [];
  elements.forEach(async (element) => {
    if (ignoringFaultyName(element.web_name)){
      return;
    }

    let teamName = teams.find(team => team.id == element.team).short_name;
    let sanitizedName = sanitizePlayerName(element.web_name);
    let displayName = `${sanitizedName} (${teamName})`;
    let originalName = `${element.web_name} (${teamName})`;
    players.push({ 
      "name": originalName, "saves": element.saves, 
      "cs": element.clean_sheets, "price": element.now_cost, 
      "form": element.form, "threat": element.threat,
      "ict_index": element.ict_index, "influence": element.influence, 
      "code": element.code, "display": displayName 
    })
  })

  return players;
}

const fetchPlayerAnalytics = async (player_name, team, element) => {
  let analytics = await Player.aggregate([
    { 
        $match: {
            "player_name": { $regex: player_name, $options: "i" }, "stats.team": team
        }
    },{
        $group: {
          _id: player_name,
          min_played: { $sum: { '$toInt': "$stats.min_played" } },
          assists: { $sum: { '$toInt': "$stats.assist_potential.total_assists" } },
          chances_created: { $sum: { '$toInt': "$stats.assist_potential.chances_created" } },
          big_chances_created: { $sum: { '$toInt': "$stats.assist_potential.big_chances_created" } },
          attempts: { $sum: { '$toInt': "$stats.goal_threat.attempts.inbox_shot" } },
          goals: { $sum: { '$toInt': "$stats.expected.goals" } },
          xA: { $avg: { '$toDouble': "$stats.expected.xA" } },
          xG: { $avg: { '$toDouble': "$stats.expected.xG" } }
        }
    },{ 
        $addFields: { 
            xG: { $round: [ "$xG", 2 ] }, 
            xA: { $round: [ "$xA", 2 ] },
            team: team 
        } 
    }
  ])

  // In case, the player is not debuted in PL, then data will be empty
  if(analytics.length == 0){
    analytics[0] = defaultAnalytics(player_name, team);
  }

  analytics[0]['clean_sheets'] = element.cs;
  analytics[0]['saves'] = element.saves;
  analytics[0]['influence'] = element.influence;
  analytics[0]['threat'] = element.threat;
  analytics[0]['ict_index'] = element.ict_index;
  analytics[0]['form'] = element.form;
  analytics[0]['price'] = parseFloat(element.price)/10.0;
  analytics[0]['photo'] = `https://resources.premierleague.com/premierleague/photos/players/110x140/p${element.code}.png`;
  
  return analytics[0];
}

const sanitizePlayerName = (name) => {
  name = name.replace(/[????]/g, "a")
              .replace(/[??????]/g, "o")
              .replace(/[????]/g, "A")
              .replace(/[??????]/g, "O")
              .replace(/??/g, "L")
              .replace(/??/g, "l")
              .replace(/[????]/g, "U")
              .replace(/[????]/g, "u")
              .replace(/[????]/g, "C")
              .replace(/[????]/g, "c")
              .replace(/??/g, "G")
              .replace(/??/g, "g")
              .replace(/??/g, "S")
              .replace(/??/g, "s")
              .replace(/??/g, "b")
              .replace(/[??????]/g, "i")
              .replace(/[??????]/g, "I")
              .replace(/??/g, "e")
              .replace(/??/g, "E")
              .replace(/??/g, "N")
              .replace(/??/g, "n")
  
  return name;
}

const ignoringFaultyName = (name) => {
  const ignoringChars = ['[', ']', '~', '{', '}', '#', '@', '!', '^', '*'];
  return ignoringChars.some(char => name.includes(char));
}

const defaultAnalytics = (playerName, team) => {
  return {
    _id: playerName, min_played: 0, assists: 0,
    chances_created: 0, big_chances_created: 0,
    attempts: 0, goals: 0, xG: 0.00, xA: 0.00, 
    team: team
  }
}

module.exports = {
  comparison,
  allPlayers
}
