import WebMidi from 'webmidi'

import 'path-data-polyfill'

import SelectorControl from '../svgs/selectorControl.svg'
import SliderControl from '../svgs/sliderControl.svg'
import EnvelopeControl from '../svgs/envelope.svg'
import Axes from '../svgs/axes.svg'

const imageToUseMap = {
    "selectorControl.svg": SelectorControl,
    "sliderControl.svg": SliderControl,
    "envelope.svg" : EnvelopeControl
};

window.onload = function () {
    console.log("document loaded");
    let ui = new uiHandle(document.getElementById("theSVG"));
    WebMidi.enable(function (err) {
        if (err) {
            console.log("WebMidi could not be enabled.", err);
        } else {
            const MKStr = "microKORG XL ";
            let input = WebMidi.getInputByName(MKStr + "KBD/KNOB");
            let output = WebMidi.getOutputByName(MKStr + "SOUND");
            console.log(WebMidi.inputs);
            console.log(WebMidi.outputs);
            if (!input || !output) {
                console.log("couldn't find microKORG XL input/output: ");

                return;
            }

            console.log(input);
            console.log(output);

            let reqDump = function () {
                console.log("requesting dump via sysex");
                output.sendSysex(0x42, [0x30, 0x7e, 0x10]);
            };

            input.addListener('programchange', 'all',
                function (e) {
                    console.log(e);
                    //give the synth time to switch to the new program

                    window.setTimeout(() => reqDump(), 500);
                });

            input.addListener('sysex', 'all',
                function (e) {
                    console.log("got sysex:");
                    console.log(e);
                    //e.data.forEach( x=> console.log(x.toString(16)));
                    //output.sendSysex(0x42, [0x30, 0x7e, 0x23]);
                    //input.removeListener('sysex');

                    ui.initializeFromProgram(e.data);
                    //let mk = new MicroKorgXL(e.data);
                    //console.log(mk.osc1Wave);
                });
            input.addListener('noteon', "all",
                function (e) {
                    //console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
                    //output.sendControlChange(8, 13);

                }
            );
            ui.connectCallbacks(output);
            reqDump();


        }
    }, true /*enable sysex*/);

}

