const mongoose = require('mongoose');

// to start mongo locally: `brew services start mongodb/brew/mongodb-community`
mongoose.connect('mongodb://localhost:27017/ffpb_stats_prod', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then((result) => {
  console.log("Connect to local mongo database successfully!");
}).catch((error) => {
  console.log("Unable to connect local mongo database!" + error);
});
