# Skyball
A fan-made [Rocket League](https://en.wikipedia.org/wiki/Rocket_League) clone which runs in the web browser.

## Current state
Little more than mostly accurate Rocket-League-esque physics with some test graphics and controls slapped on top.

## Physics
Right now, the physics are a direct fork of [ZealanL's](https://github.com/ZealanL) wonderful [RocketSim](https://github.com/ZealanL/RocketSim) (written in C++), compiled to JavaScript/WebAssembly with [Emscripten](https://emscripten.org/) and driven through custom JavaScript bindings using [Embind](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html).

## Todo
- Improve deadzone logic in RocketSim (see https://halfwaydead.gitlab.io/rl-deadzone/)
