const express = require('express');
const router = express.Router();
const Match = require('../models/match');
const scrap_ffs_data = require('../services/match_stats');
const basicAuth = require('express-basic-auth');
const matchController = require('../controllers/match_controller');

const realm = (Math.random() + 1).toString(36).substring(2);
const adminPass = process.env.ADMIN_PASSWORD;

const authentication = basicAuth({
  users: { 'admin': adminPass },
  challenge: true,
  realm: realm,
  unauthorizedResponse: {
    message: 'Bad credentials',
  }
});

router.get('/matches/new', authentication, async (req, res) => {
  res.render('matches/form', {
    notice: req.flash('notice'),
    title: 'Fetcher: Match Statistics',
    formUrl: '/matches',
    method: 'post'
  })
})

router.get('/', async (req, res) => {
  const matches = await Match.allMatchesAsDataset()

  res.render('matches/index', {
    notice: req.flash('notice'),
    title: 'All Matches: Results',
    matches: matches
  })
})

router.post('/matches', async (req, res) => {
  const jsonData = scrap_ffs_data(req.body.match_id);
  const jsonObject = JSON.parse(jsonData);

  if (jsonObject.error != undefined) {
    req.flash('notice', jsonObject.error);
    return res.redirect('/matches/new')
  }

  const match = await Match.saveMatchAndPlayerStats(jsonObject);

  if (match.error == undefined) {
    req.flash('notice', 'Successfully fetched FFS match data.');
    res.redirect(`/matches/${match._id}`)
  } else {
    req.flash('notice', match.error);
    res.redirect('/matches/new')
  }
})

router.get('/matches/:id', async (req, res) => {
  try {
    const match = await Match.findOne({ _id: req.params.id });
    await match.populate('players').execPopulate();

    if (!match) {
      req.flash('notice', 'Match ID not found.');
      return res.redirect('/')
    }

    res.render('matches/show', {
      notice: req.flash('notice'),
      title: `Statistics: ${match.home_team} v ${match.away_team}`,
      match: match,
      players: match.players
    })
  } catch (e) {
    console.log(e);
    req.flash('notice', 'Something went wrong. Try again later.');
    return res.redirect('/');
  }
})

router.get('/comparison', async (req, res) => {
  try {
    const players = await matchController.allPlayers();
    const player_stats = await matchController.comparison(req.query, players);
    
    res.render('matches/comparison', {
      title: 'Player Comparison',
      players: JSON.stringify(players),
      player_stats: player_stats
    })
  } catch (e) {
    console.log(e)
    req.flash('notice', 'Something went wrong. Try again later.');
    return res.redirect('/');
  }
})

module.exports = router