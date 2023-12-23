OUTPUT_PREFIX = RocketSim
SRC_OUTPUT_DIR = src
STATIC_OUTPUT_DIR = public

COMPILE_DIR = RocketSim
ASSETS_DIR = assets\RocketSim
EMBIND_INCLUDE_DIR = ..\emscripten-main\emscripten-main\system\include\emscripten

CC = emcc
CFLAGS = -std=c++20
EMFLAGS = -lembind -sEXPORT_ES6 -sMODULARIZE --preload-file $(ASSETS_DIR)@/ -sALLOW_MEMORY_GROWTH -sWASM_BIGINT -I$(EMBIND_INCLUDE_DIR)

MV = move /y

# Source: https://stackoverflow.com/a/12959694
rwildcard=$(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2))

$(OUTPUT_PREFIX):
	$(CC) $(call rwildcard,$(COMPILE_DIR)/,*.cpp) $(CFLAGS) -o $(SRC_OUTPUT_DIR)\$(OUTPUT_PREFIX).js $(EMFLAGS)
	$(MV) $(SRC_OUTPUT_DIR)\$(OUTPUT_PREFIX).data $(STATIC_OUTPUT_DIR)\$(OUTPUT_PREFIX).data