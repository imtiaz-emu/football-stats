def player(page_source, stats_type, stats):
  if stats_type == 'involvement':
    stats = involvement(page_source, stats)
  elif stats_type == 'expected':
    stats = expected(page_source, stats)
  elif stats_type == 'keeping':
    stats = keeping(page_source, stats)
  elif stats_type == 'distribution':
    stats = distribution(page_source, stats)
  elif stats_type == 'goal_threat':
    stats = goal_threat(page_source, stats)

  return stats


def involvement(page_source, stats):
  for indx, row_data in enumerate(page_source.find_elements_by_css_selector('td'), start=0):
    # 2nd column of the table contains team name
    if indx == 1:
      stats['team'] = row_data.get_attribute('innerText').strip()
    # 3rd column of the table contains player fpl price
    if indx == 2:
      stats['price'] = row_data.get_attribute('innerText').strip()
    if indx == 4:
      stats['min_played'] = row_data.get_attribute('innerText').strip()
    if indx == 5:
      stats['touches']['total'] = row_data.get_attribute('innerText').strip()
    if indx == 6:
      stats['touches']['opp_half'] = row_data.get_attribute('innerText').strip()
    if indx == 7:
      stats['touches']['final_3rd'] = row_data.get_attribute('innerText').strip()
    if indx == 8:
      stats['touches']['min_per_touch'] = row_data.get_attribute('innerText').strip()
    if indx == 9:
      stats['passes']['total'] = row_data.get_attribute('innerText').strip()
    if indx == 10:
      stats['passes']['opp_half'] = row_data.get_attribute('innerText').strip()
    if indx == 11:
      stats['passes']['final_3rd'] = row_data.get_attribute('innerText').strip()
    if indx == 12:
      stats['passes']['mins_per_pass'] = row_data.get_attribute('innerText').strip()

  return stats


def expected(page_source, stats):
  for indx, row_data in enumerate(page_source.find_elements_by_css_selector('td')):
    if indx == 3:
      stats['expected']['assists'] = row_data.get_attribute('innerText').strip()
    if indx == 4:
      stats['expected']['xA'] = row_data.get_attribute('innerText').strip()
    if indx == 7:
      stats['expected']['goals'] = row_data.get_attribute('innerText').strip()
    if indx == 8:
      stats['expected']['xG'] = row_data.get_attribute('innerText').strip()
    if indx == 11:
      stats['expected']['xGI'] = row_data.get_attribute('innerText').strip()
    if indx == 12:
      stats['expected']['xGI_delta'] = row_data.get_attribute('innerText').strip()

  return stats

def keeping(page_source, stats):
  for indx, row_data in enumerate(page_source.find_elements_by_css_selector('td')):
    if indx == 6:
      stats['keeping']['saves'] = row_data.get_attribute('innerText').strip()
    if indx == 7:
      stats['keeping']['goals_concede'] = row_data.get_attribute('innerText').strip()
    if indx == 10:
      stats['keeping']['pen_saves'] = row_data.get_attribute('innerText').strip()

  return stats

def distribution(page_source, stats):
  for indx, row_data in enumerate(page_source.find_elements_by_css_selector('td')):
    if indx == 15:
      stats['assist_potential']['chances_created'] = row_data.get_attribute('innerText').strip()
    if indx == 16:
      stats['assist_potential']['big_chances_created'] = row_data.get_attribute('innerText').strip()
    if indx == 17:
      stats['assist_potential']['assists'] = row_data.get_attribute('innerText').strip()
    if indx == 18:
      stats['assist_potential']['fantasy_assists'] = row_data.get_attribute('innerText').strip()
    if indx == 19:
      stats['assist_potential']['total_assists'] = row_data.get_attribute('innerText').strip()

  return stats

def goal_threat(page_source, stats):
  stats['goal_threat']['attempts'], stats['goal_threat']['conversion'] = {}, {}

  for indx, row_data in enumerate(page_source.find_elements_by_css_selector('td')):
    if indx == 5:
      stats['goal_threat']['pen_touches'] = row_data.get_attribute('innerText').strip()
    if indx == 12:
      stats['goal_threat']['attempts']['total'] = row_data.get_attribute('innerText').strip()
    if indx == 13:
      stats['goal_threat']['attempts']['inbox_shot'] = row_data.get_attribute('innerText').strip()
    if indx == 14:
      stats['goal_threat']['attempts']['total_big_chances'] = row_data.get_attribute('innerText').strip()
    if indx == 15:
      stats['goal_threat']['attempts']['headed_big_chances'] = row_data.get_attribute('innerText').strip()
    if indx == 16:
      stats['goal_threat']['attempts']['shots_on_target'] = row_data.get_attribute('innerText').strip()
    if indx == 17:
      stats['goal_threat']['attempts']['min_per_chance'] = row_data.get_attribute('innerText').strip()
    if indx == 18:
      stats['goal_threat']['conversion']['shot_accuracy'] = row_data.get_attribute('innerText').strip()
    if indx == 19:
      stats['goal_threat']['conversion']['goal_conversion'] = row_data.get_attribute('innerText').strip()

  return stats


def build_player_stats(page_source):
  players = []
  categories = ['touches', 'passes', 'expected', 'keeping', 'assist_potential', 'goal_threat']

  for player_involvement in page_source.find_elements_by_css_selector('#player-tabs-2 tbody tr'):
    for indx, row_data in enumerate(player_involvement.find_elements_by_css_selector('td')):
      if indx == 0:
        player_name = row_data.find_element_by_css_selector('.enhanced-title').get_attribute('innerText').strip()
        stats = {}
        stats[player_name] = {}
        for category in categories:
          stats[player_name][category] = {}
        players.append(stats)

  return players


def filter_player_by_name(players, player_name):
  filter_players = list(filter(lambda player: list(player.keys())[0] == player_name, players))

  if len(filter_players) > 0:
    return filter_players[0]
  else:
    return None