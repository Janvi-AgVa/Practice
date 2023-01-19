const fs = require('fs');
const Projects = require('../models/project');
const { getDaysArray } = require('../helper/helperFunctions');
const Device = require('../models/device');
const Email = require('../utils/email');
const decompress = require('decompress');
const { validationResult } = require('express-validator');

const createLogsV2 = async (req, res) => {
    try {
      const { project_code } = req.params;
      // check project exist or not
      console.log(project_code)
      const findProjectWithCode = await Projects.findOne({ code: project_code });
   
      if (!findProjectWithCode) {
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Project not found',
              msg: 'Project not found',
              type: 'Validation Error',
            },
          },
        });
      }
  
      const collectionName = findProjectWithCode.collection_name;
  
      const modelReference = require(`../models/${collectionName}`);
  
      const d = new Date();
  
      if (req.contentType === 'json') {
        const { version, type, log, device } = req.body;
  
        const Dvc = await new Device({
          did: device.did,
          name: device.name,
          manufacturer: device.manufacturer,
          os: {
            name: device.os.name,
            type: device.os.type,
          },
          battery: device.battery,
        });
  
        const isDeviceSaved = await Dvc.save(Dvc);
  
        if (!isDeviceSaved) {
          res.status(500).json({
            status: 0,
            data: {
              err: {
                generatedTime: new Date(),
                errMsg: 'Device not saved',
                msg: 'Device not saved',
                type: 'MongodbError',
              },
            },
          });
        }
  
        if (!log.msg) {
          return res.status(400).json({
            status: 0,
            data: {
              err: {
                generatedTime: new Date(),
                errMsg: 'Log message is required',
                msg: 'Log message is required',
                type: 'ValidationError',
              },
            },
          });
        }
  
        const putDataIntoLoggerDb = await new modelReference({
          version: version,
          type: type,
          device: isDeviceSaved._id,
          log: {
            file: log.file,
            date: log.date || d.toISOString(),
            filePath: '',
            message: decodeURI(log.msg),
            type: log.type,
          },
        });
  
        const isLoggerSaved = await putDataIntoLoggerDb.save(putDataIntoLoggerDb);
  
        if (!isLoggerSaved) {
          return res.status(500).json({
            status: 0,
            data: {
              err: {
                generatedTime: new Date(),
                errMsg: 'Project not saved',
                msg: 'Project not saved',
                type: 'Internal Server Error',
              },
            },
          });
        } else {
          var sentEmails = [];
          var sentEmailErrArr = [];
          var sentEmailErrMsgArr = [];
  
          if (log.type == 'error' && findProjectWithCode.reportEmail.length) {
            let emailPromise = findProjectWithCode.reportEmail.map((email) => {
              const url = `${log.msg}`;
              // console.log(url)
              return new Email(email, url).sendCrash();
            });
  
            sentEmails = await Promise.allSettled(emailPromise);
  
            sentEmails.length
              ? sentEmails.map((sentEmail) => {
                  sentEmailErrArr.push(sentEmail.status);
                  if (sentEmail.status === 'rejected') {
                    sentEmailErrMsgArr.push(sentEmail.reason.message);
                  }
                })
              : sentEmailErrArr,
              (sentEmailErrMsgArr = []);
          }
  
          res.status(201).json({
            status: 1,
            data: {
              crashEmail:
                log.type === 'error'
                  ? {
                      status: sentEmailErrArr.includes('rejected') ? 0 : 1,
                      errMsg: sentEmailErrMsgArr.length
                        ? sentEmailErrMsgArr.join(' | ')
                        : '',
                      msg: sentEmailErrMsgArr.length
                        ? `Error sending ${sentEmailErrMsgArr.length} out of ${sentEmails.length} log(s)`
                        : 'Email(s) sent successfully.',
                    }
                  : {},
            },
            message: 'Successful',
          });
        }
      } else if (req.contentType === 'formData') {
        const files = await decompress(
          req.file.path,
          `./public/uploads/${req.body.did}`
        );
  
        // Delete zip file after unzipping it
        fs.unlinkSync(`./${req.file.path}`);
  
        console.log('files length: ', files.length);
        const Dvc = await new Device({
          did: req.body.did,
          name: req.body.deviceName,
          manufacturer: req.body.manufacturer,
          os: {
            name: req.body.osName,
            type: req.body.osType,
          },
          battery: req.body.battery,
        });
  
        const isDeviceSaved = await Dvc.save(Dvc);
  
        if (!isDeviceSaved) {
          return res.status(500).json({
            status: 0,
            data: {
              err: {
                generatedTime: new Date(),
                errMsg: 'Device not saved',
                msg: 'Device not saved',
                type: 'MongodbError',
              },
            },
          });
        }
  
        let s3Promise =
          files.length &&
          files.map((file) => {
            const fileContent = fs.readFileSync(
              `${__dirname}/../public/uploads/${req.body.did}/${file.path}`
            );
            // Setting up S3 upload parameters
            const params = {
              Bucket: process.env.S3_BUCKET,
              Key: `${req.body.did}/${file.path}`,
              Body: fileContent,
            };
            console.log('params', params);
            return s3.upload(params).promise();
          });
  
        let fileNamePromise =
          files.length &&
          files.map(async (file) => {
            console.log(file.path);
            let putDataIntoLoggerDb = await new modelReference({
              version: req.body.version,
              type: req.body.type,
              device: isDeviceSaved._id,
              log: {
                file: file.path,
                date: d.toISOString(),
                filePath: `${req.body.did}/${file.path}`,
                message: '',
                type: 'error',
              },
            });
            return putDataIntoLoggerDb.save(putDataIntoLoggerDb);
          });
  
        let s3Response = await Promise.allSettled(s3Promise);
        let logs = await Promise.allSettled(fileNamePromise);
  
        var logsErrArr = [];
        var logsErrMsgArr = [];
  
        logs.length &&
          logs.map((log) => {
            logsErrArr.push(log.status);
            if (log.status === 'rejected') {
              logsErrMsgArr.push(log.reason.message);
            }
          });
  
        if (!logsErrArr.includes('fulfilled')) {
          return res.status(400).json({
            status: logsErrMsgArr.length === logs.length ? -1 : 0,
            data: {
              err: {
                generatedTime: new Date(),
                errMsg: logsErrMsgArr.join(' | '),
                msg: `Error saving ${logsErrMsgArr.length} out of ${logs.length} log(s)`,
                type: 'ValidationError',
              },
            },
          });
        } else {
          var s3ResponseStatus = [];
          var emailPromise = [];
          var sentEmails = [];
          var sentEmailErrArr = [];
          var sentEmailErrMsgArr = [];
  
          if (findProjectWithCode.reportEmail.length) {
            emailPromise = findProjectWithCode.reportEmail.map((email) => {
              logs.map((log) => {
                const url = `${log.value.log.filePath}`;
                return new Email(email, url).sendCrash();
              });
            });
  
            sentEmails = await Promise.allSettled(emailPromise);
  
            sentEmails.length
              ? sentEmails.map((sentEmail) => {
                  sentEmailErrArr.push(sentEmail.status);
                  if (sentEmail.status === 'rejected') {
                    sentEmailErrMsgArr.push(sentEmail.reason.message);
                  }
                })
              : sentEmailErrArr,
              (sentEmailErrMsgArr = []);
          }
  
          s3ResponseStatus =
            s3Response.length && s3Response.map((s3Res) => s3Res.status);
  
          // Delete Files after saving to DB and S3
          if (!s3ResponseStatus.includes('rejected')) {
            files.length &&
              files.map(async (file) => {
                fs.unlinkSync(
                  path.join('public', 'uploads', `${req.body.did}/${file.path}`)
                );
              });
          }
  
          res.status(201).json({
            status: 1,
            data: {
              crashEmail: sentEmails.length
                ? {
                    status:
                      sentEmailErrArr.length &&
                      sentEmailErrArr.includes('rejected')
                        ? 0
                        : 1,
                    errMsg: sentEmailErrMsgArr.length
                      ? sentEmailErrMsgArr.join(' | ')
                      : '',
                    msg: sentEmailErrMsgArr.length
                      ? `Error sending ${sentEmailErrMsgArr.length} out of ${sentEmails.length} log(s)`
                      : 'Email(s) sent successfully.',
                  }
                : {},
            },
            message: 'Successful',
          });
        }
      }
    } catch (err) {
      return res.status(500).json({
        status: -1,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: err.stack,
            msg: err.message,
            type: err.name,
          },
        },
      });
    }
  };
  module.exports = {
    createLogsV2
  }  