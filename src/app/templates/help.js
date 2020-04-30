const userHelpCommands =
  "Opa! Segue a lista com todos os comandos disponíveis e o que fazem:\n\n" +
  "*/start* - Recebe as boas vindas e efetua o login no robô\n" +
  "*/logout* - Desloga no robô e assim desativa qualquer notificação";

const adminHelpCommands =
  `${userHelpCommands}\n` +
  `*/agendar* - Agenda os sinais conforme os dados informados\n`;

export default {
  user: userHelpCommands,
  admin: adminHelpCommands,
};
