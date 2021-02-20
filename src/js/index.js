import WebMidi from 'webmidi'

import 'path-data-polyfill'

import SelectorControl from '../svgs/selectorControl.svg'
import SliderControl from '../svgs/sliderControl.svg'
import EnvelopeControl from '../svgs/envelope.svg'
import Axes from '../svgs/axes.svg'

const imageToUseMap = {
    "selectorControl.svg": SelectorControl,
    "sliderControl.svg": SliderControl,
    "envelope.svg": EnvelopeControl
};

const disabledJackColor = "#444444";

const patchColors = {
    "filterCutoff": "#ff0000",
    "ampLevel": "#0000ff",
}

const patchSources = [
    { name: "EG1" },
    { name: "EG2" },
    { name: "EG3" },
    { name: "LFO1" },
    { name: "LFO2" },
    { name: "Key Velocity" },
    { name: "Pitch Wheel" },
    { name: "Mod Wheel" },
    { name: "Key Track" },
    { name: "Midi 1" },
    { name: "Midi 2" },
    { name: "Midi 3" }
];



const patchTargets = [
    { name: "Pitch" },
    { name: "Osc2 Tune" },
    { name: "Osc1 Control 1" },
    { name: "Osc 1 Level" },
    { name: "Osc 2 Level" },
    { name: "Noise Level" },
    { name: "Filter 1 Type" },
    { name: "Filter 1 Cutoff" },
    { name: "Filter 1 Resonance" },
    { name: "Filter 2 Cutoff" },
    { name: "Waveshape Depth" },
    { name: "Amp Level" },
    { name: "Panning" },
    { name: "LFO1 Frequency" },
    { name: "LFO2 Frequency" },
    { name: "Portamento" },
    { name: "Osc 1 Control 2" },
    { name: "Filter 1 Env Intensity" },
    { name: "Filter 1 Key Track" },
    { name: "Filter 2 Resonance" },
    { name: "Filter 2 Env Intensity" },
    { name: "EG1 Attack" },
    { name: "EG1 Decay" },
    { name: "EG1 Sustain" },
    { name: "EG1 Release" },
    { name: "EG2 Attack" },
    { name: "EG2 Decay" },
    { name: "EG2 Sustain" },
    { name: "EG2 Release" },
    { name: "EG3 Attack" },
    { name: "EG3 Decay" },
    { name: "EG3 Sustain" },
    { name: "EG3 Release" },
    { name: "Patch 1 Intensity" },
    { name: "Patch 2 Intensity" },
    { name: "Patch 3 Intensity" },
    { name: "Patch 4 Intensity" },
    { name: "Patch 5 Intensity" },
    { name: "Patch 6 Intensity" },

];



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

                    ui.handleSysex(e.data);
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

        this.patches = [];

        this.controls = {
            osc1Wave: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#osc1Waveform")),
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
                    ],
                    onChange: function () {
                        //console.log("osc1mod onchange");
                        let arrow = document.getElementById("theSVG").contentDocument.querySelector("#crossModArrow");
                        let currentText = this.values[this.selectedOption].displayText
                        //console.log(currentText);
                        if (currentText == "Cross") {
                            //console.log("setting visible");
                            arrow.style.visibility = "visible";
                        } else {
                            //console.log("setting hidden");
                            arrow.style.visibility = "hidden";
                        }
                    }
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
                imageToUse(this.svg.querySelector("#osc2Waveform")),
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
                imageToUse(this.svg.querySelector("#osc2Mod")),
                {
                    name: "Osc 2 Mod",
                    ccNumber: 19,
                    values: [
                        new SelectorControlOption("Off", 0, 0),
                        new SelectorControlOption("Ring", 1, 32),
                        new SelectorControlOption("Sync", 2, 64),
                        new SelectorControlOption("Ring Sync", 3, 96),
                    ],
                    onChange: function () {
                        //console.log("osc2mod onchange");
                        let arrowGroup = document.getElementById("theSVG").contentDocument.querySelector("#osc2ModArrow");
                        let currentText = this.values[this.selectedOption].displayText
                        //console.log(currentText);
                        if (currentText == "Off") {
                            arrowGroup.style.visibility = "hidden";
                        } else {
                            arrowGroup.style.visibility = "visible";
                            arrowGroup.querySelector("#osc2ModLabel").textContent = currentText;
                        }
                    }
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
                    sysexFunc: makeSysexFunc([0x57, 0])
                }),
            ampLevel: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#ampLevel")),
                {
                    name: "Level",
                    ccNumber: 7
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
                    ],
                    onChange: function () {
                        //console.log("filterRouting onchange");
                        let filterElements = ["#filterRoutingSingle", "#filterRoutingSerial", "#filterRoutingParallel", "#filterRoutingIndividual"]
                            .map(id => document.getElementById("theSVG").contentDocument.querySelector(id));
                        //console.log(filterElements);
                        //console.log(this.selectedOption);
                        for (let i = 0; i < 4; i++) {
                            filterElements[i].style.visibility = (i == this.selectedOption) ? "visible" : "hidden";
                        }
                    }
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
                    sysexFunc: makeSysexFunc([0x36, 0], true)
                }),
            env1: new EnvelopeWidget(
                imageToUse(this.svg.querySelector("#envelope1")),
                {
                    name: "Envelope 1",
                    ccNumbers: { attack: 85, decay: 86, sustain: 87, release: 88 }
                }),
            env2: new EnvelopeWidget(
                imageToUse(this.svg.querySelector("#envelope2")),
                {
                    name: "Envelope 2",
                    ccNumbers: { attack: 73, decay: 75, sustain: 70, release: 72 }
                }),

            filter2Cutoff: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter2Cutoff")),
                {
                    name: "Cutoff",
                    ccNumber: 30,
                }),
            filter2Resonance: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter2Resonance")),
                {
                    name: "Resonance",
                    ccNumber: 68,
                }),
            filter2EnvIntensity: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter2EnvIntensity")),
                {
                    name: "Env Int",
                    ccNumber: 69,
                }),
            filter2KeyTrack: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter2KeyTrack")),
                {
                    name: "Key Track",
                    ccNumber: 82,
                }),
            filter2VelSen: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#filter2VelSens")),
                {
                    name: "Vel Sens",
                    sysexFunc: makeSysexFunc([0x46, 0], true)
                }),
            filter2Type: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#filter2Type")),
                {
                    name: "Type",
                    ccNumber: 29,
                    values: [
                        new SelectorControlOption("LPF", 0, 0),
                        new SelectorControlOption("HPF", 1, 43),
                        new SelectorControlOption("BPF", 2, 85)
                    ]

                }),
            lfo1Waveform: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#lfo1Waveform")),
                {
                    name: "Waveform",
                    ccNumber: 89,
                    values: [
                        new SelectorControlOption("Saw", 0, 0),
                        new SelectorControlOption("Square", 1, 26),
                        new SelectorControlOption("Triangle", 2, 51),
                        new SelectorControlOption("S&H", 3, 77),
                        new SelectorControlOption("Random", 4, 102),
                    ]
                }
            ),
            lfo1KeySync: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#lfo1KeySync")),
                {
                    name: "Key Sync",
                    sysexFunc: makeSysexFunc([0x14, 1]),
                    values: [
                        new SelectorControlOption("Off", 0, 0),
                        new SelectorControlOption("Timbre", 1, 1),
                        new SelectorControlOption("Voice", 2, 2),
                    ]
                }
            ),
            lfo1BpmSync: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#lfo1BpmSync")),
                {
                    name: "BPM Sync",
                    sysexFunc: makeSysexFunc([0x13, 1]),
                    values: [
                        new SelectorControlOption("Off", 0, 0),
                        new SelectorControlOption("On", 1, 1),
                    ]
                }
            ),
            lfo1Frequency: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#lfo1Frequency")),
                {
                    name: "Frequency",
                    ccNumber: 90,
                }),
            lfo2Waveform: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#lfo2Waveform")),
                {
                    name: "Waveform",
                    ccNumber: 102,
                    values: [
                        new SelectorControlOption("Saw", 0, 0),
                        new SelectorControlOption("Square+", 1, 26),
                        new SelectorControlOption("Sine", 2, 51),
                        new SelectorControlOption("S&H", 3, 77),
                        new SelectorControlOption("Random", 4, 102),
                    ]
                }
            ),
            lfo2KeySync: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#lfo2KeySync")),
                {
                    name: "Key Sync",
                    sysexFunc: makeSysexFunc([0x24, 1]),
                    values: [
                        new SelectorControlOption("Off", 0, 0),
                        new SelectorControlOption("Timbre", 1, 1),
                        new SelectorControlOption("Voice", 2, 2),
                    ]
                }
            ),
            lfo2BpmSync: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#lfo2BpmSync")),
                {
                    name: "BPM Sync",
                    sysexFunc: makeSysexFunc([0x23, 1]),
                    values: [
                        new SelectorControlOption("Off", 0, 0),
                        new SelectorControlOption("On", 1, 1),
                    ]
                }
            ),
            lfo2Frequency: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#lfo2Frequency")),
                {
                    name: "Frequency",
                    ccNumber: 76,
                }),

            //patches
            patch1Source: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#patch1Source")),
                {
                    name: "Source",
                    sysexFunc: makeSysexFuncPatch([0, 0]),
                    values: patchSourceOptions
                }),
            patch1Dest: new SelectorControlWidget(
                imageToUse(this.svg.querySelector("#patch1Dest")),
                {
                    name: "Dest",
                    sysexFunc: makeSysexFuncPatch([1, 0]),
                    values: patchDestOptions
                }),
            patch1Intensity: new SliderControlWidget(
                imageToUse(this.svg.querySelector("#patch1Intensity")),
                {
                    name: "Intensity",
                    sysexFunc: makeSysexFuncPatch([2,0], true)
                })

        }
    }

    connectCallbacks(midiOut) {
        for (let control in this.controls) {
            //console.log(control);
            this.controls[control].connectCallbacks(midiOut);
        }
    }

    handleSysex(data) {
        if (data[4] == 0x40) {//data dump message
            this.initializeFromProgram(data);
        } else {
            console.log("sysex non program dump message");
            console.log(data);
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
            //console.log(index, offsetInGroup, groupNumber, topBitByte, lowBits);
            return lowBits | (((topBitByte >> offsetInGroup) & 1) << 7);

        }

        //names are only the first 8 bytes on this model
        let programName = "";
        for (let i = 0; i < 8; i++) {
            const byte = getByte(i);
            if (byte == 0) break;
            programName += String.fromCharCode(getByte(i));
        }
        console.log(programName);
        console.log(this.svg.querySelector("#patchName"));
        this.svg.querySelector("#patchName").textContent = programName;
        for (let i = 50; i < 100; i++) {
            console.log(i, getByte(i));
        }
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

        //filter2
        this.controls.filter2Cutoff.setFromSysex(getByte(51));
        this.controls.filter2Resonance.setFromSysex(getByte(52));
        this.controls.filter2EnvIntensity.setFromSysex(getByte(53));
        this.controls.filter2KeyTrack.setFromSysex(getByte(54));
        this.controls.filter2VelSen.setFromSysex(getByte(55));
        this.controls.filter2Type.setFromSysex(getByte(44) >>> 4);


        //amp
        this.controls.ampLevel.setFromSysex(getByte(56));

        //eg1
        this.controls.env1.setFromSysex({
            attack: getByte(64), decay: getByte(65),
            sustain: getByte(66), release: getByte(67)
        });
        //eg2
        this.controls.env2.setFromSysex({
            attack: getByte(70), decay: getByte(71),
            sustain: getByte(72), release: getByte(73)
        });

        //eg3 ADSR 76, 77, 78, 79, vel intmmm

        //lfo1
        this.controls.lfo1Waveform.setFromSysex(getByte(82));
        this.controls.lfo1Frequency.setFromSysex(getByte(83));
        this.controls.lfo1KeySync.setFromSysex((getByte(84) >> 5) & 3);
        this.controls.lfo1BpmSync.setFromSysex(getByte(84) >> 7);

        //lfo2
        this.controls.lfo2Waveform.setFromSysex(getByte(86));
        this.controls.lfo2Frequency.setFromSysex(getByte(87));
        this.controls.lfo2KeySync.setFromSysex((getByte(88) >> 5) & 3);
        this.controls.lfo2BpmSync.setFromSysex(getByte(88) >> 7);

        //patches
        this.controls.patch1Source.setFromSysex(getByte(90));
        this.controls.patch1Dest.setFromSysex(getByte(91));
        this.controls.patch1Intensity.setFromSysex(getByte(92));


        this.addPatch([this.controls.env1.jack, this.controls.filter1Cutoff.jack,
        this.controls.filter2Cutoff.jack], patchColors.filterCutoff);
        this.addPatch([this.controls.env2.jack, this.controls.ampLevel.jack
        ], patchColors.ampLevel);
    }

    addPatch(jacks, color) {
        this.patches.push({ jacks: jacks, color: color });
        for (let jack of jacks) {
            jack.style.fill = color;
        }
    }

    //remove all patches that contain this jack, set all to gray
    removePatch(jack) {
        for (let patch of this.patches) {
            for (let j of jacks) {
                if (j == jack) {
                    for (let aj of jacks) {
                        aj.style.fill = disabledJackColor;
                    }
                    continue;
                }
            }
        }
        this.patches = this.patches.filter(patch => !patch.jacks.includes(jack));
    }

    removeAllPatches(jack) {
        for (let patch of this.patches) {
            for (let jack of patch.jacks) {
                jack.style.fill = disabledJackColor;
            }
        }
        this.patches = [];
    }
}

