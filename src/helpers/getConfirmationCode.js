/** Как в Nomad-Back: 4-значный код, действителен 5 минут. */
export default function getConfirmationCode() {
  let code = Math.random().toString().slice(2, 6);
  code = (code[0] === '0' ? '1' : code[0]) + code.slice(1);
  const validUntil = new Date(Date.now() + 5 * 60 * 1000);
  return { code, validUntil };
}
