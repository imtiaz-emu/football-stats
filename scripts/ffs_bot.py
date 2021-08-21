'''
Python: > 3.7
Author: Md Imtiaz Hossain Emu
About: Fantasy Football Scout - match stats scrapper
'''

from selenium import webdriver
from time import sleep
from pathlib import Path
import os, json, sys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from constants import constants
from player_stats import player, build_player_stats
from timeit import default_timer as timer

class FFS_BOT():

  def __init__(self, match_id, ffs_username, ffs_password):
    # settings for chrome driver, need to change for server
    webdriver_path = '/usr/bin/chromedriver'
    self.browser = webdriver.Chrome(webdriver_path, options=self.chrome_driver_options())
    # add 'implicitly_wait' just to give N seconds time to to load full page with all plugins and assets
    # self.browser.implicitly_wait(3)
    self.match_id = match_id.strip()
    self.ffs_username = ffs_username.strip()
    self.ffs_password = ffs_password.strip()
    self.player_stats = []

  def login_to_ffs(self):
    ffs_login_url = 'https://members.fantasyfootballscout.co.uk/'

    self.browser.get(ffs_login_url)

    try:
      element = WebDriverWait(self.browser, 20).until(
        EC.presence_of_element_located((By.ID, "username"))
      )

      if "Page Not Found" in self.browser.page_source:
        self.browser.quit()
        print(json.dumps({'error': "Unable to login to FFS website"}))
        return

      username_input = self.browser.find_element_by_xpath("//input[@name='username']")
      password_input = self.browser.find_element_by_xpath("//input[@name='password']")

      username_input.send_keys(self.ffs_username)
      password_input.send_keys(self.ffs_password)
      password_input.send_keys(Keys.ENTER)
    except Exception as e:
      self.browser.quit()
      print(json.dumps({'error': "Unable to scrap data from FFS website"}))
      return


  def collect_page_data(self):
    match_stats_url = 'https://members.fantasyfootballscout.co.uk/matches/{m_id}/'.format(m_id=self.match_id)
    # The following is a sample match stats page collected and saved as html locally to extract data without hitting the ffs server
    # match_stats_url = 'file:///Users/imtiaz/Etectra/work/ffpb-stats/scripts/match_stats.html'
    try:
      self.browser.get(match_stats_url)

      element = WebDriverWait(self.browser, 120).until(
        EC.presence_of_element_located((By.TAG_NAME, "h1"))
      )
      
      if "Page Not Found" in self.browser.page_source:
          self.browser.quit()
          print(json.dumps({'error': "Please provide a valid Match ID"}))
          return

      self.player_stats = build_player_stats(self.browser)
      self.match_data = {}
    
      self.extract_data_from_page()
      self.extract_game_data_from_page()
      self.player_stats = self.format_stats()
      self.match_data['players'] = self.player_stats

      result = json.dumps(self.match_data)
      
      self.browser.quit()
      print(result)
    except Exception as e:
      self.browser.quit()
      print(json.dumps({'error': "Unable to scrap data from FFS website"}))


  def extract_data_from_page(self):
    for player_stat in self.player_stats:
      player_name = list(player_stat.keys())[0]

      for tab_id, tab_type in constants.items():
        for player_involvement in self.browser.find_elements_by_css_selector('{tab_id} tbody tr'.format(tab_id=tab_id)):
          row_player_name = player_involvement.find_element_by_css_selector('td .enhanced-title').get_attribute('innerText').strip()
          if row_player_name == player_name:
            player_stat[player_name] = player(player_involvement, tab_type, player_stat[player_name])
            break

  def extract_game_data_from_page(self):
    try:
      teams = self.browser.find_element_by_css_selector('.section h1').get_attribute('innerText').strip()          
      score = self.browser.find_element_by_css_selector('.matches.score td .score').get_attribute('innerText').strip()
      date = self.browser.find_element_by_css_selector('.matches.score td .date').get_attribute('innerText').strip()          
      self.match_data['home_team'], self.match_data['away_team'] = teams.split('vs')
      self.match_data['home_score'], self.match_data['away_score'] = score.split('-')
      self.match_data['matchday'] = date
      self.match_data['ffs_match_id'] = self.match_id
      self.match_data['gameweek'] = self.browser.find_element_by_tag_name("label[for='game-id']").get_attribute('innerText').split(' ')[-1].replace(':', '')
    except Exception as e:
      print(e)


  def format_stats(self):
    formatted_stats = []

    for player_stat in self.player_stats:
      player_name = list(player_stat.keys())[0]
      player_stats_data = list(player_stat.values())[0]
      formatted_stats.append({'Player': player_name, 'Stats': player_stats_data})

    return formatted_stats

  def chrome_driver_options(self):
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--always-authorize-plugins')
    return chrome_options

  def save_page_as_file(self, data, file_name = 'match_stats.html'):
    file_path = str(Path(__file__).resolve().parent) + '/' + file_name

    with open(file_path, "w") as f:
      f.write(data)


bot = FFS_BOT(sys.argv[1], sys.argv[2], sys.argv[3])
bot.login_to_ffs()
sleep(3)
bot.collect_page_data()
