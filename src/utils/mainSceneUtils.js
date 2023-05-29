import { decimalPrecision } from "../config/Config";

export function getDecimal(value) {


  const fixed = Math.pow(10, decimalPrecision);
  return Math.floor(value * fixed) / fixed;
}

