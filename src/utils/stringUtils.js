function abbreviateString (str, maxLen) {
  if (str.length <= maxLen) {
    return str;
  } else {
    return str.substring(0, maxLen - 1) + " ...";
  }
}

export default { abbreviateString };
