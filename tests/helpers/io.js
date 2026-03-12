export function createMemoryWriter() {
  let buffer = "";

  return {
    write(chunk) {
      buffer += String(chunk);
    },
    toString() {
      return buffer;
    },
  };
}
