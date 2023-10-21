const RevealGamepadController = ((Reveal) => {
    const REVEAL_ACTIONS = ({
        LEFT: () => Reveal.left(),
        RIGHT: () => Reveal.right(),
        UP: () => Reveal.up(),
        DOWN: () => Reveal.down(),
        PREV: () => {
            if (!Reveal.isOverview()) {
                Reveal.prev();
            }
            else {
                Reveal.left();
            }
        },
        NEXT: () => {
            if (!Reveal.isOverview()) {
                Reveal.next();
            }
            else {
                Reveal.right();
            }
        },
        NONE: () => {
        },
        PREV_FRAGMENT: () => Reveal.prevFragment(),
        NEXT_FRAGMENT: () => Reveal.nextFragment(),
        SYNC: () => Reveal.sync(),
        SHUFFLE: () => Reveal.shuffle(),
        HELP: () => Reveal.toggleHelp(),
        OVERVIEW: () => Reveal.toggleOverview(),
        AUTO_SLIDE: () => Reveal.toggleAutoSlide(),
        PAUSE: () => Reveal.togglePause(),
    });
    const MAPPINGS = {
        SN30_8bitDo: {
            buttons: [
                { name: 'A', idx: 0, action: REVEAL_ACTIONS.NEXT },
                { name: 'B', idx: 1, action: REVEAL_ACTIONS.DOWN },
                { name: 'X', idx: 3, action: REVEAL_ACTIONS.UP },
                { name: 'Y', idx: 4, action: REVEAL_ACTIONS.PREV },
                { name: 'L1', idx: 6, action: REVEAL_ACTIONS.PREV },
                { name: 'L2', idx: 7, action: REVEAL_ACTIONS.NEXT },
                { name: 'R1', idx: 8, action: REVEAL_ACTIONS.PREV },
                { name: 'R2', idx: 9, action: REVEAL_ACTIONS.NEXT },
                { name: 'Select', idx: 10, action: REVEAL_ACTIONS.OVERVIEW },
                { name: 'Start', idx: 11, action: REVEAL_ACTIONS.PAUSE },
                { name: 'Special', idx: 12, action: REVEAL_ACTIONS.NONE },
                { name: 'L3', idx: 13, action: REVEAL_ACTIONS.NONE },
                { name: 'R3', idx: 14, action: REVEAL_ACTIONS.NONE },
            ],
            cross: [
                {
                    name: 'Cross', idx: 9, actions: [
                        { name: 'nothing', value: 3.3, action: REVEAL_ACTIONS.NONE },
                        { name: 'down', value: 0.1428, action: REVEAL_ACTIONS.DOWN },
                        { name: 'up', value: -1, action: REVEAL_ACTIONS.UP },
                        { name: 'left', value: 0.71, action: REVEAL_ACTIONS.PREV },
                        { name: 'right', value: -0.428, action: REVEAL_ACTIONS.NEXT }
                    ]
                }
            ],
            pointer: [
                { name: 'Left Analog', idx: 3 }
            ]
        }
    };
    return {
        id: 'gamepadController',
        REVEAL_ACTIONS,
        MAPPINGS,
        init: (reveal) => {
            let config = Object.assign({ loopTime: 50, mapping: MAPPINGS['SN30_8bitDo'] }, reveal.getConfig().gamepadController);
            let interval = -1;
            let gamepadsConnected = 0;
            window.addEventListener("gamepadconnected", (evt) => {
                gamepadsConnected++;
                console.log('Gamepad connected.', evt);
                if (gamepadsConnected === 1) {
                    interval = setInterval(() => {
                        pollGamepads(config.mapping);
                    }, config.loopTime);
                }
            });
            window.addEventListener("gamepaddisconnected", (evt) => {
                console.log('Gamepad disconnected.', evt);
                gamepadsConnected--;
                if (gamepadsConnected === 0) {
                    clearInterval(interval);
                }
            });
            let previousButtonsKey = [];
            function pollGamepads(mapping) {
                var _a;
                const gamepads = navigator.getGamepads();
                for (const gp of gamepads.filter(gp => !!gp)) {
                    // Find buttons that are currently pressed
                    const pressed = ((_a = gp === null || gp === void 0 ? void 0 : gp.buttons) !== null && _a !== void 0 ? _a : []).map((button, idx) => button.pressed ? (Object.assign({ idx }, mapping.buttons.find(mappingButton => mappingButton.idx === idx))) : null).filter(but => !!but);
                    // Find all current crosses orientation
                    let crossValues = [];
                    mapping.cross.forEach(cross => {
                        const crossPadAxeValue = gp.axes[cross.idx];
                        // Search closest value to determine cross orientation
                        let min = 99999;
                        let crossAction = null;
                        cross.actions.forEach(action => {
                            const value = Math.abs(crossPadAxeValue - action.value);
                            if (value < min) {
                                min = value;
                                crossAction = action;
                            }
                        });
                        if (crossAction) {
                            crossValues.push(crossAction);
                        }
                    });
                    // Fire events on "keyup"
                    const allPressedButtonsKeys = [
                        ...pressed.map(button => { var _a, _b; return (_b = (_a = button === null || button === void 0 ? void 0 : button.name) !== null && _a !== void 0 ? _a : `Undefined index in button mapping pressed: ${button === null || button === void 0 ? void 0 : button.idx}`) !== null && _b !== void 0 ? _b : 'No button defined'; }),
                        ...crossValues.map(cross => cross.name)
                    ];
                    const all = [...pressed, ...crossValues];
                    allPressedButtonsKeys.forEach((buttonOrCross) => {
                        if (previousButtonsKey.indexOf(buttonOrCross) === -1) {
                            window.dispatchEvent(new CustomEvent('pressed', {
                                detail: {
                                    key: buttonOrCross,
                                    // @ts-ignore
                                    action: all.find(toPerform => toPerform.name === buttonOrCross)
                                }
                            }));
                        }
                    });
                    previousButtonsKey = allPressedButtonsKeys;
                }
            }
            window.addEventListener("pressed", (evt) => {
                const event = evt;
                console.log('Pressed', event);
                event.detail.action.action();
            });
        }
    };
    // @ts-ignore
});
export default RevealGamepadController;
