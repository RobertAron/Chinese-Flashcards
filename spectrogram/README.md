

# Install Deps
```sh
cd $HOME/.local
git clone https://github.com/emscripten-core/emsdk.git
./emsdk install latest
./emsdk activate latest
# echo 'source "$HOME/.local/emsdk/emsdk_env.sh"' >> $HOME/.zprofile
```


<!-- ./emcc -O2 test/hello_world.cpp -->
<!-- emcc library.c -s EXPORTED_FUNCTIONS="['_add', '_greet']" -s MODULARIZE=1 -o library.js -->

emcc ./c/library.c -s EXPORTED_FUNCTIONS="['_add', '_greet']" -s MODULARIZE=1 -sSINGLE_FILE -o ./ts/codegen/library1.js
