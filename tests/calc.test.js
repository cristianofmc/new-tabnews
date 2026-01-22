const calc = require("../models/calc.js");

test("sum 2 + 2 is equal 4", () => {
  const result = calc.sumfunc(2, 2);
  expect(result).toBe(4);
});

test("sum 100 + 5 is equal 105", () => {
  const result = calc.sumfunc(5, 100);
  expect(result).toBe(105);
});

test("sum 'banana' + 100 must return error", () => {
  const result = calc.sumfunc("banana", 100);
  expect(result).toBe("Error");
});
