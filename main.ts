/**
 * PMS5003 미세먼지 센서 확장 블록
 * by ssshin
 * https://www.make-robot.co.kr
 */


/**
 * Custom blocks
 */
//% color=#0fbc11 icon="\uf0c3" weight=90
namespace pms5003 {

    let pm01: number = 0
    let pm25: number = 0
    let pm10: number = 0
    let readBuffers: Buffer = null

    /**
    * makbot board initialization, please execute at boot time
    */
    //% weight=100 blockId=pmsInit block="Initialize PMS"
    //% weight=100
    //% blockId="pms_init" block="set PMS5003 RX %pmsRX| TX %pmsTX|at baud rate 9600"
    export function initPMS(pmsRX: SerialPin, pmsTX: SerialPin): void {

        serial.redirect(
            SerialPin.P2,
            SerialPin.P8,
            BaudRate.BaudRate9600);

        //sendCmdChangeToPassiveMode();
    }

    /**
     * send command, change to passive mode
     */
    //% weight=100 blockId="change_PassiveMode"  block="change passive mode"
    export function sendCmdChangeToPassiveMode() {

        let buf = pins.createBuffer(7);
        buf[0] = 0x42; // pre fix1
        buf[1] = 0x4d; // pre fix2
        buf[2] = 0xe1; // cmd type
        buf[3] = 0x00; // dataH
        buf[4] = 0x00; // dataL
        buf[5] = 0x01; // LRCH
        buf[6] = 0x70; // LRCL

        serial.writeBuffer(buf);
    }

    /**
     * send PM0.1 data
     */
    //% weight=100 blockId="get PM1.0"  block="get PM1.0"
    export function sendCmdPM01(): number {
        return pm01
    }


    /**
    * send PM2.5 data
    */
    //% weight=100 blockId="get PM2.5"  block="get PM2.5"
    export function sendCmdPM25(): number {
        return pm25
    }


    /**
    * send PM10 data 
    */
    //% weight=100 blockId="get PM10"  block="get PM10"
    export function sendCmdPM10(): number {
        return pm10
    }

    /**
     * get PM data
     */
    function sendCmdPM() {

        let bufdata: number = 0
        let j: number = 0
        let hexString: string = null
        let receivedString: string[] = []

        readBuffers = serial.readBuffer(32)
        //serial.writeBuffer(readBuffers)
        hexString = readBuffers.toHex()

        for (let i = 0; i < readBuffers.length * 2; i += 2) {
            receivedString[j] = hexString[i] + hexString[i + 1]
            j++;
        }


        if (receivedString[0] == '42') {
            if (receivedString[1] == '4d') {

                pm01 = convertToDecimal(receivedString[4] + receivedString[5])
                pm25 = convertToDecimal(receivedString[6] + receivedString[7])
                pm10 = convertToDecimal(receivedString[8] + receivedString[9])
                //basic.showNumber(pm01)
                //basic.showNumber(pm25)
                //basic.showNumber(pm10)
            }
        }
    }

    /**
     * send command, get particle data
     */
    //% weight=100 blockId="read_PMS_inPassiveMode"  block="read PMS data in passive mode"
    export function sendCmdpmsData() {

        let buf = pins.createBuffer(7);
        buf[0] = 0x42; // pre fix1
        buf[1] = 0x4d; // pre fix2
        buf[2] = 0xe2; // cmd type
        buf[3] = 0x00; // dataH
        buf[4] = 0x00; // dataL
        buf[5] = 0x01; // LRCH
        buf[6] = 0x71; // LRCL

        serial.writeBuffer(buf);

        sendCmdPM()
    }

    /**
     * 문자를 십진숫자로 변환하는 함수
     */
    function convertToDecimal(inString: string): number {

        let decimal = 0
        let position = 0

        for (let i = inString.length - 1; i >= 0; i--) {

            if (inString[i] >= '0' && inString[i] <= '9') {
                decimal += parseInt(inString[i]) * Math.pow(16, position)
            } else if (inString[i] >= 'A' && inString[i] <= 'F') {
                decimal += parseString(inString[i]) * Math.pow(16, position)
            } else if (inString[i] >= 'a' && inString[i] <= 'f') {
                decimal += parseString(inString[i]) * Math.pow(16, position)
            }
            position++;
        }
        return decimal
    }

    /**
    * 16진수로 변환하기 위해 A ~ F, a ~ f를 숫자로 변환
    */

    function parseString(indata: string): number {
        switch (indata) {
            case "A":
                return 10;
            case "B":
                return 11;
            case "C":
                return 12;
            case "D":
                return 13;
            case "E":
                return 14;
            case "F":
                return 15;
            case "a":
                return 10;
            case "b":
                return 11;
            case "c":
                return 12;
            case "d":
                return 13;
            case "e":
                return 14;
            case "f":
                return 15;

            default:
                return 0;
        }
    }

}
