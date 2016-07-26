const {app, Menu, Tray} = require('electron')
const AWS = require('aws-sdk')
const AWSIoT = require('aws-iot-device-sdk')

AWS.config.region = 'us-east-1'
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:660c4e29-81e5-4f2c-8603-d830dcebd7e7'
})

let mqttClient = AWSIoT.device({
  // clientId: 'electron-client',
  accessKeyId: '',
  secretKey: '',
  sessionToken: '',
  region: AWS.config.region,
  protocol: 'wss',
  maximumReconnectTimeMs: 8000,
  debug: true
})

let connected = false
mqttClient.on('connect', () => {
  connected = true
})


let cognitoIdentity = new AWS.CognitoIdentity()
AWS.config.credentials.get((err) => {
  if (err) {
    console.log(err)
    return
  }

  cognitoIdentity.getCredentialsForIdentity({ IdentityId: AWS.config.credentials.identityId }, function(err, data) {
    if (err) {
      console.log(err)
      return
    }

    console.log(data)
    mqttClient.updateWebSocketCredentials(
      data.Credentials.AccessKeyId,
      data.Credentials.SecretKey,
      data.Credentials.SessionToken)
  })


  console.log("Cognito Identity Id: " + AWS.config.credentials.identityId)
})

let tray = null
app.on('ready', () => {
  tray = new Tray('IconTemplate.png')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click() {
        if (connected) mqttClient.publish('door', JSON.stringify({ event: 'open' }))
      }
    },
    {
      label: 'Exit',
      click() {
        app.quit()
      }
    }
  ])
  tray.setToolTip('Knock knock! Who\'s there?')
  tray.setContextMenu(contextMenu)
})
