const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  url: {
    type: String,
  },
  title: {
    type: String,
  },
});
certificateSchema.set('timestamps', true);

const Certificate = mongoose.model('certificate', certificateSchema);
module.exports = Certificate;
