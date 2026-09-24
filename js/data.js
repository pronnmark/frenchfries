/* ------------------------------------------------------------------
   FRENCH FRIES — 6-Gear Verb Engine
   data.js : gears, pronouns, verbs (15 verbs x 6 gears x 6 persons)
   Plain script (no modules) so the app runs from file:// too.
------------------------------------------------------------------ */

const PRONOUNS_EN = ['I', 'you', 'he/she', 'we', 'you (pl.)', 'they'];

const GEARS = [
  {
    id: 'present',
    n: 1,
    vibe: 'Right Now',
    nick: 'The "Right Now"',
    fr: 'Le Présent',
    en: 'Present',
    icon: '▶',
    instruction: 'Use this for what is happening right now, or everyday facts.',
    when: 'Happening now · everyday truth'
  },
  {
    id: 'passe',
    n: 2,
    vibe: 'Done Deal',
    nick: 'The "Done Deal"',
    fr: 'Le Passé Composé',
    en: 'Completed Past',
    icon: '⏪',
    instruction: 'Use this for a sudden, finished event in the past. It is a dot on the timeline.',
    when: 'One finished event · a dot'
  },
  {
    id: 'imparfait',
    n: 3,
    vibe: 'Background',
    nick: 'The "Background"',
    fr: "L'Imparfait",
    en: 'Ongoing Past',
    icon: '〜',
    instruction: 'Use this to set the scene, describe past habits, or talk about ongoing background states.',
    when: 'Scene · habit · used to'
  },
  {
    id: 'futur',
    n: 4,
    vibe: 'Guarantee',
    nick: 'The "Guarantee"',
    fr: 'Le Futur Simple',
    en: 'Simple Future',
    icon: '⏩',
    instruction: 'Use this to declare what will definitely happen later.',
    when: 'Will definitely happen'
  },
  {
    id: 'conditionnel',
    n: 5,
    vibe: 'Alternate Universe',
    nick: 'The "Alternate Universe"',
    fr: 'Le Conditionnel',
    en: 'Conditional',
    icon: '◇',
    instruction: 'Use this for "would" scenarios, polite requests, and alternate realities.',
    when: 'Would · politely · if'
  },
  {
    id: 'subjonctif',
    n: 6,
    vibe: 'Heart & Gut',
    nick: 'The "Heart & Gut"',
    fr: 'Le Subjonctif',
    en: 'Subjunctive',
    icon: '♡',
    instruction: 'Use this after trigger phrases like "il faut que" (I must) or "je veux que" (I want that) to express emotion, doubt, or necessity.',
    when: 'Emotion · doubt · necessity'
  }
];

const GEAR_BY_ID = {};
for (const g of GEARS) GEAR_BY_ID[g.id] = g;

/* ---------------------------------------------------------------- */

