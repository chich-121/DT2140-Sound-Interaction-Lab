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
const MOVE_TRIGGER_THRESHOLD = 1.2;   // 你可以调：1.0 更敏感，2.0 更稳定
const WIND_COOLDOWN = 300;

let lastWindTrigger = 0;
let lastAcc = { x: 0, y: 0, z: 0 };

function accelerationChange(accx, accy, accz) {
    if (!dspNode || audioContext.state === "suspended") return;

    const now = millis();

    // Compute true movement delta (not noise)
    const dx = accx - lastAcc.x;
    const dy = accy - lastAcc.y;
    const dz = accz - lastAcc.z;

    const movement = Math.sqrt(dx*dx + dy*dy + dz*dz);

    // Only trigger if REAL movement is large enough
    if (movement > MOVE_TRIGGER_THRESHOLD && (now - lastWindTrigger > WIND_COOLDOWN)) {
        triggerWind();
        lastWindTrigger = now;
    }

    // Save last acceleration to detect ONLY real changes
    lastAcc = { x: accx, y: accy, z: accz };
}

function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    playAudio(mouseX/windowWidth)
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
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

function playAudio(pressure) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    // Wind strength max
    dspNode.setParamValue("v:wind chimes/wind", 2.0);

    // Auto fade back to zero wind (calm)
    setTimeout(() => {
        dspNode.setParamValue("v:wind chimes/wind", 0.0);
    }, 300);
}

//==========================================================================================
// END
//==========================================================================================