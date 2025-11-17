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
const dspName = "door";
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
door.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        const [minValue, maxValue] = getMinMaxParam("/door/position");
        console.log('Door position - Min value:', minValue, 'Max value:', maxValue);
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
// Thresholds for detecting if phone is flat (in degrees)
const DOOR_PARAM_ADDRESS = "/door/open"; // Allow ±15 degrees from flat
const DOOR_MIN_ANGLE = 0;    // door close
const DOOR_MAX_ANGLE = 90;   // door open

// 从 DSP 里读到的参数实际 min / max
let doorParamMin = 0;
let doorParamMax = 1;
let doorParamReady = false;

function accelerationChange(accx, accy, accz) {
    // playAudio()
}

function rotationChange(rotx, roty, rotz) {
    if (!dspNode) return;
  if (audioContext.state === 'suspended') return;

  // 第一次有 dspNodeParams 时，从 JSON 里把这个参数的 min/max 读出来
  if (!doorParamReady && dspNodeParams) {
    const paramDef = findByAddress(dspNodeParams, DOOR_PARAM_ADDRESS);
    if (paramDef) {
      const [minVal, maxVal] = getParamMinMax(paramDef);
      doorParamMin = minVal;
      doorParamMax = maxVal;
      console.log("Door param range:", doorParamMin, doorParamMax);
      doorParamReady = true;
    } else {
      // 没找到的话在 console 里打个 log 提醒你检查地址
      console.warn("Door param not found, check DOOR_PARAM_ADDRESS:", DOOR_PARAM_ADDRESS);
      return;
    }
}

    if (!doorParamReady) return;
  
    // 把 rotationY 限制在 [DOOR_MIN_ANGLE, DOOR_MAX_ANGLE] 范围内
    const angleClamped = clamp(roty, DOOR_MIN_ANGLE, DOOR_MAX_ANGLE);
  
    // 映射到 0–1
    let t = (angleClamped - DOOR_MIN_ANGLE) / (DOOR_MAX_ANGLE - DOOR_MIN_ANGLE);
    t = clamp(t, 0, 1);
  
    // 可以稍微做一点非线性映射，让开门前半段细腻一点
    t = Math.pow(t, 1.2);
  
    // 再把 0–1 映射到实际参数范围
    const doorValue = doorParamMin + t * (doorParamMax - doorParamMin);
  
    // 把当前“门角度”发给 Faust
    dspNode.setParamValue(DOOR_PARAM_ADDRESS, doorValue);
    
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

function playAudio() {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    // Edit here the addresses ("/thunder/rumble") depending on your WASM controls (you can see 
    // them printed on the console of your browser when you load the page)
    // For example if you change to a bell sound, here you could use "/churchBell/gate" instead of
    // "/thunder/rumble".
    
}

//==========================================================================================
// END
//==========================================================================================