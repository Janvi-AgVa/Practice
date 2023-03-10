
        const mongoose = require('mongoose');
        const device = require('./device')
        const logs = require('./logs')
              
              const schemaOptions = {
                  timestamps: true,
                  toJSON: {
                      virtuals: false
                  },
                  toObject: {
                      virtuals: false
                  }
              }
              
              const dvtpump_collectionSchema = new mongoose.Schema(
                  {
                    version: {
                      type: String,
                      required: [true, 'Log version is required.']
                  },
                  type: {
                    type: String,
                    enum: ["001","002"],
                    required: [true, "Atleast one model required."]
                  },
                  device:{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
                  log:logs
                  },
                  schemaOptions
                  )
  
                  dvtpump_collectionSchema.index({'type': 1})
                  
                  const dvtpump_collection = mongoose.model('dvtpump_collection', dvtpump_collectionSchema)
                  
                  module.exports = dvtpump_collection
                  