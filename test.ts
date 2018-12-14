// tests go here; this will not be compiled when this package is used as a library
input.onButtonPressed(Button.B, function () {
    PMS5003.sendCmdChangeToPassiveMode()
})
input.onButtonPressed(Button.A, function () {
    PMS5003.sendCmdpmsData()
    basic.showNumber(PMS5003.sendCmdPM01())
    basic.showNumber(PMS5003.sendCmdPM25())
    basic.showNumber(PMS5003.sendCmdPM10())
})
PMS5003.initPMS(SerialPin.P8, SerialPin.P2)
basic.forever(function () {
	
})