class uiHandle {
    constructor(svg) {
        this.svg = svg.contentDocument;
        console.log(this.svg);
        console.log(this.svg.querySelector("#osc1waveform"));


        this.controls = {
            osc1Wave: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#osc1waveform")),
                {
                    name: "Osc 1 Waveform",
                    ccNumber: 8,
                    values: [
                        new SelectorControlOption("Saw", 0, 0),
                        new SelectorControlOption("Pulse", 1, 16),
                        new SelectorControlOption("Triangle", 2, 32),
                        new SelectorControlOption("Sine", 3, 48),
                        new SelectorControlOption("Formant", 4, 64),
                        new SelectorControlOption("Noise", 5, 80),
                        new SelectorControlOption("PCM/DWGS", 6, 96),
                        new SelectorControlOption("AudioIn", 7, 112)
                    ]

                }),
            osc1Mod: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#osc1Mod")),
                {
                    name: "Osc 1 Mod",
                    ccNumber: 9,
                    values: [
                        new SelectorControlOption("Waveform", 0, 0),
                        new SelectorControlOption("Cross", 1, 32),
                        new SelectorControlOption("Unison", 2, 64),
                        new SelectorControlOption("VPM", 3, 96),
                    ]
                }),
            osc1Control1: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#osc1Control1")),
                {
                    name: "Ctl 1",
                    ccNumber: 15,
                }),
            osc1Control2: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#osc1Control2")),
                {
                    name: "Ctl 2",
                    ccNumber: 17,
                }),
            osc2Wave: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#osc2waveform")),
                {
                    name: "Osc 2 Waveform",
                    ccNumber: 18,
                    values: [
                        new SelectorControlOption("Saw", 0, 0),
                        new SelectorControlOption("Pulse", 1, 32),
                        new SelectorControlOption("Triangle", 2, 64),
                        new SelectorControlOption("Sine", 3, 96),
                    ]

                }),
            osc2Mod: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#osc2mod")),
                {
                    name: "Osc 2 Mod",
                    ccNumber: 19,
                    values: [
                        new SelectorControlOption("Off", 0, 0),
                        new SelectorControlOption("Ring", 1, 32),
                        new SelectorControlOption("Sync", 2, 64),
                        new SelectorControlOption("Ring Sync", 3, 96),
                    ]
                }),
            osc2Control1: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#osc2Control1")),
                {
                    name: "Semi",
                    ccNumber: 20,
                }),
            osc2Control2: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#osc2Control2")),
                {
                    name: "Tune",
                    ccNumber: 21,
                }),
            mixerOsc1: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#mixerOsc1")),
                {
                    name: "Osc 1",
                    ccNumber: 23,
                }),
            mixerOsc2: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#mixerOsc2")),
                {
                    name: "Osc 2",
                    ccNumber: 24,
                }),
            mixerNoise: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#mixerNoise")),
                {
                    name: "Noise",
                    ccNumber: 25,
                }),
            mixerPunch: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#mixerPunch")),
                {
                    name: "Punch",
                    sysexFunc: (midiOut, val) => {
                        //global channel, modelID, change param, ??, val
                        let toSend = [0x30, 0x7e, 0x41, 0x11, 0, 0x57, 0, val, 0];
                        midiOut.sendSysex(0x42, toSend);
                    }
                }),
            filter1Cutoff: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter1Cutoff")),
                {
                    name: "Cutoff",
                    ccNumber: 74,
                }),
            filter1Resonance: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter1Resonance")),
                {
                    name: "Resonance",
                    ccNumber: 71,
                }),
            filter1Type: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter1Type")),
                {
                    name: "Type",
                    ccNumber: 27,
                }),
            filter1Routing: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#filter1Routing")),
                {
                    name: "Routing",
                    ccNumber: 26,
                    values: [
                        new SelectorControlOption("Single", 0, 0),
                        new SelectorControlOption("Serial", 1, 32),
                        new SelectorControlOption("Parallel", 2, 64),
                        new SelectorControlOption("Indivual", 3, 96),
                    ]
                }),
            filter1EnvIntensity: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter1EnvIntensity")),
                {
                    name: "Env Int",
                    ccNumber: 79,
                }),
            filter1KeyTrack: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter1KeyTrack")),
                {
                    name: "Key Track",
                    ccNumber: 28,
                }),
            filter1VelSen: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter1VelSens")),
                {
                    name: "Vel Sens",
                    sysexFunc: (midiOut, val) => {
                        //global channel, modelID, change param, ??, val
                        let toSend = [0x30, 0x7e, 0x41, 0x11, 0, 0x36, 0, val, 0x7f];
                        midiOut.sendSysex(0x42, toSend);
                    }
                }),
            env1: new EnvelopeWidget(
                imageToUse(this.svg.querySelector("#envelope1")),
                {
                    name: "Envelope 1",
                    ccNumbers: []
                }),

        };

    }

    connectCallbacks(midiOut) {
        for (let control in this.controls) {
            console.log(control);
            this.controls[control].connectCallbacks(midiOut);
        }
    }

    initializeFromProgram(data) {
        console.log("initialize from data");
        console.log(data);

        //data starts at byte 5

        const firstByte = 5;


        //I guess MIDI never sets the top bit in any bytes, so it grabs 7 bits
        //packs their top bits into a sigle byte, sends that
        //then sends 7 bytes worth of their lower bits
        let getByte = function (index) {
            const offsetInGroup = index % 7;
            const groupNumber = Math.floor(index / 7);
            const topBitByte = data[firstByte + groupNumber * 8];
            const lowBits = data[firstByte + groupNumber * 8 + 1 + offsetInGroup];
            return lowBits | (((topBitByte >> offsetInGroup) & 1) << 7);

        }

        let programName = "";
        for (let i = 0; i < 12; i++) {
            const byte = getByte(i);
            if (byte == 0) break;
            programName += String.fromCharCode(getByte(i));
        }
        console.log(programName);
        console.log(this.svg.querySelector("#patchName"));
        this.svg.querySelector("#patchName").textContent = programName;
        /*for (let i = 12; i < 80; i++) {
            console.log(i, getByte(i));
        }*/
        /*
        Analog tune: 124?  121
        Pitch bend: 125 or 126
        Portamento: 125 or 126

        Osc1: 32 - ? (waveform, mod1, mod2, oscmod?)
        byte 32 has wave type + extra info!  Low 3 bits is osc type!
        
        saw 0, pulse 1, triangle 2, sine 3, formant 4, noise 5, 
           PCM/DWGS 6, audio in 7
        byte 32 bits 4, 5 are OSC1 mod (waveform, cross, unison, VPM)

        Osc2:  36-39    (waveform , osc mod, tune, semitone)
        Mixer: 40-43 (osc1, osc2, noise)
        Mixer Punch: 62
        Pitch: 121-126 (analog tune, transpose, detune, vibrato intensity, pitch bend, portmento)

        */
        /*for (let i = 32; i < 45; i++) {
            console.log("byte: ", i, getByte(i));
        }*/
        //osc 1
        let byte32 = getByte(32)
        this.controls.osc1Wave.setFromSysex(byte32 & 7);
        this.controls.osc1Mod.setFromSysex((byte32 >> 3) & 3);
        this.controls.osc1Control1.setFromSysex(getByte(33));
        this.controls.osc1Control2.setFromSysex(getByte(34));

        let byte37 = getByte(37);
        this.controls.osc2Wave.setFromSysex(byte37 & 3);
        this.controls.osc2Mod.setFromSysex((byte37 >> 3) & 3);
        this.controls.osc2Control1.setFromSysex(getByte(38));
        this.controls.osc2Control2.setFromSysex(getByte(39));

        this.controls.mixerOsc1.setFromSysex(getByte(40));
        this.controls.mixerOsc2.setFromSysex(getByte(41));
        this.controls.mixerNoise.setFromSysex(getByte(42));
        this.controls.mixerPunch.setFromSysex(getByte(62));

        //filter1
        this.controls.filter1Routing.setFromSysex(getByte(44) & 3);
        this.controls.filter1Type.setFromSysex(getByte(45));
        this.controls.filter1Cutoff.setFromSysex(getByte(46));
        this.controls.filter1Resonance.setFromSysex(getByte(47));
        this.controls.filter1EnvIntensity.setFromSysex(getByte(48));
        this.controls.filter1KeyTrack.setFromSysex(getByte(49));
        this.controls.filter1VelSen.setFromSysex(getByte(50));
    }
}

