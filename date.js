//jhint esversion:6
// console.log(module);
exports.getDate = function(){

  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
  const day = today.toLocaleDateString("en-US",options);

  return day;
}
exports.getDay = function(){

  const today = new Date();

  const options = {
    weekday: "long"

  };
  const day = today.toLocaleDateString("en-US",options);

  return day;
}
// to check if exported modules are visible in console
console.log(module.exports);
