const express = require('express')
const router = express.Router()
const Match = require('../models/match');
const scrap_ffs_data = require('../services/match_stats')

router.get('/', async (req, res) => {
  const matches = await Match.allMatchesAsDataset()
  // console.log(matches)
  res.render('matches/index', {
    title: 'FFPB-Stats',
    matches: matches
  })
})

router.get('/matches/new', async (req, res) => {
  res.render('matches/form', {
    title: 'Match Statistics',
    formUrl: '/matches',
    method: 'post'
  })
})

router.post('/matches', async (req, res) => {
  const jsonData = scrap_ffs_data(req.body.match_id)
  // let jsonData = require('../../scripts/match_stats.json');
  const match = await Match.saveMatchAndPlayerStats(jsonData)
  
  if(match.error == undefined){
    res.redirect(`/matches/${match._id}`)
  }else{
    res.redirect('/matches/new')
  }
})

router.get('/matches/:id', async (req, res) => {
  try {
    res.status(200).send({})
  } catch (e) {
    res.status(500).send(e)
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