//Inkscape apparently won't make a <use> reference for me, but uses an <image> element as a link
//This function replaces the <image> with a <use> element
function imageToUse(imageNode) {
    console.log("converting: imageNode");
    console.log(imageNode);
    console.log(imageNode.getAttribute("xlink:href"));
    let src = imageToUseMap[imageNode.getAttribute("xlink:href")];
    let scFrag = document.createRange().createContextualFragment(src);
    let scElement = scFrag.firstElementChild;
    console.log(imageNode);
    console.log(scElement);

    let axesFrag = document.createRange().createContextualFragment(Axes);
    scElement.appendChild(axesFrag.firstElementChild);

    let toCopy = ["x", "y", "width", "height", "id"];
    for (let attr of toCopy) {
        console.log("original attribute: ", attr);
        console.log(imageNode.getAttributeNS(null, attr));
        scElement.setAttribute(attr, imageNode.getAttributeNS(null, attr));
    }

    let parent = imageNode.parentNode;
    imageNode.remove();
    parent.appendChild(scElement);

    return scElement;

    /*console.log(imageNode.getAttribute("xlink:href"));
    let scElement = document.createElementNS("http://www.w3.org/2000/svg", "use");
    console.log(imageNode);
    console.log(scElement);
    scElement.setAttribute("href", "./" + imageNode.getAttribute("xlink:href"));
    let toCopy = ["x", "y", "width", "height", "id"];
    for (let attr of toCopy) {
        console.log("original attribute: ", attr);
        console.log(imageNode.getAttributeNS(null, attr));
        scElement.setAttribute(attr, imageNode.getAttributeNS(null, attr));
    }
    console.log(scElement);
    let parent = imageNode.parentNode;
    imageNode.remove();
    parent.appendChild(scElement);

    return scElement;*/
}

