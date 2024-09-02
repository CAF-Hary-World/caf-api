const tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
export const timeStampISOTime = new Date(Date.now() - tzoffset).toISOString();
