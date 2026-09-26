/* ------------------------------------------------------------------
   FRENCH FRIES — Phrasebook
   phrases.js : the everyday phrases locals actually say.
   Plain script (no modules) so the app runs from file:// too.

   Each phrase: { id, cat, fr, en, reg, note? }
     reg  — register: 'casual' (friends, street), 'neutral' (anyone),
            'polite' (shops, strangers, anyone you say "vous" to)
     note — optional one-line tip on when/why to use it.

   Your own phrases live in localStorage (S.phrases), not here; they
   use the same shape with an id starting "u:" and cat "mine".
------------------------------------------------------------------ */

const PHRASE_CATS = [
  { id: 'shop',   name: 'Shopping & prices', icon: '🛍️' },
  { id: 'basics', name: 'Everyday basics',   icon: '👋' },
  { id: 'cafe',   name: 'Café & restaurant', icon: '☕' },
  { id: 'around', name: 'Getting around',    icon: '🧭' },
  { id: 'talk',   name: 'Keeping up',        icon: '💬' },
  { id: 'street', name: 'Street French',     icon: '😎' },
  { id: 'mine',   name: 'My phrases',        icon: '⭐' }
];

const PHRASE_LIST = [
  /* ---- shopping & prices ---------------------------------------- */
  { id: 'cest-combien', cat: 'shop', reg: 'casual', fr: 'C’est combien ?', en: 'How much is it?',
    note: 'The one locals use everywhere — markets, shops, cafés.' },
  { id: 'ca-coute-combien', cat: 'shop', reg: 'casual', fr: 'Ça coûte combien ?', en: 'How much does it cost?' },
  { id: 'ca-fait-combien', cat: 'shop', reg: 'casual', fr: 'Ça fait combien ?', en: 'How much does that come to?',
    note: 'At the till, for the total. "fait" is from faire: "that makes how much?"' },
  { id: 'combien-ca-coute', cat: 'shop', reg: 'neutral', fr: 'Combien ça coûte ?', en: 'How much does it cost?',
    note: 'Slightly more standard — fine with anyone.' },
  { id: 'je-regarde', cat: 'shop', reg: 'neutral', fr: 'Je regarde juste, merci.', en: 'Just looking, thanks.' },
  { id: 'je-vais-prendre', cat: 'shop', reg: 'neutral', fr: 'Je vais prendre ça.', en: 'I’ll take this.' },
  { id: 'par-carte', cat: 'shop', reg: 'polite', fr: 'Je peux payer par carte ?', en: 'Can I pay by card?' },
  { id: 'sans-contact', cat: 'shop', reg: 'neutral', fr: 'Sans contact, c’est bon ?', en: 'Is contactless OK?' },
  { id: 'trop-cher', cat: 'shop', reg: 'casual', fr: 'C’est un peu cher.', en: 'It’s a bit expensive.' },
  { id: 'un-sac', cat: 'shop', reg: 'polite', fr: 'Vous avez un sac ?', en: 'Do you have a bag?' },
  { id: 'cest-tout', cat: 'shop', reg: 'neutral', fr: 'Ce sera tout, merci.', en: 'That’ll be all, thanks.' },
  { id: 'et-avec-ceci', cat: 'shop', reg: 'polite', fr: 'Et avec ceci ?', en: 'Anything else?',
    note: 'What the shopkeeper asks you. Answer: "C’est tout, merci."' },

  /* ---- everyday basics ------------------------------------------ */
  { id: 'bonjour', cat: 'basics', reg: 'neutral', fr: 'Bonjour !', en: 'Hello! / Good morning!',
    note: 'Always say it when you walk into a shop — skipping it is rude.' },
  { id: 'bonsoir', cat: 'basics', reg: 'neutral', fr: 'Bonsoir !', en: 'Good evening!' },
  { id: 'salut', cat: 'basics', reg: 'casual', fr: 'Salut !', en: 'Hi! / Bye!', note: 'Friends only — hello and goodbye.' },
  { id: 'ca-va', cat: 'basics', reg: 'casual', fr: 'Ça va ?', en: 'How’s it going?' },
  { id: 'ca-va-et-toi', cat: 'basics', reg: 'casual', fr: 'Ça va, et toi ?', en: 'Good, and you?' },
  { id: 'merci-beaucoup', cat: 'basics', reg: 'neutral', fr: 'Merci beaucoup !', en: 'Thanks a lot!' },
  { id: 'de-rien', cat: 'basics', reg: 'neutral', fr: 'De rien.', en: 'You’re welcome.' },
  { id: 'svp', cat: 'basics', reg: 'polite', fr: 'S’il vous plaît.', en: 'Please.' },
  { id: 'stp', cat: 'basics', reg: 'casual', fr: 'S’il te plaît.', en: 'Please (to a friend).' },
  { id: 'pardon', cat: 'basics', reg: 'neutral', fr: 'Pardon !', en: 'Sorry! / Excuse me!',
    note: 'Bumping into someone or squeezing past.' },
  { id: 'excusez-moi', cat: 'basics', reg: 'polite', fr: 'Excusez-moi…', en: 'Excuse me… (to get attention)' },
  { id: 'a-plus', cat: 'basics', reg: 'casual', fr: 'À plus !', en: 'See you later!', note: 'Texted as "A+".' },
  { id: 'bonne-journee', cat: 'basics', reg: 'neutral', fr: 'Bonne journée !', en: 'Have a good day!' },
  { id: 'bonne-soiree', cat: 'basics', reg: 'neutral', fr: 'Bonne soirée !', en: 'Have a good evening!' },

  /* ---- café & restaurant ---------------------------------------- */
  { id: 'un-cafe', cat: 'cafe', reg: 'polite', fr: 'Un café, s’il vous plaît.', en: 'An espresso, please.',
    note: '"Un café" is an espresso. Milky one: "un café crème".' },
  { id: 'je-voudrais', cat: 'cafe', reg: 'polite', fr: 'Je voudrais un croissant.', en: 'I’d like a croissant.' },
  { id: 'je-vais-prendre-plat', cat: 'cafe', reg: 'neutral', fr: 'Je vais prendre le plat du jour.', en: 'I’ll have the dish of the day.' },
  { id: 'carafe', cat: 'cafe', reg: 'polite', fr: 'Une carafe d’eau, s’il vous plaît.', en: 'A jug of tap water, please.',
    note: 'Free tap water — ask for this instead of "de l’eau".' },
  { id: 'addition', cat: 'cafe', reg: 'polite', fr: 'L’addition, s’il vous plaît.', en: 'The bill, please.' },
  { id: 'sur-place', cat: 'cafe', reg: 'neutral', fr: 'Sur place ou à emporter ?', en: 'Eat in or take away?' },
  { id: 'a-emporter', cat: 'cafe', reg: 'neutral', fr: 'À emporter, s’il vous plaît.', en: 'To take away, please.' },
  { id: 'conseillez', cat: 'cafe', reg: 'polite', fr: 'Qu’est-ce que vous me conseillez ?', en: 'What do you recommend?' },
  { id: 'cetait-bon', cat: 'cafe', reg: 'casual', fr: 'C’était trop bon !', en: 'That was so good!' },

  /* ---- getting around ------------------------------------------- */
  { id: 'toilettes', cat: 'around', reg: 'polite', fr: 'Où sont les toilettes ?', en: 'Where are the toilets?' },
  { id: 'cest-par-ou', cat: 'around', reg: 'casual', fr: 'C’est par où ?', en: 'Which way is it?' },
  { id: 'cest-loin', cat: 'around', reg: 'casual', fr: 'C’est loin ?', en: 'Is it far?' },
  { id: 'je-cherche', cat: 'around', reg: 'neutral', fr: 'Je cherche la gare.', en: 'I’m looking for the station.' },
  { id: 'aider', cat: 'around', reg: 'polite', fr: 'Vous pouvez m’aider ?', en: 'Can you help me?' },
  { id: 'un-billet', cat: 'around', reg: 'polite', fr: 'Un billet pour Lyon, s’il vous plaît.', en: 'A ticket to Lyon, please.' },
  { id: 'a-quelle-heure', cat: 'around', reg: 'neutral', fr: 'Il part à quelle heure ?', en: 'What time does it leave?' },

  /* ---- keeping up ----------------------------------------------- */
  { id: 'comprends-pas', cat: 'talk', reg: 'casual', fr: 'Je comprends pas.', en: 'I don’t understand.',
    note: 'Spoken French drops the "ne". Written: "Je ne comprends pas."' },
  { id: 'repeter', cat: 'talk', reg: 'polite', fr: 'Vous pouvez répéter ?', en: 'Can you say that again?' },
  { id: 'lentement', cat: 'talk', reg: 'polite', fr: 'Plus lentement, s’il vous plaît.', en: 'More slowly, please.' },
  { id: 'comment-on-dit', cat: 'talk', reg: 'casual', fr: 'Comment on dit « bag » en français ?', en: 'How do you say "bag" in French?' },
  { id: 'ca-veut-dire', cat: 'talk', reg: 'casual', fr: 'Ça veut dire quoi ?', en: 'What does that mean?' },
  { id: 'un-peu', cat: 'talk', reg: 'neutral', fr: 'Je parle un peu français.', en: 'I speak a little French.' },
  { id: 'anglais', cat: 'talk', reg: 'casual', fr: 'Tu parles anglais ?', en: 'Do you speak English?' },
  { id: 'jsais-pas', cat: 'talk', reg: 'casual', fr: 'J’sais pas.', en: 'Dunno.', note: 'How "je ne sais pas" actually sounds.' },

  /* ---- street French -------------------------------------------- */
  { id: 'carrement', cat: 'street', reg: 'casual', fr: 'Carrément !', en: 'Totally! / Absolutely!' },
  { id: 'grave', cat: 'street', reg: 'casual', fr: 'Grave !', en: 'Totally! / For sure!', note: 'Young, very informal.' },
  { id: 'trop-bien', cat: 'street', reg: 'casual', fr: 'Trop bien !', en: 'So good! / Awesome!' },
  { id: 'pas-grave', cat: 'street', reg: 'casual', fr: 'C’est pas grave.', en: 'No worries. / It’s fine.' },
  { id: 'tinquiete', cat: 'street', reg: 'casual', fr: 'T’inquiète.', en: 'Don’t worry about it.' },
  { id: 'ah-bon', cat: 'street', reg: 'casual', fr: 'Ah bon ?', en: 'Oh really?' },
  { id: 'du-coup', cat: 'street', reg: 'casual', fr: 'Du coup…', en: 'So… / As a result…', note: 'The filler word you will hear constantly.' },
  { id: 'bof', cat: 'street', reg: 'casual', fr: 'Bof.', en: 'Meh.' },
  { id: 'nimporte-quoi', cat: 'street', reg: 'casual', fr: 'N’importe quoi !', en: 'Nonsense! / Whatever!' },
  { id: 'on-y-va', cat: 'street', reg: 'casual', fr: 'On y va ?', en: 'Shall we go?' },
  { id: 'vas-y', cat: 'street', reg: 'casual', fr: 'Vas-y !', en: 'Go on! / Go for it!' }
];

const REGISTERS = {
  casual: 'Casual',
  neutral: 'Anyone',
  polite: 'Polite'
};

window.PHRASES = { CATS: PHRASE_CATS, LIST: PHRASE_LIST, REGISTERS };