class SelectorControlWidget {

    constructor(svgNode, options) {
        console.log("constructing SCW");
        console.log(options);
        this.svgNode = svgNode;
        this.name = options.name;
        this.ccNumber = options.ccNumber;
        this.values = options.values; //
        this.svgNode.querySelector(".controlName").textContent = this.name;
        this.selectedOption = -1;
    }

    connectCallbacks(midiOut) {
        console.log("Attaching listener to");
        console.log(this.svgNode.querySelector(".selectedOption"));
        this.svgNode.querySelector(".selectedOption").addEventListener("click",
            () => {
                this.selectedOption++
                this.selectedOption %= this.values.length;
                this.svgNode.querySelector(".selectedOption").textContent =
                    this.values[this.selectedOption].displayText;
                midiOut.sendControlChange(this.ccNumber,
                    this.values[this.selectedOption].controlChangeValue);
            });
    }

    setFromSysex(val) {
        this.selectedOption = this.values.findIndex(x => x.sysexValue == val);
        this.svgNode.querySelector(".selectedOption").textContent =
            this.values[this.selectedOption].displayText;
    }
}

//Associate text with the corresponding value from a sysex dump
//or a CC message
class SelectorControlOption {
    constructor(displayText, sysexValue, controlChangeValue) {
        this.displayText = displayText;
        this.sysexValue = sysexValue;
        this.controlChangeValue = controlChangeValue;
    }
}

class SliderControlWidget {
    constructor(svgNode, options) {
        console.log("making slider control widget", options);
        this.svgNode = svgNode;
        this.name = options.name;
        if ('ccNumber' in options)
            this.ccNumber = options.ccNumber;
        else
            this.sysexFunc = options.sysexFunc
        this.svgNode.querySelector(".controlName").textContent = this.name;
    }

    connectCallbacks(midiOut) {
        this.svgNode.addEventListener('wheel',
            (e) => {
                e.preventDefault();
                this.value = Math.round(this.value + e.deltaY);
                this.value = Math.min(127, this.value);
                this.value = Math.max(0, this.value);
                this.positionSlider(this.value);
                console.log(this);
                if ('ccNumber' in this) {
                    midiOut.sendControlChange(this.ccNumber, this.value);
                } else {
                    this.sysexFunc(midiOut, this.value);
                }
            });
    }

    setFromSysex(val) {
        this.value = val;
        this.positionSlider(val);
    }

    //from 0 to 127
    positionSlider(newVal) {
        let slider = this.svgNode.querySelector(".slider");
        let rail = this.svgNode.querySelector(".sliderRail");
        const newY = rail.y.animVal.value + (1 - (newVal / 127.0)) * rail.height.animVal.value;
        slider.setAttribute('y', newY);
    }
}

class EnvelopeWidget {
    constructor(svgNode, options) {
        console.log("making EnvWidget", options);
        this.svgNode = svgNode;
        this.name = options.name;
        this.ccNumbers = options.ccNumbers;
        this.svgNode.querySelector(".controlName").textContent = this.name;

        let envPath = this.svgNode.querySelector(".envelopePath");
        let pathData = envPath.getPathData();
        console.log(pathData);
        console.log(envPath.getAttribute("d"));
        let axes = this.svgNode.querySelector(".pathAxes");
        console.log(axes);
        
        pathData[0].values[1] = -10;
         pathData[0].values[1] = 40;
        console.log(pathData);
        envPath.setPathData(pathData);
        console.log(envPath.getAttribute("d"));

    }


}

function pathToPoints(path){
    console.log(typeof(string(path)));
    let points = path.split(' ');
    points.shift(); //drop the m;
    console.log(points.map( (x) => x.split(",")));
}