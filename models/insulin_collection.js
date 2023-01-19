
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
          
          const insulin_collectionSchema = new mongoose.Schema(
              {
                  version: {
                      type: String,
                      required: [true, 'Log version is required.']
                  },
                  type: {
                    type: String,
                    enum: ["001","002","003","004","005"],
                    required: [true, "Atleast one model required."]
                  },
                  device:{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
                  log:logs
              },
              schemaOptions
          )
  
          insulin_collectionSchema.index({'type': 1})
                  
          const insulin_collection = mongoose.model('insulin_collection', insulin_collectionSchema)
          
          module.exports = insulin_collection
          