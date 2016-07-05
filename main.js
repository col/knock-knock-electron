var menubar = require('menubar')

var mb = menubar({width: 450, height: 430})

mb.on('ready', function ready () {
  console.log('app is ready')
})
