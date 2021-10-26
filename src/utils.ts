export const StringLike = (a: string, b: string) =>
  new RegExp(
    `^${b
      .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')}$`
  ).test(a);
