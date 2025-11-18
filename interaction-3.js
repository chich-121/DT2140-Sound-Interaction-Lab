//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "windchimes";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
windchimes.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('windchimes: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================
// Movement sensitivity
const MOVE_TRIGGER_THRESHOLD = 1.0;   // slight wind
const GUST_THRESHOLD = 2.0;//medium wind
const STORM_THRESHOLD  = 4.0;//strong wind
const WIND_COOLDOWN = 10;//time between


let lastWindTrigger = 0;
let lastAcc = { x: 0, y: 0, z: 0 };

function accelerationChange(accx, accy, accz) {
    const now = millis();
    //initialize
    if (!lastAcc) {
        lastAcc = { x: accx, y: accy, z: accz };
        return;
      }
    // Compute true movement delta (not noise)
    const dx = accx - lastAcc.x;
    const dy = accy - lastAcc.y;
    const dz = accz - lastAcc.z;

    const movement = Math.sqrt(dx*dx + dy*dy + dz*dz);
    lastAcc = { x: accx, y: accy, z: accz };

    //cool down time
    if (now - lastWindTrigger < WIND_COOLDOWN) return;

    // Only trigger if REAL movement is large enough
    if (movement > MOVE_TRIGGER_THRESHOLD) {
        playAudio(movement);
        lastWindTrigger = now;
    }

    // Save last acceleration to detect ONLY real changes

}

function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}
function deviceShaken() {
    
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio() {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    let windValue;
    let duration;

    if(movement >= STORM_THRESHOLD){
        windValue = 2.0;
        duration = 2000;
    }else if(movement >= GUST_THRESHOLD){
        windValue = 1.0;
        duration = 1000;
    }else {
        windValue = 0.4;
        duration = 500;
    }
    // Wind strength max
    dspNode.setParamValue("v:wind chimes/wind", windValue);

    // Auto fade back to zero wind (calm)
    setTimeout(() => {
        dspNode.setParamValue("v:wind chimes/wind", 0.0);
    }, duration);
}

//==========================================================================================
// END
//==========================================================================================