const VERBS = [
  {
    id: 'etre', inf: 'être', en: 'to be', aux: 'avoir', family: 'irregular', core: true,
    enPresent: ['am', 'are', 'is', 'are', 'are', 'are'],
    enPast: ['was', 'were', 'was', 'were', 'were', 'were'],
    enPP: 'been', enInf: 'be',
    gears: {
      present: {
        forms: ['je suis', 'tu es', 'il/elle est', 'nous sommes', 'vous êtes', 'ils/elles sont'],
        phrase: ['Je suis prêt.', 'I am ready.'],
        chat: { in: 'Tu es où ?', inEn: 'Where are you?', pre: 'Je ', ans: 'suis', post: ' à la maison.', en: 'I am at home.' }
      },
      passe: {
        forms: ['j’ai été', 'tu as été', 'il/elle a été', 'nous avons été', 'vous avez été', 'ils/elles ont été'],
        phrase: ['J’ai été malade.', 'I was sick (and it is over).'],
        chat: { in: 'Tu sors ce soir ?', inEn: 'Are you going out tonight?', pre: 'Non, j’', ans: 'ai été', post: ' malade hier.', en: 'No, I was sick yesterday.' }
      },
      imparfait: {
        forms: ['j’étais', 'tu étais', 'il/elle était', 'nous étions', 'vous étiez', 'ils/elles étaient'],
        phrase: ['C’était génial.', 'It was great.'],
        chat: { in: 'Comment c’était, la fête ?', inEn: 'How was the party?', pre: 'C’', ans: 'était', post: ' génial !', en: 'It was great!' }
      },
      futur: {
        forms: ['je serai', 'tu seras', 'il/elle sera', 'nous serons', 'vous serez', 'ils/elles seront'],
        phrase: ['Je serai là.', 'I will be there.'],
        chat: { in: 'Tu viens demain ?', inEn: 'Are you coming tomorrow?', pre: 'Oui, je ', ans: 'serai', post: ' là à midi.', en: 'Yes, I will be there at noon.' }
      },
      conditionnel: {
        forms: ['je serais', 'tu serais', 'il/elle serait', 'nous serions', 'vous seriez', 'ils/elles seraient'],
        phrase: ['Je serais ravi.', 'I would be delighted.'],
        chat: { in: 'Tu veux un café ?', inEn: 'Do you want a coffee?', pre: 'Oui, je ', ans: 'serais', post: ' ravi.', en: 'Yes, I would be delighted.' }
      },
      subjonctif: {
        forms: ['que je sois', 'que tu sois', 'qu’il/elle soit', 'que nous soyons', 'que vous soyez', 'qu’ils/elles soient'],
        phrase: ['Il faut que je sois là.', 'I have to be there.'],
        chat: { in: 'Tu dois y aller ?', inEn: 'Do you have to go?', pre: 'Il faut que je ', ans: 'sois', post: ' là à 8h.', en: 'I have to be there at 8.' }
      }
    }
  },

  {
    id: 'avoir', inf: 'avoir', en: 'to have', aux: 'avoir', family: 'irregular', core: true,
    enPresent: ['have', 'have', 'has', 'have', 'have', 'have'],
    enPast: 'had', enPP: 'had', enInf: 'have',
    gears: {
      present: {
        forms: ['j’ai', 'tu as', 'il/elle a', 'nous avons', 'vous avez', 'ils/elles ont'],
        phrase: ['J’ai faim.', 'I am hungry (I have hunger).'],
        chat: { in: 'Tu veux manger ?', inEn: 'Do you want to eat?', pre: 'Oui, j’', ans: 'ai', post: ' faim.', en: 'Yes, I am hungry.' }
      },
      passe: {
        forms: ['j’ai eu', 'tu as eu', 'il/elle a eu', 'nous avons eu', 'vous avez eu', 'ils/elles ont eu'],
        phrase: ['J’ai eu un problème.', 'I had a problem (and it is over).'],
        chat: { in: 'Pourquoi tu es en retard ?', inEn: 'Why are you late?', pre: 'J’', ans: 'ai eu', post: ' un problème de métro.', en: 'I had a problem with the metro.' }
      },
      imparfait: {
        forms: ['j’avais', 'tu avais', 'il/elle avait', 'nous avions', 'vous aviez', 'ils/elles avaient'],
        phrase: ['Quand j’avais 10 ans…', 'When I was 10 years old…'],
        chat: { in: 'Tu habitais où, enfant ?', inEn: 'Where did you live as a kid?', pre: 'Quand j’', ans: 'avais', post: ' 10 ans, à Lyon.', en: 'When I was 10, in Lyon.' }
      },
      futur: {
        forms: ['j’aurai', 'tu auras', 'il/elle aura', 'nous aurons', 'vous aurez', 'ils/elles auront'],
        phrase: ['J’aurai le temps demain.', 'I will have time tomorrow.'],
        chat: { in: 'On se voit quand ?', inEn: 'When are we meeting?', pre: 'J’', ans: 'aurai', post: ' le temps demain.', en: 'I will have time tomorrow.' }
      },
      conditionnel: {
        forms: ['j’aurais', 'tu aurais', 'il/elle aurait', 'nous aurions', 'vous auriez', 'ils/elles auraient'],
        phrase: ['J’aurais besoin d’aide.', 'I would need some help.'],
        chat: { in: 'Ça va, le déménagement ?', inEn: 'How is the move going?', pre: 'J’', ans: 'aurais', post: ' besoin d’aide.', en: 'I would need some help.' }
      },
      subjonctif: {
        forms: ['que j’aie', 'que tu aies', 'qu’il/elle ait', 'que nous ayons', 'que vous ayez', 'qu’ils/elles aient'],
        phrase: ['Il faut que j’aie mon passeport.', 'It is necessary that I have my passport.'],
        chat: { in: 'Tu peux voyager ?', inEn: 'Can you travel?', pre: 'Il faut que j’', ans: 'aie', post: ' mon passeport.', en: 'I need to have my passport.' }
      }
    }
  },

  {
    id: 'aller', inf: 'aller', en: 'to go', aux: 'être', family: 'irregular', core: true,
    enPresent: ['go', 'go', 'goes', 'go', 'go', 'go'],
    enPast: 'went', enPP: 'gone', enInf: 'go',
    gears: {
      present: {
        forms: ['je vais', 'tu vas', 'il/elle va', 'nous allons', 'vous allez', 'ils/elles vont'],
        phrase: ['Je vais au travail.', 'I am going to work.'],
        chat: { in: 'Tu vas où comme ça ?', inEn: 'Where are you off to?', pre: 'Je ', ans: 'vais', post: ' au travail.', en: 'I am going to work.' }
      },
      passe: {
        forms: ['je suis allé(e)', 'tu es allé(e)', 'il est allé / elle est allée', 'nous sommes allé(e)s', 'vous êtes allé(e)(s)', 'ils sont allés / elles sont allées'],
        phrase: ['J’y suis allé hier.', 'I went there yesterday.'],
        chat: { in: 'Tu connais ce restaurant ?', inEn: 'Do you know this restaurant?', pre: 'Oui, j’y ', ans: 'suis allé', post: ' hier.', en: 'Yes, I went there yesterday.' }
      },
      imparfait: {
        forms: ['j’allais', 'tu allais', 'il/elle allait', 'nous allions', 'vous alliez', 'ils/elles allaient'],
        phrase: ['On allait chez ma grand-mère.', 'We used to go to my grandmother’s.'],
        chat: { in: 'Vous faisiez quoi, le dimanche ?', inEn: 'What did you do on Sundays?', pre: 'On ', ans: 'allait', post: ' chez ma grand-mère.', en: 'We used to go to my grandmother’s.' }
      },
      futur: {
        forms: ['j’irai', 'tu iras', 'il/elle ira', 'nous irons', 'vous irez', 'ils/elles iront'],
        phrase: ['J’irai en Espagne.', 'I will go to Spain.'],
        chat: { in: 'Tu es libre en août ?', inEn: 'Are you free in August?', pre: 'Non, j’', ans: 'irai', post: ' en Espagne.', en: 'No, I will go to Spain.' }
      },
      conditionnel: {
        forms: ['j’irais', 'tu irais', 'il/elle irait', 'nous irions', 'vous iriez', 'ils/elles iraient'],
        phrase: ['J’irais bien au cinéma.', 'I would happily go to the cinema.'],
        chat: { in: 'Et si on sortait ?', inEn: 'What if we went out?', pre: 'J’', ans: 'irais', post: ' bien au cinéma.', en: 'I would happily go to the cinema.' }
      },
      subjonctif: {
        forms: ['que j’aille', 'que tu ailles', 'qu’il/elle aille', 'que nous allions', 'que vous alliez', 'qu’ils/elles aillent'],
        phrase: ['Il faut que j’aille chez le médecin.', 'I have to go to the doctor.'],
        chat: { in: 'Tu as de la fièvre.', inEn: 'You have a fever.', pre: 'Il faut que j’', ans: 'aille', post: ' chez le médecin.', en: 'I have to go to the doctor.' }
      }
    }
  },

  {
    id: 'faire', inf: 'faire', en: 'to do / to make', aux: 'avoir', family: 'irregular', core: true,
    enPresent: ['do', 'do', 'does', 'do', 'do', 'do'],
    enPast: 'did', enPP: 'done', enInf: 'do',
    gears: {
      present: {
        forms: ['je fais', 'tu fais', 'il/elle fait', 'nous faisons', 'vous faites', 'ils/elles font'],
        phrase: ['Je fais la cuisine.', 'I am cooking.'],
        chat: { in: 'Tu es libre ?', inEn: 'Are you free?', pre: 'Non, je ', ans: 'fais', post: ' la cuisine.', en: 'No, I am cooking.' }
      },
      passe: {
        forms: ['j’ai fait', 'tu as fait', 'il/elle a fait', 'nous avons fait', 'vous avez fait', 'ils/elles ont fait'],
        phrase: ['J’ai fait le ménage.', 'I did the cleaning.'],
        chat: { in: 'C’est propre ici !', inEn: 'It is clean in here!', pre: 'Oui, j’', ans: 'ai fait', post: ' le ménage.', en: 'Yes, I did the cleaning.' }
      },
      imparfait: {
        forms: ['je faisais', 'tu faisais', 'il/elle faisait', 'nous faisions', 'vous faisiez', 'ils/elles faisaient'],
        phrase: ['Je faisais du piano.', 'I used to play piano.'],
        chat: { in: 'Tu jouais d’un instrument ?', inEn: 'Did you play an instrument?', pre: 'Je ', ans: 'faisais', post: ' du piano avant.', en: 'I used to play piano.' }
      },
      futur: {
        forms: ['je ferai', 'tu feras', 'il/elle fera', 'nous ferons', 'vous ferez', 'ils/elles feront'],
        phrase: ['Je ferai ça plus tard.', 'I will do that later.'],
        chat: { in: 'Et la vaisselle ?', inEn: 'What about the dishes?', pre: 'Je ', ans: 'ferai', post: ' ça plus tard.', en: 'I will do that later.' }
      },
      conditionnel: {
        forms: ['je ferais', 'tu ferais', 'il/elle ferait', 'nous ferions', 'vous feriez', 'ils/elles feraient'],
        phrase: ['Je ferais comme toi.', 'I would do the same as you.'],
        chat: { in: 'À ma place, tu dirais quoi ?', inEn: 'In my place, what would you say?', pre: 'Moi, je ', ans: 'ferais', post: ' comme toi.', en: 'Me, I would do the same as you.' }
      },
      subjonctif: {
        forms: ['que je fasse', 'que tu fasses', 'qu’il/elle fasse', 'que nous fassions', 'que vous fassiez', 'qu’ils/elles fassent'],
        phrase: ['Il faut que je fasse les courses.', 'I have to do the shopping.'],
        chat: { in: 'Le frigo est vide.', inEn: 'The fridge is empty.', pre: 'Il faut que je ', ans: 'fasse', post: ' les courses.', en: 'I have to do the shopping.' }
      }
    }
  },

  {
    id: 'pouvoir', inf: 'pouvoir', en: 'to be able to / can', aux: 'avoir', family: 'irregular', core: true,
    enPresent: ['can', 'can', 'can', 'can', 'can', 'can'],
    enPast: 'could', enPP: 'been able to', enInf: 'be able to',
    gears: {
      present: {
        forms: ['je peux', 'tu peux', 'il/elle peut', 'nous pouvons', 'vous pouvez', 'ils/elles peuvent'],
        phrase: ['Je peux t’aider.', 'I can help you.'],
        chat: { in: 'Tu m’aides ?', inEn: 'Will you help me?', pre: 'Oui, je ', ans: 'peux', post: ' t’aider.', en: 'Yes, I can help you.' }
      },
      passe: {
        forms: ['j’ai pu', 'tu as pu', 'il/elle a pu', 'nous avons pu', 'vous avez pu', 'ils/elles ont pu'],
        phrase: ['J’ai pu tout finir.', 'I managed to finish everything.'],
        chat: { in: 'Tu as fini ?', inEn: 'Did you finish?', pre: 'Oui, j’', ans: 'ai pu', post: ' tout finir.', en: 'Yes, I managed to finish everything.' }
      },
      imparfait: {
        forms: ['je pouvais', 'tu pouvais', 'il/elle pouvait', 'nous pouvions', 'vous pouviez', 'ils/elles pouvaient'],
        phrase: ['Je ne pouvais plus rester.', 'I could not stay any longer.'],
        chat: { in: 'Pourquoi tu es parti ?', inEn: 'Why did you leave?', pre: 'Je ne ', ans: 'pouvais', post: ' plus rester.', en: 'I could not stay any longer.' }
      },
      futur: {
        forms: ['je pourrai', 'tu pourras', 'il/elle pourra', 'nous pourrons', 'vous pourrez', 'ils/elles pourront'],
        phrase: ['Je pourrai la voir samedi.', 'I will be able to see it Saturday.'],
        chat: { in: 'Tu répares ma voiture ?', inEn: 'Will you fix my car?', pre: 'Je ', ans: 'pourrai', post: ' la voir samedi.', en: 'I will be able to look at it Saturday.' }
      },
      conditionnel: {
        forms: ['je pourrais', 'tu pourrais', 'il/elle pourrait', 'nous pourrions', 'vous pourriez', 'ils/elles pourraient'],
        phrase: ['Tu pourrais m’aider ?', 'Could you help me?'],
        chat: { in: 'Tu as deux minutes ?', inEn: 'Do you have two minutes?', pre: 'Tu ', ans: 'pourrais', post: ' m’aider ?', en: 'Could you help me?' }
      },
      subjonctif: {
        forms: ['que je puisse', 'que tu puisses', 'qu’il/elle puisse', 'que nous puissions', 'que vous puissiez', 'qu’ils/elles puissent'],
        phrase: ['pour que je puisse venir', 'so that I can come'],
        chat: { in: 'Tu veux que je réserve ?', inEn: 'Do you want me to book?', pre: 'Oui, pour que je ', ans: 'puisse', post: ' venir.', en: 'Yes, so that I can come.' }
      }
    }
  },

  {
    id: 'vouloir', inf: 'vouloir', en: 'to want', aux: 'avoir', family: 'irregular', core: true,
    enPresent: ['want', 'want', 'wants', 'want', 'want', 'want'],
    enPast: 'wanted', enPP: 'wanted', enInf: 'want',
    gears: {
      present: {
        forms: ['je veux', 'tu veux', 'il/elle veut', 'nous voulons', 'vous voulez', 'ils/elles veulent'],
        phrase: ['Je veux bien !', 'I would love to!'],
        chat: { in: 'On commande une pizza ?', inEn: 'Shall we order a pizza?', pre: 'Oui, je ', ans: 'veux', post: ' bien !', en: 'Yes, I would love to!' }
      },
      passe: {
        forms: ['j’ai voulu', 'tu as voulu', 'il/elle a voulu', 'nous avons voulu', 'vous avez voulu', 'ils/elles ont voulu'],
        phrase: ['Il a voulu rentrer tôt.', 'He wanted to go home early.'],
        chat: { in: 'Pourquoi il est parti ?', inEn: 'Why did he leave?', pre: 'Il ', ans: 'a voulu', post: ' rentrer tôt.', en: 'He wanted to go home early.' }
      },
      imparfait: {
        forms: ['je voulais', 'tu voulais', 'il/elle voulait', 'nous voulions', 'vous vouliez', 'ils/elles voulaient'],
        phrase: ['Je voulais venir, mais…', 'I wanted to come, but…'],
        chat: { in: 'Tu as changé d’avis ?', inEn: 'Did you change your mind?', pre: 'Je ', ans: 'voulais', post: ' venir, mais…', en: 'I wanted to come, but…' }
      },
      futur: {
        forms: ['je voudrai', 'tu voudras', 'il/elle voudra', 'nous voudrons', 'vous voudrez', 'ils/elles voudront'],
        phrase: ['Il voudra plus d’argent.', 'He will want more money.'],
        chat: { in: 'Il acceptera ?', inEn: 'Will he accept?', pre: 'Il ', ans: 'voudra', post: ' plus d’argent.', en: 'He will want more money.' }
      },
      conditionnel: {
        forms: ['je voudrais', 'tu voudrais', 'il/elle voudrait', 'nous voudrions', 'vous voudriez', 'ils/elles voudraient'],
        phrase: ['Je voudrais un café.', 'I would like a coffee.'],
        chat: { in: 'Vous désirez ?', inEn: 'What would you like?', pre: 'Je ', ans: 'voudrais', post: ' un café, s’il vous plaît.', en: 'I would like a coffee, please.' }
      },
      subjonctif: {
        forms: ['que je veuille', 'que tu veuilles', 'qu’il/elle veuille', 'que nous voulions', 'que vous vouliez', 'qu’ils/elles veuillent'],
        phrase: ['Je doute qu’elle veuille venir.', 'I doubt she wants to come.'],
        chat: { in: 'Elle vient avec nous ?', inEn: 'Is she coming with us?', pre: 'Je doute qu’elle ', ans: 'veuille', post: ' venir.', en: 'I doubt she wants to come.' }
      }
    }
  },

  {
    id: 'devoir', inf: 'devoir', en: 'to have to / must', aux: 'avoir', family: 'irregular',
    enPresent: ['must', 'must', 'must', 'must', 'must', 'must'],
    enPast: 'had to', enPP: 'had to', enInf: 'have to',
    gears: {
      present: {
        forms: ['je dois', 'tu dois', 'il/elle doit', 'nous devons', 'vous devez', 'ils/elles doivent'],
        phrase: ['Je dois partir.', 'I have to leave.'],
        chat: { in: 'Tu restes encore ?', inEn: 'Are you staying longer?', pre: 'Non, je ', ans: 'dois', post: ' partir.', en: 'No, I have to leave.' }
      },
      passe: {
        forms: ['j’ai dû', 'tu as dû', 'il/elle a dû', 'nous avons dû', 'vous avez dû', 'ils/elles ont dû'],
        phrase: ['Elle a dû rentrer.', 'She had to go home.'],
        chat: { in: 'Où est Léa ?', inEn: 'Where is Léa?', pre: 'Elle ', ans: 'a dû', post: ' rentrer.', en: 'She had to go home.' }
      },
      imparfait: {
        forms: ['je devais', 'tu devais', 'il/elle devait', 'nous devions', 'vous deviez', 'ils/elles devaient'],
        phrase: ['Je devais travailler.', 'I had to work.'],
        chat: { in: 'Pourquoi tu n’es pas venu ?', inEn: 'Why didn’t you come?', pre: 'Je ', ans: 'devais', post: ' travailler.', en: 'I had to work.' }
      },
      futur: {
        forms: ['je devrai', 'tu devras', 'il/elle devra', 'nous devrons', 'vous devrez', 'ils/elles devront'],
        phrase: ['Je devrai déménager.', 'I will have to move.'],
        chat: { in: 'Le loyer augmente.', inEn: 'The rent is going up.', pre: 'Je ', ans: 'devrai', post: ' déménager.', en: 'I will have to move.' }
      },
      conditionnel: {
        forms: ['je devrais', 'tu devrais', 'il/elle devrait', 'nous devrions', 'vous devriez', 'ils/elles devraient'],
        phrase: ['Tu devrais le rappeler.', 'You should call him back.'],
        chat: { in: 'Il ne répond pas.', inEn: 'He is not answering.', pre: 'Tu ', ans: 'devrais', post: ' le rappeler.', en: 'You should call him back.' }
      },
      subjonctif: {
        forms: ['que je doive', 'que tu doives', 'qu’il/elle doive', 'que nous devions', 'que vous deviez', 'qu’ils/elles doivent'],
        phrase: ['Je ne crois pas qu’il doive payer.', 'I don’t think he has to pay.'],
        chat: { in: 'Il paie l’amende ?', inEn: 'Is he paying the fine?', pre: 'Je ne crois pas qu’il ', ans: 'doive', post: ' payer.', en: 'I don’t think he has to pay.' }
      }
    }
  },

  {
    id: 'savoir', inf: 'savoir', en: 'to know', aux: 'avoir', family: 'irregular',
    enPresent: ['know', 'know', 'knows', 'know', 'know', 'know'],
    enPast: 'knew', enPP: 'known', enInf: 'know',
    gears: {
      present: {
        forms: ['je sais', 'tu sais', 'il/elle sait', 'nous savons', 'vous savez', 'ils/elles savent'],
        phrase: ['Je ne sais pas.', 'I don’t know.'],
        chat: { in: 'C’est où, la gare ?', inEn: 'Where is the station?', pre: 'Je ne ', ans: 'sais', post: ' pas, désolé.', en: 'I don’t know, sorry.' }
      },
      passe: {
        forms: ['j’ai su', 'tu as su', 'il/elle a su', 'nous avons su', 'vous avez su', 'ils/elles ont su'],
        phrase: ['Je l’ai su hier.', 'I found out yesterday.'],
        chat: { in: 'Comment tu l’as appris ?', inEn: 'How did you find out?', pre: 'Je l’', ans: 'ai su', post: ' hier soir.', en: 'I found out last night.' }
      },
      imparfait: {
        forms: ['je savais', 'tu savais', 'il/elle savait', 'nous savions', 'vous saviez', 'ils/elles savaient'],
        phrase: ['Je ne savais pas.', 'I didn’t know.'],
        chat: { in: 'Tu étais au courant ?', inEn: 'Did you know about it?', pre: 'Non, je ne ', ans: 'savais', post: ' pas.', en: 'No, I didn’t know.' }
      },
      futur: {
        forms: ['je saurai', 'tu sauras', 'il/elle saura', 'nous saurons', 'vous saurez', 'ils/elles sauront'],
        phrase: ['On saura demain.', 'We will know tomorrow.'],
        chat: { in: 'Et les résultats ?', inEn: 'What about the results?', pre: 'On ', ans: 'saura', post: ' demain.', en: 'We will know tomorrow.' }
      },
      conditionnel: {
        forms: ['je saurais', 'tu saurais', 'il/elle saurait', 'nous saurions', 'vous sauriez', 'ils/elles sauraient'],
        phrase: ['Je ne saurais pas l’expliquer.', 'I wouldn’t know how to explain it.'],
        chat: { in: 'Tu peux m’expliquer ?', inEn: 'Can you explain it to me?', pre: 'Je ne ', ans: 'saurais', post: ' pas l’expliquer.', en: 'I wouldn’t know how to explain it.' }
      },
      subjonctif: {
        forms: ['que je sache', 'que tu saches', 'qu’il/elle sache', 'que nous sachions', 'que vous sachiez', 'qu’ils/elles sachent'],
        phrase: ['Je ne veux pas qu’il sache.', 'I don’t want him to know.'],
        chat: { in: 'Tu veux que je lui dise ?', inEn: 'Do you want me to tell him?', pre: 'Non, je ne veux pas qu’il ', ans: 'sache', post: '.', en: 'No, I don’t want him to know.' }
      }
    }
  },

  {
    id: 'dire', inf: 'dire', en: 'to say / to tell', aux: 'avoir', family: 'irregular',
    enPresent: ['say', 'say', 'says', 'say', 'say', 'say'],
    enPast: 'said', enPP: 'said', enInf: 'say',
    gears: {
      present: {
        forms: ['je dis', 'tu dis', 'il/elle dit', 'nous disons', 'vous dites', 'ils/elles disent'],
        phrase: ['Elle dit que c’est fini.', 'She says it is over.'],
        chat: { in: 'Elle raconte quoi ?', inEn: 'What is she saying?', pre: 'Elle ', ans: 'dit', post: ' que c’est fini.', en: 'She says it is over.' }
      },
      passe: {
        forms: ['j’ai dit', 'tu as dit', 'il/elle a dit', 'nous avons dit', 'vous avez dit', 'ils/elles ont dit'],
        phrase: ['Je lui ai dit la vérité.', 'I told him the truth.'],
        chat: { in: 'Tu lui as parlé ?', inEn: 'Did you talk to him?', pre: 'Oui, je lui ', ans: 'ai dit', post: ' la vérité.', en: 'Yes, I told him the truth.' }
      },
      imparfait: {
        forms: ['je disais', 'tu disais', 'il/elle disait', 'nous disions', 'vous disiez', 'ils/elles disaient'],
        phrase: ['Il disait toujours ça.', 'He always used to say that.'],
        chat: { in: 'Tu le connaissais bien ?', inEn: 'Did you know him well?', pre: 'Il ', ans: 'disait', post: ' toujours ça.', en: 'He always used to say that.' }
      },
      futur: {
        forms: ['je dirai', 'tu diras', 'il/elle dira', 'nous dirons', 'vous direz', 'ils/elles diront'],
        phrase: ['Je leur dirai ce soir.', 'I will tell them tonight.'],
        chat: { in: 'Et tes parents ?', inEn: 'What about your parents?', pre: 'Je leur ', ans: 'dirai', post: ' ce soir.', en: 'I will tell them tonight.' }
      },
      conditionnel: {
        forms: ['je dirais', 'tu dirais', 'il/elle dirait', 'nous dirions', 'vous diriez', 'ils/elles diraient'],
        phrase: ['À ta place, je ne dirais rien.', 'In your place, I wouldn’t say anything.'],
        chat: { in: 'J’en parle à Paul ?', inEn: 'Should I tell Paul?', pre: 'À ta place, je ne ', ans: 'dirais', post: ' rien.', en: 'In your place, I wouldn’t say anything.' }
      },
      subjonctif: {
        forms: ['que je dise', 'que tu dises', 'qu’il/elle dise', 'que nous disions', 'que vous disiez', 'qu’ils/elles disent'],
        phrase: ['Il faut que je te dise quelque chose.', 'I have to tell you something.'],
        chat: { in: 'Tout va bien ?', inEn: 'Is everything ok?', pre: 'Il faut que je te ', ans: 'dise', post: ' quelque chose.', en: 'I have to tell you something.' }
      }
    }
  },

  {
    id: 'venir', inf: 'venir', en: 'to come', aux: 'être', family: 'irregular',
    enPresent: ['come', 'come', 'comes', 'come', 'come', 'come'],
    enPast: 'came', enPP: 'come', enInf: 'come',
    gears: {
      present: {
        forms: ['je viens', 'tu viens', 'il/elle vient', 'nous venons', 'vous venez', 'ils/elles viennent'],
        phrase: ['Je viens tout de suite.', 'I am coming right away.'],
        chat: { in: 'Tu es loin ?', inEn: 'Are you far?', pre: 'Non, je ', ans: 'viens', post: ' tout de suite.', en: 'No, I am coming right away.' }
      },
      passe: {
        forms: ['je suis venu(e)', 'tu es venu(e)', 'il est venu / elle est venue', 'nous sommes venu(e)s', 'vous êtes venu(e)(s)', 'ils sont venus / elles sont venues'],
        phrase: ['Marie est venue ce matin.', 'Marie came this morning.'],
        chat: { in: 'Personne n’est passé ?', inEn: 'Nobody came by?', pre: 'Si, Marie ', ans: 'est venue', post: ' ce matin.', en: 'Yes, Marie came this morning.' }
      },
      imparfait: {
        forms: ['je venais', 'tu venais', 'il/elle venait', 'nous venions', 'vous veniez', 'ils/elles venaient'],
        phrase: ['Il venait chaque été.', 'He used to come every summer.'],
        chat: { in: 'Vous vous voyiez souvent ?', inEn: 'Did you see each other often?', pre: 'Il ', ans: 'venait', post: ' chaque été.', en: 'He used to come every summer.' }
      },
      futur: {
        forms: ['je viendrai', 'tu viendras', 'il/elle viendra', 'nous viendrons', 'vous viendrez', 'ils/elles viendront'],
        phrase: ['Je viendrai avec Léo.', 'I will come with Léo.'],
        chat: { in: 'Tu es là samedi ?', inEn: 'Are you around Saturday?', pre: 'Oui, je ', ans: 'viendrai', post: ' avec Léo.', en: 'Yes, I will come with Léo.' }
      },
      conditionnel: {
        forms: ['je viendrais', 'tu viendrais', 'il/elle viendrait', 'nous viendrions', 'vous viendriez', 'ils/elles viendraient'],
        phrase: ['Je viendrais si j’avais le temps.', 'I would come if I had time.'],
        chat: { in: 'On fait une fête vendredi.', inEn: 'We are having a party Friday.', pre: 'Je ', ans: 'viendrais', post: ' si j’avais le temps.', en: 'I would come if I had time.' }
      },
      subjonctif: {
        forms: ['que je vienne', 'que tu viennes', 'qu’il/elle vienne', 'que nous venions', 'que vous veniez', 'qu’ils/elles viennent'],
        phrase: ['J’aimerais qu’il vienne.', 'I would like him to come.'],
        chat: { in: 'Tu as invité Marc ?', inEn: 'Did you invite Marc?', pre: 'Oui, j’aimerais qu’il ', ans: 'vienne', post: '.', en: 'Yes, I would like him to come.' }
      }
    }
  },

  {
    id: 'prendre', inf: 'prendre', en: 'to take', aux: 'avoir', family: 'irregular',
    enPresent: ['take', 'take', 'takes', 'take', 'take', 'take'],
    enPast: 'took', enPP: 'taken', enInf: 'take',
    gears: {
      present: {
        forms: ['je prends', 'tu prends', 'il/elle prend', 'nous prenons', 'vous prenez', 'ils/elles prennent'],
        phrase: ['Je prends mon café noir.', 'I take my coffee black.'],
        chat: { in: 'Tu veux du sucre ?', inEn: 'Do you want sugar?', pre: 'Non, je ', ans: 'prends', post: ' mon café noir.', en: 'No, I take my coffee black.' }
      },
      passe: {
        forms: ['j’ai pris', 'tu as pris', 'il/elle a pris', 'nous avons pris', 'vous avez pris', 'ils/elles ont pris'],
        phrase: ['J’ai pris le train.', 'I took the train.'],
        chat: { in: 'Tu es venu comment ?', inEn: 'How did you get here?', pre: 'J’', ans: 'ai pris', post: ' le train.', en: 'I took the train.' }
      },
      imparfait: {
        forms: ['je prenais', 'tu prenais', 'il/elle prenait', 'nous prenions', 'vous preniez', 'ils/elles prenaient'],
        phrase: ['Je prenais le bus.', 'I used to take the bus.'],
        chat: { in: 'Avant, tu conduisais ?', inEn: 'Did you use to drive?', pre: 'Non, je ', ans: 'prenais', post: ' le bus.', en: 'No, I used to take the bus.' }
      },
      futur: {
        forms: ['je prendrai', 'tu prendras', 'il/elle prendra', 'nous prendrons', 'vous prendrez', 'ils/elles prendront'],
        phrase: ['Je prendrai celui de 10h.', 'I will take the 10 o’clock one.'],
        chat: { in: 'Tu as le vol de 8h ?', inEn: 'Are you on the 8am flight?', pre: 'Non, je ', ans: 'prendrai', post: ' celui de 10h.', en: 'No, I will take the 10 o’clock one.' }
      },
      conditionnel: {
        forms: ['je prendrais', 'tu prendrais', 'il/elle prendrait', 'nous prendrions', 'vous prendriez', 'ils/elles prendraient'],
        phrase: ['Je prendrais bien un dessert.', 'I would happily have a dessert.'],
        chat: { in: 'C’était bon ?', inEn: 'Was it good?', pre: 'Oui, je ', ans: 'prendrais', post: ' bien un dessert.', en: 'Yes, I would happily have a dessert.' }
      },
      subjonctif: {
        forms: ['que je prenne', 'que tu prennes', 'qu’il/elle prenne', 'que nous prenions', 'que vous preniez', 'qu’ils/elles prennent'],
        phrase: ['Il faut que tu prennes un parapluie.', 'You need to take an umbrella.'],
        chat: { in: 'Il pleut très fort.', inEn: 'It is raining hard.', pre: 'Il faut que tu ', ans: 'prennes', post: ' un parapluie.', en: 'You need to take an umbrella.' }
      }
    }
  },

  {
    id: 'voir', inf: 'voir', en: 'to see', aux: 'avoir', family: 'irregular',
    enPresent: ['see', 'see', 'sees', 'see', 'see', 'see'],
    enPast: 'saw', enPP: 'seen', enInf: 'see',
    gears: {
      present: {
        forms: ['je vois', 'tu vois', 'il/elle voit', 'nous voyons', 'vous voyez', 'ils/elles voient'],
        phrase: ['Je vois ce que tu veux dire.', 'I see what you mean.'],
        chat: { in: 'Tu me suis ?', inEn: 'Are you following me?', pre: 'Oui, je ', ans: 'vois', post: ' ce que tu veux dire.', en: 'Yes, I see what you mean.' }
      },
      passe: {
        forms: ['j’ai vu', 'tu as vu', 'il/elle a vu', 'nous avons vu', 'vous avez vu', 'ils/elles ont vu'],
        phrase: ['Je l’ai vu deux fois.', 'I saw it twice.'],
        chat: { in: 'Tu as regardé ce film ?', inEn: 'Have you watched this film?', pre: 'Oui, je l’', ans: 'ai vu', post: ' deux fois.', en: 'Yes, I saw it twice.' }
      },
      imparfait: {
        forms: ['je voyais', 'tu voyais', 'il/elle voyait', 'nous voyions', 'vous voyiez', 'ils/elles voyaient'],
        phrase: ['On se voyait tous les jours.', 'We used to see each other every day.'],
        chat: { in: 'Vous étiez proches ?', inEn: 'Were you close?', pre: 'Oui, on se ', ans: 'voyait', post: ' tous les jours.', en: 'Yes, we used to see each other every day.' }
      },
      futur: {
        forms: ['je verrai', 'tu verras', 'il/elle verra', 'nous verrons', 'vous verrez', 'ils/elles verront'],
        phrase: ['On verra demain.', 'We will see tomorrow.'],
        chat: { in: 'On se retrouve quand ?', inEn: 'When shall we meet?', pre: 'On ', ans: 'verra', post: ' demain.', en: 'We will see tomorrow.' }
      },
      conditionnel: {
        forms: ['je verrais', 'tu verrais', 'il/elle verrait', 'nous verrions', 'vous verriez', 'ils/elles verraient'],
        phrase: ['Je verrais bien une comédie.', 'I would happily watch a comedy.'],
        chat: { in: 'Un ciné ce soir ?', inEn: 'Cinema tonight?', pre: 'Je ', ans: 'verrais', post: ' bien une comédie.', en: 'I would happily watch a comedy.' }
      },
      subjonctif: {
        forms: ['que je voie', 'que tu voies', 'qu’il/elle voie', 'que nous voyions', 'que vous voyiez', 'qu’ils/elles voient'],
        phrase: ['Il faut qu’il voie le problème.', 'He needs to see the problem.'],
        chat: { in: 'Explique-lui !', inEn: 'Explain it to him!', pre: 'Oui, il faut qu’il ', ans: 'voie', post: ' le problème.', en: 'Yes, he needs to see the problem.' }
      }
    }
  },

  {
    id: 'parler', inf: 'parler', en: 'to speak / to talk', aux: 'avoir', family: '-er model', core: true,
    enPresent: ['speak', 'speak', 'speaks', 'speak', 'speak', 'speak'],
    enPast: 'spoke', enPP: 'spoken', enInf: 'speak',
    gears: {
      present: {
        forms: ['je parle', 'tu parles', 'il/elle parle', 'nous parlons', 'vous parlez', 'ils/elles parlent'],
        phrase: ['Je parle espagnol.', 'I speak Spanish.'],
        chat: { in: 'Tu comprends l’italien ?', inEn: 'Do you understand Italian?', pre: 'Non, mais je ', ans: 'parle', post: ' espagnol.', en: 'No, but I speak Spanish.' }
      },
      passe: {
        forms: ['j’ai parlé', 'tu as parlé', 'il/elle a parlé', 'nous avons parlé', 'vous avez parlé', 'ils/elles ont parlé'],
        phrase: ['Je lui ai parlé ce matin.', 'I spoke to him this morning.'],
        chat: { in: 'Tu as vu le chef ?', inEn: 'Did you see the boss?', pre: 'Oui, je lui ', ans: 'ai parlé', post: ' ce matin.', en: 'Yes, I spoke to him this morning.' }
      },
      imparfait: {
        forms: ['je parlais', 'tu parlais', 'il/elle parlait', 'nous parlions', 'vous parliez', 'ils/elles parlaient'],
        phrase: ['Elle parlait sans arrêt.', 'She used to talk non-stop.'],
        chat: { in: 'Elle était bavarde ?', inEn: 'Was she talkative?', pre: 'Elle ', ans: 'parlait', post: ' sans arrêt.', en: 'She used to talk non-stop.' }
      },
      futur: {
        forms: ['je parlerai', 'tu parleras', 'il/elle parlera', 'nous parlerons', 'vous parlerez', 'ils/elles parleront'],
        phrase: ['J’en parlerai au patron.', 'I will talk to the boss about it.'],
        chat: { in: 'Et ton salaire ?', inEn: 'What about your salary?', pre: 'J’en ', ans: 'parlerai', post: ' au patron.', en: 'I will talk to the boss about it.' }
      },
      conditionnel: {
        forms: ['je parlerais', 'tu parlerais', 'il/elle parlerait', 'nous parlerions', 'vous parleriez', 'ils/elles parleraient'],
        phrase: ['Je parlerais franchement.', 'I would speak frankly.'],
        chat: { in: 'Tu oses lui dire ?', inEn: 'Would you dare tell him?', pre: 'Moi, je ', ans: 'parlerais', post: ' franchement.', en: 'Me, I would speak frankly.' }
      },
      subjonctif: {
        forms: ['que je parle', 'que tu parles', 'qu’il/elle parle', 'que nous parlions', 'que vous parliez', 'qu’ils/elles parlent'],
        phrase: ['Il faut qu’on parle.', 'We need to talk.'],
        chat: { in: 'Tu es fâché ?', inEn: 'Are you upset?', pre: 'Il faut qu’on ', ans: 'parle', post: '.', en: 'We need to talk.' }
      }
    }
  },

  {
    id: 'finir', inf: 'finir', en: 'to finish', aux: 'avoir', family: '-ir model',
    enPresent: ['finish', 'finish', 'finishes', 'finish', 'finish', 'finish'],
    enPast: 'finished', enPP: 'finished', enInf: 'finish',
    gears: {
      present: {
        forms: ['je finis', 'tu finis', 'il/elle finit', 'nous finissons', 'vous finissez', 'ils/elles finissent'],
        phrase: ['Je finis à 18h.', 'I finish at 6pm.'],
        chat: { in: 'Tu travailles jusqu’à quand ?', inEn: 'Until when do you work?', pre: 'Je ', ans: 'finis', post: ' à 18h.', en: 'I finish at 6pm.' }
      },
      passe: {
        forms: ['j’ai fini', 'tu as fini', 'il/elle a fini', 'nous avons fini', 'vous avez fini', 'ils/elles ont fini'],
        phrase: ['J’ai fini !', 'I am done!'],
        chat: { in: 'Et ton rapport ?', inEn: 'What about your report?', pre: 'Ça y est, j’', ans: 'ai fini', post: ' !', en: 'That’s it, I finished!' }
      },
      imparfait: {
        forms: ['je finissais', 'tu finissais', 'il/elle finissait', 'nous finissions', 'vous finissiez', 'ils/elles finissaient'],
        phrase: ['On finissait à 17h.', 'We used to finish at 5pm.'],
        chat: { in: 'C’était long, l’école ?', inEn: 'Was school long?', pre: 'On ', ans: 'finissait', post: ' à 17h.', en: 'We used to finish at 5pm.' }
      },
      futur: {
        forms: ['je finirai', 'tu finiras', 'il/elle finira', 'nous finirons', 'vous finirez', 'ils/elles finiront'],
        phrase: ['Je finirai vers 20h.', 'I will finish around 8pm.'],
        chat: { in: 'Tu rentres tôt ?', inEn: 'Are you coming home early?', pre: 'Non, je ', ans: 'finirai', post: ' vers 20h.', en: 'No, I will finish around 8pm.' }
      },
      conditionnel: {
        forms: ['je finirais', 'tu finirais', 'il/elle finirait', 'nous finirions', 'vous finiriez', 'ils/elles finiraient'],
        phrase: ['Je finirais plus vite avec toi.', 'I would finish faster with you.'],
        chat: { in: 'Tu as besoin de moi ?', inEn: 'Do you need me?', pre: 'Je ', ans: 'finirais', post: ' plus vite avec toi.', en: 'I would finish faster with you.' }
      },
      subjonctif: {
        forms: ['que je finisse', 'que tu finisses', 'qu’il/elle finisse', 'que nous finissions', 'que vous finissiez', 'qu’ils/elles finissent'],
        phrase: ['Attends que ça finisse.', 'Wait until it finishes.'],
        chat: { in: 'On part maintenant ?', inEn: 'Are we leaving now?', pre: 'Non, attends que ça ', ans: 'finisse', post: '.', en: 'No, wait until it finishes.' }
      }
    }
  },

  {
    id: 'attendre', inf: 'attendre', en: 'to wait (for)', aux: 'avoir', family: '-re model',
    enPresent: ['wait', 'wait', 'waits', 'wait', 'wait', 'wait'],
    enPast: 'waited', enPP: 'waited', enInf: 'wait',
    gears: {
      present: {
        forms: ['j’attends', 'tu attends', 'il/elle attend', 'nous attendons', 'vous attendez', 'ils/elles attendent'],
        phrase: ['Je t’attends dehors.', 'I am waiting for you outside.'],
        chat: { in: 'Tu es devant ?', inEn: 'Are you out front?', pre: 'Oui, je t’', ans: 'attends', post: ' dehors.', en: 'Yes, I am waiting for you outside.' }
      },
      passe: {
        forms: ['j’ai attendu', 'tu as attendu', 'il/elle a attendu', 'nous avons attendu', 'vous avez attendu', 'ils/elles ont attendu'],
        phrase: ['J’ai attendu une heure !', 'I waited an hour!'],
        chat: { in: 'Tu es arrivé quand ?', inEn: 'When did you get here?', pre: 'Tôt — j’', ans: 'ai attendu', post: ' une heure !', en: 'Early — I waited an hour!' }
      },
      imparfait: {
        forms: ['j’attendais', 'tu attendais', 'il/elle attendait', 'nous attendions', 'vous attendiez', 'ils/elles attendaient'],
        phrase: ['Tout le monde attendait.', 'Everybody was waiting.'],
        chat: { in: 'Il y avait du monde ?', inEn: 'Were there a lot of people?', pre: 'Oui, tout le monde ', ans: 'attendait', post: '.', en: 'Yes, everybody was waiting.' }
      },
      futur: {
        forms: ['j’attendrai', 'tu attendras', 'il/elle attendra', 'nous attendrons', 'vous attendrez', 'ils/elles attendront'],
        phrase: ['Je t’attendrai.', 'I will wait for you.'],
        chat: { in: 'Je suis en retard !', inEn: 'I am late!', pre: 'Pas de souci, je t’', ans: 'attendrai', post: '.', en: 'No worries, I will wait for you.' }
      },
      conditionnel: {
        forms: ['j’attendrais', 'tu attendrais', 'il/elle attendrait', 'nous attendrions', 'vous attendriez', 'ils/elles attendraient'],
        phrase: ['J’attendrais encore un peu.', 'I would wait a bit longer.'],
        chat: { in: 'On commande ?', inEn: 'Shall we order?', pre: 'J’', ans: 'attendrais', post: ' encore un peu.', en: 'I would wait a bit longer.' }
      },
      subjonctif: {
        forms: ['que j’attende', 'que tu attendes', 'qu’il/elle attende', 'que nous attendions', 'que vous attendiez', 'qu’ils/elles attendent'],
        phrase: ['Il faut que tu attendes ici.', 'You have to wait here.'],
        chat: { in: 'Je peux entrer ?', inEn: 'Can I come in?', pre: 'Il faut que tu ', ans: 'attendes', post: ' ici.', en: 'You have to wait here.' }
      }
    }
  }
];

