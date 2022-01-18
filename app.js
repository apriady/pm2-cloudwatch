'use strict';
const winston = require('winston');
const WinstonCloudWatch = require("winston-cloudwatch");

const pm2 = require('pm2');
const pmx = require('pmx');
const os = require("os");

const http = require('http');
async function request(method, url, token = null) {
    // const dataString = JSON.stringify(data)
  
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Length': dataString.length,
      },
      timeout: 1500, // in ms
    }

    if(token) {
        options.headers['X-aws-ec2-metadata-token'] = token
    } else {
        options.headers['X-aws-ec2-metadata-token-ttl-seconds'] = 21600
    }
  
    return new Promise((resolve, reject) => {
      const req = http.request(url, options, (res) => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          return reject(new Error(`HTTP status code ${res.statusCode}`))
        }
  
        const body = []
        res.on('data', (chunk) => body.push(chunk))
        res.on('end', () => {
          const resString = Buffer.concat(body).toString()
          resolve(resString)
        })
      })
  
      req.on('error', (err) => {
        reject(err)
      })
  
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request time out'))
      })
  
    //   req.write(dataString)
      req.end()
    })
}
(async ()=>{
    let region, instanceid
    try {
        const token = await request('PUT', "http://169.254.169.254/latest/api/token")
        region = await request('GET', "http://169.254.169.254/latest/meta-data/placement/region", token)
        instanceid = await request('GET', "http://169.254.169.254/latest/meta-data/instance-id", token)   
        console.log(`Auto set region to: ${region} and logStreamName to: ${instanceid}`)
    } catch (error) {
        console.log("NOT USING AWS")
    }

    pmx.initModule({
        widget: {
            logo: 'https://a0.awsstatic.com/libra-css/images/logos/aws_smile-header-desktop-en-white_59x35@2x.png',
            theme: ['#141A1F', '#222222', '#3ff', '#3ff'],
            el: {
                probes: false,
                actions: false
            },
            block: {
                actions: false,
                issues: false,
                meta: false,
            }
        }
    }, function (err, conf) {
        const loggerObj = {};
        const log = function (level, name, message, packet) {
            name = name.trim();
            if (name === 'pm2-cloudwatch' || name === 'pm2-auto-pull') {
                return;
            }
            if (!loggerObj[name]) {
                loggerObj[name] = createLogger(name);
            }
            loggerObj[name][level](message);
        };
    
        const createLogger = function (program) {
    
            return new winston.createLogger({            
                transports: [
                  // transport
                  new (WinstonCloudWatch)({
                    logGroupName: conf.logGroupName,
                    logStreamName: instanceid || conf.logStreamName,
                    awsRegion: region || conf.awsRegion,
                    awsAccessKeyId: conf.awsAccessKeyId,
                    awsSecretKey: conf.awsSecretKey
                  })]
              });
        };
    
        // 
    
        pm2.connect(function () {
            console.log('info', 'PM2: forwarding to Cloudwatch');
            pm2.launchBus(function (err, bus) {
                bus.on('log:out', function (packet) {
                    log('info', packet.process.name, packet.data, packet);
                });
                bus.on('log:err', function (packet) {
                    log('error', packet.process.name, packet.data, packet);
                });
            });
        });
    });
})();