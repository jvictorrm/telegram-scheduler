export default async (ctx) => {
  return ctx.replyWithMarkdown(
    `Oi, ${ctx.chat.first_name}! Tudo bem? Eu não consigo conversar com você no momento.😕\nCaso esteja precisando de alguma ajuda, digite: /help`
  );
};
