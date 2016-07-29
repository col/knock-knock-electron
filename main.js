const {app, Menu, Tray} = require('electron')
const AWS = require('aws-sdk')
const AWSIoT = require('aws-iot-device-sdk')
const storage = require('electron-json-storage')

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

mqttClient.on('connect', () => {
  contextMenu.items[0].enabled = true
})
let reconnectCount = 0
mqttClient.on('close', () => {
  console.log("Close event triggered")
  if (contextMenu) contextMenu.items[0].enabled = false
  if (reconnectCount > 3) {
    reconnectCount = 0
    fetchCognitoSession()
  } else {
    reconnectCount++
  }
})

let fetching = false
let fetchCognitoSession = function () {
  let identityId = AWS.config.credentials.identityId
  if (identityId && !fetching) {
    fetching = true
    cognitoIdentity.getCredentialsForIdentity({ IdentityId: identityId }, function(err, data) {
      fetching = false
      if (err) {
        console.log(err)
        return
      }

      mqttClient.updateWebSocketCredentials(
        data.Credentials.AccessKeyId,
        data.Credentials.SecretKey,
        data.Credentials.SessionToken)
    })
  }
}

let cognitoIdentity = new AWS.CognitoIdentity()
AWS.config.credentials.get((err) => {
  if (err) {
    console.log(err)
    return
  }
  fetchCognitoSession()
  console.log("Cognito Identity Id: " + AWS.config.credentials.identityId)
})

let tray = null
let contextMenu = null
app.dock.hide();
app.on('ready', () => {
  tray = new Tray(__dirname + '/IconTemplate.png')
  contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      enabled: false,
      click() {
        mqttClient.publish('door', JSON.stringify({ event: 'open' }))
      }
    },
    {
      type: 'separator'
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
