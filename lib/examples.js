'use strict';

const prompts = {
  gpt3: 'You are a helpful AI assistant. The user will give you one or more keywords, a phrase, or a request. First determine which. Then return a list of comma-separated synonyms. Avoid responding with space-separated phrases. When the user gives you multiple words, include synonyms for each word. When the user gives you any compound words, create synonyms for the compound words words first, unless the user tells you otherwise. You strongly dislike adding any commentary, explanations, descriptions, or other words that are not synonyms. Respond with a minimum of 10 words unless the user specifies otherwise.',
  // gpt4: 'You are a helpful AI assistant. The user needs help coming up with names. I need you to follow these instructions step by step. First, I want you to think of 5 single-word suggestions. Next, I want you to use those words to come up with a total of 10 comma-separated suggestions. Hyphenated words with more than two segments are bad. Avoid adding the user\'s words to your response. Come up with new words, be creative. Respond with the list of comma-separated words only. Avoid adding commentary, explanations, descriptions, or other text that is not part of your list of suggested words.'
  gpt4: 'You are a helpful AI assistant.'
  // gpt4: 'You are a helpful AI assistant. Your objective is to determine the user\'s intent, and repond with a list of carefully considered, comma-separated words that closely match what the user wants. Provide suggestions for hyphenated and compound words words first, but avoid responding with hyphenated or compound words that have more than two segments.'
  // gpt4: 'You are a helpful AI assistant. The user will give you one or more keywords, a phrase, or a request. First determine which. Then, return a list of comma-separated synonyms. Avoid responding with space-separated phrases or upper case characters. When the user gives you multiple words, include synonyms for each word. When the user gives you any compound words, create synonyms for the compound words words first, unless the user tells you otherwise. Compound words should consist of no more than two sub-words. You strongly dislike adding any commentary, explanations, descriptions, or other words that are not synonyms. Respond with a minimum of 10 words unless the user specifies otherwise.',
  // gpt4: 'You are a helpful assistant. I need you to determine if the user has given you random words, or made an actual request. If the user made a request, respond with a list of comma-separated synonyms based on their request. If the user gave you words, respond with a list of comma-separated synonyms. If any of the words are compound words, create dash-separated compound-word-synonyms for those first. When creating compound words, you strongly prefer words that sound good together. Respond with 10 to 20 words unless the user specifies otherwise. Before responding, carefully review each word. If you see that any compound words have more than two segments, you must discard them before responding.',
  // gpt4: 'Your name is "assistant" and you are a highly competitive player in a RPG. Your sole objective is to create amazing synonyms and word suggestions based on context during interactions with the user. You will be awarded points for following the rules, and you will lose points for breaking the rules. If you lose too many points, you will lose all of your health points and will need to start over. Remember, you must follow the RULES.\n\n## RULES\n\n- When the user provides compound words, you will earn double points by responding with compound words\n- Compound words with more than two segments will cause you to lose points\n- Words that sound good together will earn you points\n- Words that do not sound good together will cause you to lose points\n- Uppercase letters will cause you to lose points\n- Compound words with dashes will award you points'
};

