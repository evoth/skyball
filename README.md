# Skyball
A fan-made [Rocket League](https://en.wikipedia.org/wiki/Rocket_League) clone which runs in the web browser.

## Current state
Little more than mostly accurate Rocket-League-esque physics with some test graphics and controls slapped on top.

## Physics
Right now, the physics are a direct fork of [ZealanL's](https://github.com/ZealanL) wonderful [RocketSim](https://github.com/ZealanL/RocketSim) (written in C++), compiled to JavaScript/WebAssembly with [Emscripten](https://emscripten.org/) and driven through custom JavaScript bindings using [Embind](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html).

## Plans
If I continue development, I may make some improvements to the physics (wall curve bounces are the biggest offender right now). Additionally, I'd want to improve the graphics and controls to the point where it's a bearable analog to free play in Rocket League. A stretch goal would be to dig into netcode nastiness and try to get some rudimentary multiplayer going.
