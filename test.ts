// tests go here; this will not be compiled when this package is used as a library
input.onButtonPressed(Button.B, function () {
    PMS5003.changePassiveMode()
})
input.onButtonPressed(Button.A, function () {
    PMS5003.getPMDataInPassiveMode()
    basic.showNumber(PMS5003.getPM01())
    basic.showNumber(PMS5003.getPM25())
    basic.showNumber(PMS5003.getPM10())
})
PMS5003.initPMS(SerialPin.P8, SerialPin.P2)
basic.forever(function () {
	
})
