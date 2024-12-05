export function translate(text: string) {
  switch (text) {
    case 'name':
      return 'nome';
    case 'phone':
      return 'telefone';
    default:
      return text;
  }
}
