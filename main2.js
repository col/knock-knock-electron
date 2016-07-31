var menubar = require('menubar')
var electron = require('electron')
var Menu = electron.Menu
 
var mb = menubar({
	index: 'http://localhost:3000',
	icon: 'doorImage.png',
	preloadWindow: true
})
 
mb.on('ready', function ready() {
  console.log('app is running')

  mb.tray.on('right-click', function() {
  	let contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      click() {
        mb.app.quit()
      }
    }])

  	mb.tray.popUpContextMenu(contextMenu)
  })
})