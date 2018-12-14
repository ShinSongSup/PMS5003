/**
 * PMS5003 미세먼지 센서 확장 블록
 * by ssshin
 * https://www.make-robot.co.kr
 */
/**
 * Custom blocks
 */
//% color=#0fbc11 icon="\uf0c3" weight=90
namespace PMS5003 {
    export enum PMSMODE {
        ACTIVEMODE,
        PASSIVEMODE
    }

    let pm01: number = 0
    let pm25: number = 0
    let pm10: number = 0
    let readBuffers: Buffer = null
    let mode: number = 0

    /**
    * PM sensor initialization, please execute at boot time
    */
    // // blockId="pms_init" block="set PMS5003 RX %pmsRX| TX %pmsTX|at baud rate 9600"
    //% weight=100 blockId="pms_init" block="PMS5003 시리얼포트 설정 : RX %pmsRX| TX %pmsTX| 통신속도: 9600"
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
    // weight=100 blockId="change_PassiveMode"  block="change passive mode"
    //% weight=99 blockId="change_PassiveMode"  block="패시브 모드로 변경하기"
    export function sendCmdChangeToPassiveMode() {

        let buf = pins.createBuffer(7);
        buf[0] = 0x42; // pre fix1
        buf[1] = 0x4d; // pre fix2
        buf[2] = 0xe1; // cmd type
        buf[3] = 0x00; // dataH
        buf[4] = 0x00; // dataL
        buf[5] = 0x01; // LRCH
        buf[6] = 0x70; // LRCL

        mode = PMSMODE.PASSIVEMODE

        serial.writeBuffer(buf);
    }


    /**
     * send command, change to active mode
     */
    // weight=98 blockId="change_PassiveMode"  block="change passive mode"
    //% weight=98 blockId="change_ActiveMode"  block="액티브 모드로 변경하기"
    export function sendCmdChangeToActiveMode() {

        let buf = pins.createBuffer(7);
        buf[0] = 0x42; // pre fix1
        buf[1] = 0x4d; // pre fix2
        buf[2] = 0xe1; // cmd type
        buf[3] = 0x00; // dataH
        buf[4] = 0x01; // dataL
        buf[5] = 0x01; // LRCH
        buf[6] = 0x71; // LRCL

        mode = PMSMODE.ACTIVEMODE
        serial.writeBuffer(buf);
    }

    /**
     * send PM0.1 data
     */
    //% weight=96 blockId="get PM1.0"  block="PM1.0 값 가져오기"
    export function sendCmdPM01(): number {

        return pm01
    }


    /**
    * send PM2.5 data
    */
    //% weight=96 blockId="get PM2.5"  block="PM2.5 값 가져오기"
    export function sendCmdPM25(): number {
        return pm25
    }


    /**
    * send PM10 data 
    */
    //% weight=96 blockId="get PM10"  block="PM10 값 가져오기"
    export function sendCmdPM10(): number {
        return pm10
    }

    /**
     * get PM data
     */
    function getPMDataInPassiveMode() {

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

            }
        }
    }

    /**
     * get PM data in active mode
     */
    //% weight=98 blockId="get PM data in active mode"  block="자동모드에서 미세먼지 값 가져오기"
    function getPMDataInActiveMode() {

        let bufdata: number = 0
        let j: number = 0
        let hexString: string = null
        let receivedString: string[] = []
        
        serial.onDataReceived("42", function () {
            readBuffers = serial.readBuffer(31)
            //serial.writeBuffer(readBuffers)
            hexString = readBuffers.toHex()


            for (let i = 0; i < readBuffers.length * 2; i += 2) {
                receivedString[j] = hexString[i] + hexString[i + 1]
                j++;
            }

            if (receivedString[0] == '4d') {
                pm01 = convertToDecimal(receivedString[4] + receivedString[5])
                pm25 = convertToDecimal(receivedString[6] + receivedString[7])
                pm10 = convertToDecimal(receivedString[8] + receivedString[9])
            }
        })
    }

    /**
     * send command, get particle data
     */
    // weight=100 blockId="read_PMS_inPassiveMode"  block="read PMS data in passive mode"
    //% weight=97 blockId="read_PMS_inPassiveMode"  block="수동모드에서 미세먼지 값 가져오기"
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

        getPMDataInPassiveMode()
    }

    /**
     * convert string to decimal
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
    * convert hexdecimal value(A ~ F, a ~ f) to decimal
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
