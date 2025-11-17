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
const FLAT_THRESHOLD = 15; // Allow ±15 degrees from flat
const MIN_TILT_ANGLE = 5; // Minimum tilt to trigger sound

// Previous rotation values for detecting change
let prevRotZ = 0;
let isPhoneFlat = false;

function accelerationChange(accx, accy, accz) {
    // playAudio()
}

function rotationChange(rotx, roty, rotz) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    
    // Check if phone is relatively flat (rotationX and rotationY are close to 0)
    // Using absolute values to check if within threshold
    const isFlatX = Math.abs(rotx) < FLAT_THRESHOLD;
    const isFlatY = Math.abs(roty) < FLAT_THRESHOLD;
    isPhoneFlat = isFlatX && isFlatY;
    
    // Only respond to side-to-side tilting when phone is flat
    if (isPhoneFlat) {
        // rotationZ represents roll (side-to-side tilt when flat)
        // Normalize rotationZ to 0-180 degrees range (absolute value)
        const absRotZ = Math.abs(rotz);
        
        // Only trigger if there's significant tilt
        if (absRotZ > MIN_TILT_ANGLE) {
            // Map rotationZ to door position parameter (0 to 0.5)
            // rotationZ typically ranges from -180 to 180 degrees
            // We'll use the absolute value and map to 0-0.5 range
            // Using a non-linear mapping for more natural feel
            const normalizedTilt = Math.min(absRotZ / 90, 1.0); // Normalize to 0-1
            const doorPosition = normalizedTilt * 0.5; // Map to 0-0.5 range
            
            // Set the door position parameter
            dspNode.setParamValue("/door/position", doorPosition);
        } else {
            // Reset to minimum when not tilted
            dspNode.setParamValue("/door/position", 0);
        }
    } else {
        // Phone is not flat, reset door position
        dspNode.setParamValue("/door/position", 0);
    }
    
    prevRotZ = rotz;
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
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    playAudio();
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

/*function playAudio() {
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
    dspNode.setParamValue("/thunder/rumble", 1)
    setTimeout(() => { dspNode.setParamValue("/thunder/rumble", 0) }, 100);
}
*/
//==========================================================================================
// END
//==========================================================================================