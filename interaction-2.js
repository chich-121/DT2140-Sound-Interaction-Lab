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
const dspName = "bubble";
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
bubble.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    }).catch(err => console.error("Bubble DSP failed to load:", err));

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
const SHAKE_THRESHOLD = 10;      // 按需要调
const BUBBLE_COOLDOWN = 120;     // 每次冒泡之间的最短间隔 (ms)
let lastBubbleTrigger = 0;

function accelerationChange(accx, accy, accz) {
    // playAudio()
    if (!dspNode || audioContext.state === "suspended") {
        return;
    }

    const now = millis();
    const magnitude = Math.sqrt(accx * accx + accy * accy + accz * accz);

    if (magnitude > SHAKE_THRESHOLD && (now - lastBubbleTrigger) > BUBBLE_COOLDOWN) {
        triggerBubble(magnitude);
        lastBubbleTrigger = now;
    }
}

function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    // playAudio()
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    
}

function deviceTurned() {
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

function triggerBubble(force) {
    const freqMin = 200;
    const freqMax = 1500;
    const normalized = Math.min((force - SHAKE_THRESHOLD) / 40, 1);
    const freq = freqMin + (freqMax - freqMin) * normalized;

    dspNode.setParamValue("/bubble/freq", freq);
    dspNode.setParamValue("/bubble/volume", 0.8);

    // 触发泡泡按钮（Faust 中 button("drop")）
    dspNode.setParamValue("/bubble/drop", 1);
    setTimeout(() => dspNode.setParamValue("/bubble/drop", 0), 30);
}

//==========================================================================================
// END
//==========================================================================================