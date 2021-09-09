# [NORACLE STATS](https://noraclestats.com)

NoracleStats is a English Premier league based match by match statistics platform; designed and maintained by FFPB [Fantasy Football Players of Bangladesh](https://www.facebook.com/groups/fanfootybd/).


#### Technology:

  - NodeJS version 12.x+
  - Python version 3.7+ 
  - Google Chrome
  - ChromeWebdriver

#### Installation

  - Clone the repo. Run `npm install`
  - Inside project directory: create a `.env` file. Put 3 environment variables: 
    1. FFS_USERNAME=<YOUR_FFS_USERNAME>
    2. FFS_PASSWORD=<YOUR_FFS_PASSWORD>
    3. ADMIN_PASSWORD=<PASSWORD_FOR_BASIC_AUTH>
  - Remember: _Google Chrome_ version and _ChromeDriver_ version must be same. Current Google Chrome is 92. So, download ChromeDriver version 92 and install.     
  - In `scripts/ffs_bot.py` file, line #23, change the webdriver path based on your local machine's webdriver path.
  - Run the project using `npm run dev`.
  - navigate to `http://localhost:8000`. 