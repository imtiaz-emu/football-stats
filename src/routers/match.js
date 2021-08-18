const express = require('express');
const router = express.Router();
const Match = require('../models/match');
const scrap_ffs_data = require('../services/match_stats');
const basicAuth = require('express-basic-auth');

const authentication = basicAuth({
  users: {
    'admin': 'password'
  },
  challenge: true,
  realm: 'Imb4T3st4pp'
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
    res.redirect(`/matches/${match.ffs_match_id}`)
  } else {
    req.flash('notice', match.error);
    res.redirect('/matches/new')
  }
})

router.get('/matches/:id', async (req, res) => {
  try {
    const match = await Match.findOne({ ffs_match_id: req.params.id });
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

router.delete('/matches/:id', async (req, res) => {
  try {
    res.status(200).send({})
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router