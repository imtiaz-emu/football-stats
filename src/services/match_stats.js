const path = require('path')
const exec = require("child_process").execSync;

const scriptPath = path.join(__dirname, '../../scripts/ffs_bot.py')

const scrap_ffs_data = (match_id) => {
  const result = exec(`python3 ${scriptPath} ${match_id} ${process.env.FFS_USERNAME} ${process.env.FFS_PASSWORD}`)
  return result.toString()
}

module.exports = scrap_ffs_data