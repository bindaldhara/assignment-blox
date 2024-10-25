import BigNumber from "bignumber.js";

function parseJson(jsonStr) {
  let index = 0;

  function parseValue() {
    skipWhitespace();
    const char = jsonStr[index];

    if (char === '"') return parseStringOrNumber();
    if (char === "{") return parseObject();
    if (char === "[") return parseArray();
    if (char === "-" || (char >= "0" && char <= "9")) return parseNumber();
    if (jsonStr.startsWith("true", index)) return parseLiteral("true", true);
    if (jsonStr.startsWith("false", index)) return parseLiteral("false", false);
    if (jsonStr.startsWith("null", index)) return parseLiteral("null", null);

    throw new SyntaxError("Unexpected token at position " + index);
  }

  function parseObject() {
    const obj = {};
    index++; // Skip '{'
    skipWhitespace();

    while (jsonStr[index] !== "}") {
      skipWhitespace();
      const key = parseString();
      skipWhitespace();
      if (jsonStr[index] !== ":")
        throw new SyntaxError("Expected ':' after key in object at " + index);
      index++; // Skip ':'
      skipWhitespace();
      const value = parseValue();
      obj[key] = value;
      skipWhitespace();

      if (jsonStr[index] === ",") {
        index++; // Skip ','
        skipWhitespace();
      } else if (jsonStr[index] !== "}") {
        throw new SyntaxError("Expected '}' or ',' in object at " + index);
      }
    }
    index++; // Skip '}'
    return obj;
  }

  function parseArray() {
    const arr = [];
    index++; // Skip '['
    skipWhitespace();

    while (jsonStr[index] !== "]") {
      const value = parseValue();
      arr.push(value);
      skipWhitespace();

      if (jsonStr[index] === ",") {
        index++; // Skip ','
        skipWhitespace();
      } else if (jsonStr[index] !== "]") {
        throw new SyntaxError("Expected ']' or ',' in array at " + index);
      }
    }
    index++; // Skip ']'
    return arr;
  }

  function parseString() {
    let str = "";
    index++; // Skip initial '"'
    while (jsonStr[index] !== '"') {
      if (jsonStr[index] === "\\") {
        index++; // Skip '\'
        const escapeChar = jsonStr[index];
        str += escapeCharacter(escapeChar);
      } else {
        str += jsonStr[index];
      }
      index++;
    }
    index++; // Skip closing '"'
    return str;
  }

  function parseStringOrNumber() {
    const str = parseString();
    return isNumericString(str) ? parseNumberFromString(str) : str;
  }

  function isNumericString(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }

  function parseNumberFromString(str) {
    const bigNum = new BigNumber(str);
    if (
      !bigNum.isInteger() ||
      bigNum.isGreaterThan(Number.MAX_SAFE_INTEGER) ||
      bigNum.isLessThan(Number.MIN_SAFE_INTEGER)
    ) {
      return bigNum;
    }
    return Number(str);
  }

  function parseNumber() {
    let numStr = "";
    if (jsonStr[index] === "-") {
      numStr += "-";
      index++;
    }
    while (jsonStr[index] >= "0" && jsonStr[index] <= "9") {
      numStr += jsonStr[index];
      index++;
    }
    if (jsonStr[index] === ".") {
      numStr += ".";
      index++;
      while (jsonStr[index] >= "0" && jsonStr[index] <= "9") {
        numStr += jsonStr[index];
        index++;
      }
    }
    if (jsonStr[index] === "e" || jsonStr[index] === "E") {
      numStr += jsonStr[index];
      index++;
      if (jsonStr[index] === "-" || jsonStr[index] === "+") {
        numStr += jsonStr[index];
        index++;
      }
      while (jsonStr[index] >= "0" && jsonStr[index] <= "9") {
        numStr += jsonStr[index];
        index++;
      }
    }
    return parseNumberFromString(numStr);
  }

  function parseLiteral(literal, value) {
    if (jsonStr.startsWith(literal, index)) {
      index += literal.length;
      return value;
    }
    throw new SyntaxError("Unexpected token at position " + index);
  }

  function skipWhitespace() {
    while (
      jsonStr[index] === " " ||
      jsonStr[index] === "\n" ||
      jsonStr[index] === "\r" ||
      jsonStr[index] === "\t"
    ) {
      index++;
    }
  }

  function escapeCharacter(char) {
    switch (char) {
      case '"':
        return '"';
      case "\\":
        return "\\";
      case "/":
        return "/";
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      default:
        throw new SyntaxError("Invalid escape character at " + index);
    }
  }

  return parseValue();
}


const jsonString = `{
    "intValue": "123456789012345678901234567890",
    "floatValue": "3.1415926535897932384626433832795028841971693993751",
    "smallInt": "123",
    "array": [1, 2, "3"],
    "nested": {
        "bigInt": "987654321098765432109876543210",
        "bigFloat": "2.7182818284590452353602874713527"
    }
}`;

const parsedJson = parseJson(jsonString);
console.log("Parsed JSON with arbitrary precision:", parsedJson);
