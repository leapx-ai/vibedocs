export function currentDateIso() {
  return new Date().toISOString().slice(0, 10);
}
