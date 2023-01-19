
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
              
              const agvaproventilators_collectionSchema = new mongoose.Schema(
                  {
                    version: {
                      type: String,
                      required: [true, 'Log version is required.']
                  },
                  type: {
                    type: String,
                    enum: ["undefined","002","003","004","005","006","007","008","009","0010","0011"],
                    required: [true, "Atleast one model required."]
                  },
                  device:{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
                  log:logs
                  },
                  schemaOptions
                  )
  
                  agvaproventilators_collectionSchema.index({'type': 1})
                  
                  const agvaproventilators_collection = mongoose.model('agvaproventilators_collection', agvaproventilators_collectionSchema)
                  
                  module.exports = agvaproventilators_collection
                  