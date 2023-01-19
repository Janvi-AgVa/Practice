
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
          
          const insulindevice_collectionSchema = new mongoose.Schema(
              {
                  version: {
                      type: String,
                      required: [true, 'Log version is required.']
                  },
                  type: {
                    type: String,
                    enum: ["001"],
                    required: [true, "Atleast one model required."]
                  },
                  device:{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
                  log:logs
              },
              schemaOptions
          )
  
          insulindevice_collectionSchema.index({'type': 1})
                  
          const insulindevice_collection = mongoose.model('insulindevice_collection', insulindevice_collectionSchema)
          
          module.exports = insulindevice_collection
          