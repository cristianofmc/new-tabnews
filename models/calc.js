function sumfunc(num1, num2) {
  if (typeof num1 !== "number") return "Error";
  if (typeof num2 !== "number") return "Error";
  return num1 + num2;
}

exports.sumfunc = sumfunc;
