const tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
const timeStampISOTime = new Date(Date.now() - tzoffset).toISOString();

function getDaysAgo(days: number) {
  return new Date(Date.now() - 24 * days * 60 * 60 * 1000);
}

export { timeStampISOTime, getDaysAgo };