//Inkscape apparently won't make a <use> reference for me, but uses an <image> element as a link
//This function replaces the <image> with a <use> element
function imageToUse(imageNode) {
    //console.log("converting: imageNode");
    //console.log(imageNode);
    //console.log(imageNode.getAttribute("xlink:href"));
    let src = imageToUseMap[imageNode.getAttribute("xlink:href")];
    let scFrag = document.createRange().createContextualFragment(src);
    let scElement = scFrag.firstElementChild;
    //console.log(imageNode);
    //console.log(scElement.querySelectorAll("linearGradient"));

    //let axesFrag = document.createRange().createContextualFragment(Axes);
    //scElement.appendChild(axesFrag.firstElementChild);

    let toCopy = ["x", "y", "width", "height", "id"];
    for (let attr of toCopy) {
        //console.log("original attribute: ", attr);
        //console.log(imageNode.getAttributeNS(null, attr));
        scElement.setAttribute(attr, imageNode.getAttributeNS(null, attr));
    }
    //nevermind, just don't use gradients
    // //translate all the linear gradient elements
    // const imX = Number(imageNode.getAttributeNS(null, "x"));
    // const imY = Number(imageNode.getAttributeNS(null, "y"));
    // for (let lg of scElement.querySelectorAll("linearGradient")) {
    //     if (lg.hasAttributeNS(null, "x1")) {
    //         console.log(lg);
    //         let oldX1 = Number(lg.getAttributeNS(null, "x1"));
    //         let oldY1 = Number(lg.getAttributeNS(null, "y1"));
    //         let oldX2 = Number(lg.getAttributeNS(null, "x2"));
    //         let oldY2 = Number(lg.getAttributeNS(null, "y2"));
    //         console.log("oldX, y", oldX1, oldY1, oldX1 + imX);
    //         lg.setAttribute("x1", imX + oldX1);
    //         lg.setAttribute("y1", imY + oldY1);
    //         lg.setAttribute("x2", imX + oldX2);
    //         lg.setAttribute("y2", imY + oldY2);
    //         console.log(lg.getAttribute("x1"), lg.getAttribute("y1"));
    //     }
    // }


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
        //console.log("constructing SCW");
        console.log(options);
        this.svgNode = svgNode;
        this.name = options.name;
        if ('ccNumber' in options) {
            this.ccNumber = options.ccNumber;
        } else {
            this.sysexFunc = options.sysexFunc;
        }
        this.values = options.values; //
        if ("onChange" in options) {
            this.onChange = options.onChange;
        }
        this.svgNode.querySelector(".controlName").textContent = this.name;
        this.selectedOption = -1;
    }

    connectCallbacks(midiOut) {
        //console.log("Attaching listener to");
        //console.log(this.svgNode.querySelector(".selectedOption"));
        this.svgNode.querySelector(".selectedOption").addEventListener("click",
            () => {
                this.selectedOption++
                this.selectedOption %= this.values.length;
                this.svgNode.querySelector(".selectedOption").textContent =
                    this.values[this.selectedOption].displayText;
                if ('ccNumber' in this) {
                    midiOut.sendControlChange(this.ccNumber,
                        this.values[this.selectedOption].controlChangeValue);
                } else {
                    this.sysexFunc(midiOut, this.values[this.selectedOption].controlChangeValue);
                }
                if (this.onChange) {
                    this.onChange.call(this);
                }
            });
    }

    setFromSysex(val) {
        this.selectedOption = this.values.findIndex(x => x.sysexValue == val);
        this.svgNode.querySelector(".selectedOption").textContent =
            this.values[this.selectedOption].displayText;
        if (this.onChange) {
            this.onChange.call(this);
        }
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
        //console.log("making slider control widget", options);
        this.svgNode = svgNode;
        this.name = options.name;
        if ('ccNumber' in options)
            this.ccNumber = options.ccNumber;
        else
            this.sysexFunc = options.sysexFunc
        this.svgNode.querySelector(".controlName").textContent = this.name;

        this.jack = this.svgNode.querySelector(".patchJack");
        //console.log(this.jack, this.jack.fill);
        this.jack.style.fill = disabledJackColor;
        //console.log(this.jack.fill);
    }

    connectCallbacks(midiOut) {
        this.svgNode.addEventListener('wheel',
            (e) => {
                e.preventDefault();
                this.value = Math.round(this.value + e.deltaY);
                this.value = Math.min(127, this.value);
                this.value = Math.max(0, this.value);
                this.positionSlider(this.value);

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
        //.log("making EnvWidget", options);
        this.svgNode = svgNode;
        this.name = options.name;
        this.ccNumbers = options.ccNumbers;
        this.svgNode.querySelector(".controlName").textContent = this.name;

        this.envPath = this.svgNode.querySelector(".envelopePath");
        let pathData = this.envPath.getPathData();
        //console.log(pathData);
        //console.log(this.envPath.getAttribute("d"));
        this.axes = this.svgNode.querySelector(".pathAxes");
        //console.log(this.axes);
        //console.log(this.axes.height.animVal);

        //todo, should probably just erase, and start fresh on the
        //path data to be less fragile...
        this.borderFudge = 10;
        this.xMin = this.axes.x.animVal.value + this.borderFudge;
        this.xMax = this.xMin + this.axes.width.animVal.value - 2 * this.borderFudge;
        this.yBot = this.axes.y.animVal.value + this.axes.height.animVal.value - this.borderFudge;
        this.yTop = this.axes.y.animVal.value + this.borderFudge;
        pathData[0].values[0] = this.xMin;
        pathData[0].values[1] = this.yBot;

        const last = pathData.length - 1;
        pathData[last].values[0] = this.xMax;
        pathData[last].values[1] = this.yBot;
        pathData[last].type = "L";

        pathData[1].values[1] = this.yTop; //attack hits the peak

        //.log(pathData);
        this.envPath.setPathData(pathData);
        //console.log(this.envPath.getAttribute("d"));

        this.jack = this.svgNode.querySelector(".patchJack");
        //console.log(this.jack);
        this.jack.style.fill = disabledJackColor;
        //console.log(this.jack);

    }

    connectCallbacks(midiOut) {
        let callback = (field) => {
            return (e) => {
                e.preventDefault();
                this[field] = Math.round(this[field] + e.deltaY);
                this[field] = Math.min(127, this[field]);
                this[field] = Math.max(0, this[field]);

                midiOut.sendControlChange(this.ccNumbers[field], this[field]);
                this.updatePath();
            }
        }

        this.svgNode.querySelector(".attack").addEventListener('wheel',
            callback("attack"));
        this.svgNode.querySelector(".decay").addEventListener('wheel',
            callback("decay"));
        this.svgNode.querySelector(".sustain").addEventListener('wheel',
            callback("sustain"));
        this.svgNode.querySelector(".release").addEventListener('wheel',
            callback("release"));

    }
    setFromSysex(vals) {
        this.attack = vals.attack;
        this.decay = vals.decay;
        this.sustain = vals.sustain;
        this.release = vals.release;

        this.updatePath();
    }

    updatePath() {
        let pathData = this.envPath.getPathData();

        const usableWidth = this.xMax - this.xMin;
        const usableHeight = this.yBot - this.yTop;
        let attackX = this.xMin + this.attack * usableWidth / 512;
        //use up to 1/4 for attck, up to 1/4 for decay, up to 1/4 for release, rest for sustain
        let sustainX = attackX + this.decay * usableWidth / 512;
        let releaseStartX = this.xMax - this.release * usableWidth / 512;

        let sustainY = this.yBot - usableHeight * this.sustain / 128;

        //top of attack
        pathData[1].values[0] = attackX;
        pathData[1].values[1] = this.yTop;
        pathData[1].type = "L";

        //begin of sustain
        pathData[2].values[0] = sustainX;
        pathData[2].values[1] = sustainY;
        pathData[2].type = "L";

        //end of sustain
        pathData[3].values[0] = releaseStartX;
        pathData[3].values[1] = sustainY;
        pathData[3].type = "L";

        this.envPath.setPathData(pathData);
    }

}

function intToSysex(val) {
    return [val & 0x7F, (val >> 7) & 0x7F];
}

function sendSysexControlChange(midiOut, paramId, val) {
    const sysexRep = intToSysex(val);
    midiOut.sendSysex(0x42,
        [0x30, 0x7e, 0x41, 0x11, 0, paramId[0], paramId[1], sysexRep[0], sysexRep[1]]);
}

function makeSysexFunc(paramId, signed) {
    console.log("making sysexFunc with ", paramId);
    return function (midiOut, val) {
        if (signed) {
            val = Math.min(126, val) - 63;
        }
        sendSysexControlChange(midiOut, paramId, val);
    }
}

function makeSysexFuncPatch(paramId, signed) {
    return function (midiOut, val) {
        if(signed){
            val = Math.min(val, 126) - 63;
        }
        const sysexRep = intToSysex(val);
        midiOut.sendSysex(0x42,
            [0x30, 0x7e, 0x41, 0x12, 0, paramId[0], paramId[1], sysexRep[0], sysexRep[1]]);
    }
}

const patchSourceOptions = patchSources.map((val, index) => {
    return new SelectorControlOption(val.name, index, index);
});

const patchDestOptions = patchTargets.map((val, index) => {
    return new SelectorControlOption(val.name, index, index);
});