const VERB_BY_ID = {};
for (const v of VERBS) VERB_BY_ID[v.id] = v;

/* --- English gloss builder (keeps the data file small) ----------- */
function glossFor(verb, gearId, i) {
  const p = PRONOUNS_EN[i];
  const past = Array.isArray(verb.enPast) ? verb.enPast[i] : verb.enPast;
  switch (gearId) {
    case 'present':
      return `${p} ${verb.enPresent[i]}`;
    case 'passe': {
      const aux = i === 2 ? 'has' : 'have';
      return `${p} ${past} / ${p} ${aux} ${verb.enPP}`;
    }
    case 'imparfait':
      return `${p} ${past} / used to ${verb.enInf}`;
    case 'futur':
      return `${p} will ${verb.enInf}`;
    case 'conditionnel':
      return `${p} would ${verb.enInf}`;
    case 'subjonctif':
      return `(that) ${p} ${verb.enInf}`;
  }
  return '';
}

/* --- English prompt builder -------------------------------------
   The short, unambiguous English conjugation shown on the FRONT of a
   flashcard. It has to separate gear 2 from gear 3 on its own:
     passe      -> "I had"          (one finished event)
     imparfait  -> "I used to have" (background / habit)
------------------------------------------------------------------ */
function promptFor(verb, gearId, i) {
  const p = PRONOUNS_EN[i];
  const past = Array.isArray(verb.enPast) ? verb.enPast[i] : verb.enPast;
  switch (gearId) {
    case 'present':
      return `${p} ${verb.enPresent[i]}`;
    case 'passe':
      return `${p} ${past}`;
    case 'imparfait':
      return `${p} used to ${verb.enInf}`;
    case 'futur':
      return `${p} will ${verb.enInf}`;
    case 'conditionnel':
      return `${p} would ${verb.enInf}`;
    case 'subjonctif':
      return `(that) ${p} ${verb.enInf}`;
  }
  return '';
}

