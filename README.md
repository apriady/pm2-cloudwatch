# pm2-cloudwatch

## Description

Based on `@blacksquareca/pm2-cloudwatch` module, with some aditional feature (auto set region & use instanceid as logStreamName based on EC2 metadata).

PM2 module to forwards pm2 logs to [AWS Cloudwatch](https://aws.amazon.com/). You will need to provide a aws key and secret with write access to cloudwatch logs(if used outside AWS environment).

## Install

- `pm2 install apriady/pm2-cloudwatch`

## Configure

- `logGroupName` : Your Log Group to write to 
- `logStreamName` : The stream within the Log Group
- `awsRegion` : Region to log (i.e. us-east-1)
- `awsAccessKeyId` : AWS access key with write cloudwatch logs permissions
- `awsSecretKey` : AWS secret

#### How to set this value ?

 After having installed the module you have to type :
- `pm2 set @blacksquareca/pm2-cloudwatch:logGroupName [logname]`
- `pm2 set @blacksquareca/pm2-cloudwatch:logStreamName [streamname]`
- `pm2 set @blacksquareca/pm2-cloudwatch:awsRegion [aws region]`
- `pm2 set @blacksquareca/pm2-cloudwatch:awsAccessKeyId [aws key]`
- `pm2 set @blacksquareca/pm2-cloudwatch:awsSecretKey [aws secret]`



## Uninstall

- `pm2 uninstall apriady/pm2-cloudwatch`