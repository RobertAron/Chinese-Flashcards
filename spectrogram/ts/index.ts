import init from "./codegen/library1";

init().then((res) => {
  console.log(res._add(2, 5));
});