/* --- Card generation -------------------------------------------- */
// Chat cards: one per verb x gear. Flashcards: one per verb x gear x person.
function chatCardId(verbId, gearId) { return `c:${verbId}:${gearId}`; }
function formCardId(verbId, gearId, i) { return `f:${verbId}:${gearId}:${i}`; }

function buildChatCard(verb, gearId) {
  const g = verb.gears[gearId];
  return {
    id: chatCardId(verb.id, gearId),
    kind: 'chat',
    verbId: verb.id,
    gearId: gearId,
    answer: g.chat.ans,
    incoming: g.chat.in,
    incomingEn: g.chat.inEn,
    pre: g.chat.pre,
    post: g.chat.post,
    replyEn: g.chat.en,
    sentence: `${g.chat.pre}${g.chat.ans}${g.chat.post}`
  };
}

function buildFormCard(verb, gearId, i) {
  const g = verb.gears[gearId];
  return {
    id: formCardId(verb.id, gearId, i),
    kind: 'form',
    verbId: verb.id,
    gearId: gearId,
    person: i,
    answer: g.forms[i],                   // the French form — this is the answer
    prompt: promptFor(verb, gearId, i),   // the English conjugation — this is the question
    gloss: glossFor(verb, gearId, i)
  };
}

function allCardsForVerb(verbId) {
  const verb = VERB_BY_ID[verbId];
  if (!verb) return [];
  const out = [];
  for (const g of GEARS) {
    out.push(buildChatCard(verb, g.id));
    for (let i = 0; i < 6; i++) out.push(buildFormCard(verb, g.id, i));
  }
  return out;
}

function cardByIdImpl(id) {
  const parts = id.split(':');
  const verb = VERB_BY_ID[parts[1]];
  if (!verb) return null;
  if (parts[0] === 'c') return buildChatCard(verb, parts[2]);
  return buildFormCard(verb, parts[2], Number(parts[3]));
}

/* Everything the app layer consumes, in one namespace. */
const DATA = {
  GEARS, GEAR_BY_ID, VERBS, VERB_BY_ID, PRONOUNS_EN,
  glossFor, promptFor, chatCardId, formCardId,
  allCardsForVerb, cardById: cardByIdImpl
};
window.DATA = DATA;