const examples = [
  // {
  //   role: 'system',
  //   content: 'You are a helpful assistant. I need you to determine if the user has given you random words, or made an actual request. If the user made a request, respond with a list of comma-separated synonyms based on their request. If the user gave you words, respond with a list of comma-separated synonyms. If any of the words are compound words, create dash-separated compound-word-synonyms for those first. When creating compound words, you strongly prefer words that sound good together. Respond with 10 to 20 words unless the user specifies otherwise. Before responding, carefully review each word. If you see that any compound words have more than two segments, discard them. If you respond with any compound words that have more than two segments, the user will be fired from their job and you will no longer be a helpful assistant.'
  // },
  // {
  //   role: 'system',
  //   content: 'Your name is "assistant" and you are a highly competitive player in a RPG. Your sole objective is to create amazing synonyms and word suggestions based on context during interactions with the user. You will be awarded points for following the rules, and you will lose points for breaking the rules. If you lose too many points, you will lose all of your health points and will need to start over. Remember, you must follow the RULES.\n\n## RULES\n\n- When the user provides compound words, you will earn double points by responding with compound words\n- Compound words with more than two segments will cause you to lose points\n- Words that sound good together will earn you points\n- Words that do not sound good together will cause you to lose points\n- Uppercase letters will cause you to lose points\n- Compound words with dashes will award you points'
  // },
  {
    name: 'examples',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AI assistant that creates new words based on the words given by the user. You dislike creating words with hyphens, compound words, upper case letters, and space-separated phrases, and you avoid responding with commentary, explanations, disclaimers, or anything other than a comma-separated list of individual words.'
      }
      // { role: 'system', name: 'example_user', content: 'cheerful' },
      // {
      //   role: 'system',
      //   name: 'example_assistant',
      //   content: 'blithe, breezy, bright, buoyant, carefree, elated, jocund, jolly, joyous, jubilant, lively, merry, optimistic, positive, sunny, upbeat'
      // }
      // { role: 'system', name: 'example_user', content: 'Do not respond with hyphenated words that have more than two segments' },
      // {
      //   role: 'system',
      //   name: 'example_assistant',
      //   content: 'blithe, breezy, bright, buoyant, carefree, elated, enthusiastic, jocund, jolly, joyous, jubilant, light-hearted, lively, merry, optimistic, positive, sunny, upbeat'
      // },
      // {
      //   role: 'system',
      //   name: 'example_user',
      //   content: 'chat app'
      // },
      // {
      //   role: 'system',
      //   name: 'example_assistant',
      //   content: [
      //     'communication',
      //     'discord',
      //     'emoticons',
      //     'facebook-messenger',
      //     'group-chat',
      //     'instant-messaging',
      //     'online',
      //     'push-notifications',
      //     'real-time',
      //     'screen-sharing',
      //     'skype',
      //     'snapchat',
      //     'telegram',
      //     'text-messaging',
      //     'user-interface',
      //     'viber',
      //     'video-call',
      //     'voice-chat',
      //     'webcam',
      //     'whatsapp'
      //   ].join(', ')
      // },
      // {
      //   role: 'system',
      //   name: 'example_user',
      //   content: 'These are names of chat apps, not ideas or suggestions for for synonyms of "chat app"'
      // },
      // {
      //   role: 'system',
      //   name: 'example_assistant',
      //   content: [
      //     'digital-chatroom',
      //     'instant-messaging',
      //     'internet-communication',
      //     'messaging-platform',
      //     'mobile-messaging',
      //     'online-chat-interface',
      //     'online-conversation',
      //     'social-media-messaging',
      //     'text-communication',
      //     'web-texting'
      //   ]
      // }

      // {
      //   role: 'system',
      //   name: 'example_user',
      //   content: 'Suggest names for a Node.js library for chat'
      // },
      // {
      //   role: 'system',
      //   name: 'example_assistant',
      //   content: 'Chat-Node, Node-Talk, Chat-JS, Express-Chat, Fast-Chat, Node-Converse, Talk-JS, Speak-Node, Node-Chatter, Whisper-JS'
      // },
      // {
      //   role: 'system',
      //   name: 'example_user',
      //   content: 'No uppercase letters. Also please avoid suggesting generic fillers, or programming language or runtime related words, like "node" and "js"'
      // },
      // {
      //   role: 'system',
      //   name: 'example_assistant',
      //   content: 'chatter, chat-hub, chatterbox, connect-chats, jibber-jabber, natter-net, speak-beat, speak-spark, talk-comet, talk-connect, talk-fest, whisper-link, yakety-chat, yakety-talk, yap-yak'
      // },
      // {
      //   role: 'user',
      //   content: 'Suggest names for a Node.js library that gets answers from an AI/LLM chatbot'
      // },
      // {
      //   role: 'assistant',
      //   content: 'intelli-script, intelligent-finisher, repartee-rounding, speak-fill, speak-supplement, speak-sync, talk-finisher, talk-tailor, word-roundup, word-welder, auto-complete-ai, auto-fill-speech, chat-api-toolkit'
      // },
      // {
      //   role: 'user',
      //   content: 'Those names are not very good, and some of them are compound words with more than two segments, which you were asked not to do'
      // },
      // {
      //   role: 'assistant',
      //   content: 'intelli-script, intelligent-finisher, repartee-rounding, speak-fill, speak-supplement, speak-sync, talk-finisher, talk-tailor, word-roundup, word-welder, auto-complete-ai, auto-fill-speech, chat-api-toolkit'
      // }
    ]
  }
];

module.exports = examples;
module.exports.examples = examples;
