import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Compass,
  GraduationCap,
  Layers,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
  DIFFICULTY_CEFR_LABELS,
  SUBTYPE_ENDINGS,
  TOPICS_METADATA,
  segmentLithuanianWord,
} from '../data/grammarRules';
import {
  getNounContextExample,
  getNounTranslationInCase,
} from '../utils/nounInflections';
import {
  VERB_CONJUGATIONS_METADATA,
  VERB_GOVERNED_CASES_METADATA,
  VERB_PERSONS_METADATA,
  VERB_PERSON_ORDER,
  VERB_TENSES_METADATA,
  segmentLithuanianVerbForm,
} from '../utils/verbConjugations';
import {
  AppLanguage,
  GrammaticalCase,
  GrammaticalNumber,
  NounEntry,
  VerbEntry,
  VerbTense,
} from '../types/grammar';

export type GrammarAnalysisTarget =
  | {
      kind: 'noun';
      noun: NounEntry;
      initialCase?: GrammaticalCase;
      initialNumber?: GrammaticalNumber;
      matchedForm?: string;
    }
  | {
      kind: 'verb';
      verb: VerbEntry;
      matchedForm?: string;
    };

interface GrammarAnalysisModalProps {
  target: GrammarAnalysisTarget | null;
  language: AppLanguage;
  onClose: () => void;
  onSpeak: (text: string, e?: React.MouseEvent) => void;
}

export const GrammarAnalysisModal: React.FC<GrammarAnalysisModalProps> = ({
  target,
  language,
  onClose,
  onSpeak,
}) => {
  const [activeCase, setActiveCase] = useState<GrammaticalCase>('nom');
  const [activeNumber, setActiveNumber] = useState<GrammaticalNumber>('sg');
  const [activeTense, setActiveTense] = useState<VerbTense>('present');

  useEffect(() => {
    if (!target) return;
    if (target.kind === 'noun') {
      setActiveCase(target.initialCase ?? 'nom');
      setActiveNumber(target.initialNumber ?? 'sg');
    } else {
      setActiveTense('present');
    }
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const renderNounAnalysis = (
    noun: NounEntry,
    matchedForm?: string
  ) => {
    const subtypeRule = SUBTYPE_ENDINGS[noun.subtype];
    const declTable = DECLENSION_PDF_TABLE[noun.declension - 1];
    const sgNomSeg = segmentLithuanianWord(
      noun.sg.nom,
      noun.subtype,
      'nom',
      'sg'
    );
    const sgGenSeg = segmentLithuanianWord(
      noun.sg.gen,
      noun.subtype,
      'gen',
      'sg'
    );
    const plNomSeg = segmentLithuanianWord(
      noun.pl.nom,
      noun.subtype,
      'nom',
      'pl'
    );

    const inspectedForm =
      activeNumber === 'sg' ? noun.sg[activeCase] : noun.pl[activeCase];
    const inspectedSeg = segmentLithuanianWord(
      inspectedForm,
      noun.subtype,
      activeCase,
      activeNumber
    );
    const inspectedTrans = getNounTranslationInCase(
      noun,
      activeCase,
      activeNumber,
      language
    );
    const inspectedCaseMeta = CASES_METADATA[activeCase];
    const inspectedEx = getNounContextExample(noun, activeCase, activeNumber);

    const genderTitle =
      noun.gender === 'm'
        ? language === 'uk'
          ? 'Чоловічий рід (Vyriškoji giminė, vyr. g.)'
          : language === 'lt'
          ? 'Vyriškoji giminė (vyr. g.)'
          : 'Masculine Gender (Vyriškoji giminė)'
        : language === 'uk'
        ? 'Жіночий рід (Moteriškoji giminė, mot. g.)'
        : language === 'lt'
        ? 'Moteriškoji giminė (mot. g.)'
        : 'Feminine Gender (Moteriškoji giminė)';

    const genderExplanation =
      noun.gender === 'm'
        ? language === 'uk'
          ? `Визначається за закінченням називного відмінка однини -${sgNomSeg.ending} (родовий однини: -${sgGenSeg.ending}). У литовській мові іменники мають лише чоловічий або жіночий рід (середнього роду іменників немає).`
          : language === 'lt'
          ? `Nustatoma pagal vardininko galūnę -${sgNomSeg.ending} (kilmininkas: -${sgGenSeg.ending}).`
          : `Determined by the nominative singular ending -${sgNomSeg.ending} (genitive sg.: -${sgGenSeg.ending}). Lithuanian nouns only have masculine or feminine gender.`
        : language === 'uk'
        ? `Визначається за закінченням називного відмінка однини -${sgNomSeg.ending} та закінченням родового відмінка однини -${sgGenSeg.ending}. Узгоджується з прикметниками та займенниками жіночого роду.`
        : language === 'lt'
        ? `Nustatoma pagal vardininko galūnę -${sgNomSeg.ending} ir kilmininko galūnę -${sgGenSeg.ending}.`
        : `Determined by the nominative singular ending -${sgNomSeg.ending} and genitive singular ending -${sgGenSeg.ending}.`;

    return (
      <div className="space-y-5">
        {/* Top Word Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                {language === 'uk'
                  ? 'Іменник (Daiktavardis)'
                  : language === 'lt'
                  ? 'Daiktavardis'
                  : 'Noun (Daiktavardis)'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {TOPICS_METADATA[noun.topic].label[language]}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {DIFFICULTY_CEFR_LABELS[noun.difficulty]}
              </span>
              {matchedForm && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-300">
                  {language === 'uk'
                    ? `Знайдена форма: ${matchedForm}`
                    : `Matched form: ${matchedForm}`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                <span>{sgNomSeg.stem}</span>
                <span className="text-amber-600 dark:text-amber-400 underline decoration-amber-500/80 decoration-2 underline-offset-4">
                  {sgNomSeg.ending}
                </span>
              </h3>
              <button
                type="button"
                onClick={(e) => onSpeak(noun.lemma, e)}
                title={
                  language === 'uk'
                    ? 'Озвучити литовською'
                    : 'Listen in Lithuanian'
                }
                className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                (Kilm. <strong className="text-slate-800 dark:text-slate-200">{noun.sg.gen}</strong> · Dgs.{' '}
                <strong className="text-slate-800 dark:text-slate-200">{noun.pl.nom}</strong>)
              </span>
            </div>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              🇺🇦 {noun.uk}{' '}
              <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>{' '}
              🇬🇧 {noun.en}
            </p>
          </div>
        </div>

        {/* 4 Pillars of Grammatical Explanation: Gender, Number, Case, Declension */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. GENDER (Рід) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {language === 'uk'
                ? '1. Рід іменника (Giminė)'
                : language === 'lt'
                ? '1. Giminė'
                : '1. Grammatical Gender (Giminė)'}
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {genderTitle}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {genderExplanation}
            </p>
          </div>

          {/* 2. NUMBER (Число) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {language === 'uk'
                ? '2. Число (Skaičius: Vienaskaita ir Daugiskaita)'
                : language === 'lt'
                ? '2. Skaičius (Vienaskaita ir Daugiskaita)'
                : '2. Grammatical Number (Skaičius)'}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-mono font-bold text-slate-900 dark:text-white">
              <span>
                {language === 'uk' ? 'Одн.:' : 'Sg.:'}{' '}
                <span className="text-amber-700 dark:text-amber-300">
                  {sgNomSeg.stem}-{sgNomSeg.ending}
                </span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">→</span>
              <span>
                {language === 'uk' ? 'Мн.:' : 'Pl.:'}{' '}
                <span className="text-emerald-700 dark:text-emerald-300">
                  {plNomSeg.stem}-{plNomSeg.ending}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'uk'
                ? `У литовській мові слово змінюється в однині (Vienaskaita) та множині (Daugiskaita). Множина називного відмінка утворюється додаванням закінчення -${plNomSeg.ending} до основи ${plNomSeg.stem}- (родовий множини: ${noun.pl.gen}).`
                : language === 'lt'
                ? `Kaitoma vienaskaita (${noun.sg.nom}) ir daugiskaita (${noun.pl.nom}, kilm. ${noun.pl.gen}).`
                : `Inflected across singular (${noun.sg.nom}) and plural (${noun.pl.nom}, genitive pl. ${noun.pl.gen}) with plural nominative ending -${plNomSeg.ending}.`}
            </p>
          </div>

          {/* 3. CASE (Відмінок) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              {language === 'uk'
                ? '3. Відмінок (Linksnis — 7 відмінків)'
                : language === 'lt'
                ? '3. Linksnis (7 linksnių sistema)'
                : '3. Grammatical Case (Linksnis — 7 Cases)'}
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {language === 'uk'
                ? `Словникова форма: Називний (Vardininkas, Kas?) — ${noun.lemma}`
                : language === 'lt'
                ? `Pradinė forma: Vardininkas (Kas?) — ${noun.lemma}`
                : `Dictionary Form: Nominative (Vardininkas, Kas?) — ${noun.lemma}`}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'uk'
                ? `Опорна форма для непрямих відмінків — Родовий однини (Kilmininkas, Ko?): „${noun.sg.gen}“ (основа ${sgGenSeg.stem}- + закінчення -${sgGenSeg.ending}). Нижче ви можете натиснути на будь-який із 7 відмінків для детального розбору.`
                : language === 'lt'
                ? `Kilmininko (Ko?) forma „${noun.sg.gen}“ parodo kamieną (${sgGenSeg.stem}-) ir linksniuotės tipą.`
                : `The Genitive singular (Kilmininkas, Ko?) "${noun.sg.gen}" reveals the oblique stem (${sgGenSeg.stem}-) and declension pattern.`}
            </p>
          </div>

          {/* 4. DECLENSION PATTERN (Тип відмінювання) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              {language === 'uk'
                ? '4. Тип відмінювання (Linksniuotė)'
                : language === 'lt'
                ? '4. Linksniuotė'
                : '4. Declension Type (Linksniuotė)'}
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span>{declTable.title[language]}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
                {language === 'uk'
                  ? `зразок: ${subtypeRule.modelWord}`
                  : `model: ${subtypeRule.modelWord}`}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {declTable.summary[language]}
            </p>
            {noun.stemAlternation ? (
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 pt-1">
                ⚡ {noun.stemAlternation[language]}
              </div>
            ) : (
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium pt-0.5">
                ✓{' '}
                {language === 'uk'
                  ? `Основа „${sgGenSeg.stem}-“ стабільна без приголосних чергувань.`
                  : language === 'lt'
                  ? `Kamienas „${sgGenSeg.stem}-“ nekinta.`
                  : `Regular stem "${sgGenSeg.stem}-" without consonant alternation.`}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Case & Number Form Inspector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {language === 'uk'
                  ? 'Інтерактивний морфологічний розбір за відмінками та числами:'
                  : language === 'lt'
                  ? 'Interaktyvi konkrečios formos analizė:'
                  : 'Interactive Morphological Form Breakdown (7 Cases × 2 Numbers):'}
              </h4>
            </div>

            {/* Number Switcher (Singular / Plural) */}
            <div className="inline-flex rounded-xl p-1 bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveNumber('sg')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeNumber === 'sg'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'uk'
                  ? 'Однина (Vienaskaita)'
                  : language === 'lt'
                  ? 'Vienaskaita'
                  : 'Singular'}
              </button>
              <button
                type="button"
                onClick={() => setActiveNumber('pl')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeNumber === 'pl'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'uk'
                  ? 'Множина (Daugiskaita)'
                  : language === 'lt'
                  ? 'Daugiskaita'
                  : 'Plural'}
              </button>
            </div>
          </div>

          {/* 7 Case Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {CASE_ORDER.map((c, idx) => {
              const cMeta = CASES_METADATA[c];
              const formInCase =
                activeNumber === 'sg' ? noun.sg[c] : noun.pl[c];
              const isSelected = activeCase === c;

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCase(c)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    {idx + 1}. {cMeta.shortLt}
                  </div>
                  <div className="font-mono font-bold text-xs sm:text-sm truncate mt-0.5 text-slate-900 dark:text-white">
                    {formInCase}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Card for the Selected Case + Number */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {inspectedCaseMeta.name[language]} ·{' '}
                  {activeNumber === 'sg'
                    ? language === 'uk'
                      ? 'Однина (Vienaskaita)'
                      : 'Singular (Vienaskaita)'
                    : language === 'uk'
                    ? 'Множина (Daugiskaita)'
                    : 'Plural (Daugiskaita)'}{' '}
                  · {inspectedCaseMeta.questionLt} (
                  {inspectedCaseMeta.questionTranslated[language]})
                </div>

                <div className="flex flex-wrap items-center gap-2.5 mt-1">
                  <span className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                    <span>{inspectedSeg.stem}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 ml-0.5">
                      -{inspectedSeg.ending || '∅'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => onSpeak(inspectedForm, e)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    — {inspectedTrans.primary}
                    {inspectedTrans.secondary
                      ? ` (${inspectedTrans.secondary})`
                      : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {language === 'uk' ? 'Основа:' : 'Stem:'}{' '}
                  <strong>{inspectedSeg.stem}-</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300">
                  {language === 'uk' ? 'Закінчення:' : 'Ending:'}{' '}
                  <strong>-{inspectedSeg.ending || '∅'}</strong>
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white mr-1">
                {language === 'uk'
                  ? 'Значення та функція відмінка:'
                  : language === 'lt'
                  ? 'Linksnio reikšmė:'
                  : 'Case Function:'}
              </strong>
              {inspectedCaseMeta.description[language]}
            </div>

            {inspectedCaseMeta.prepositionsWithTranslations.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 mr-1">
                  {language === 'uk'
                    ? 'Типові прийменники:'
                    : language === 'lt'
                    ? 'Prielinksniai:'
                    : 'Typical prepositions:'}
                </span>
                {inspectedCaseMeta.prepositionsWithTranslations.map((p) => (
                  <span
                    key={p.prep}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    <strong>{p.prep}</strong> (
                    {language === 'en' ? p.en : p.uk})
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                {language === 'uk'
                  ? 'Примітка: цей відмінок у литовській мові вживається без прийменників.'
                  : language === 'lt'
                  ? 'Pastaba: šis linksnis vartojamas be prielinksnių.'
                  : 'Note: this case is used without prepositions in Lithuanian.'}
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex items-start justify-between gap-2">
              <div className="space-y-0.5 text-xs">
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  „{inspectedEx.lt}“
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  🇺🇦 {inspectedEx.uk} · 🇬🇧 {inspectedEx.en}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => onSpeak(inspectedEx.lt, e)}
                className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-slate-700 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVerbAnalysis = (verb: VerbEntry, matchedForm?: string) => {
    const cleanInf = verb.infinitive.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const conjMeta = VERB_CONJUGATIONS_METADATA[verb.conjugation];
    const govMeta = VERB_GOVERNED_CASES_METADATA[verb.governedCase];
    const tenseMeta = VERB_TENSES_METADATA[activeTense];

    const infStem = verb.isReflexive
      ? cleanInf.replace(/tis$/, '')
      : cleanInf.replace(/ti$/, '');

    const conjugationRuleDetail =
      verb.conjugation === 1
        ? language === 'uk'
          ? `1-ша дієвідміна (I asmenuotė) визначається за закінченням 3-ї особи теперішнього часу на -a або -ia (jis/ji ${verb.present3}). Це найчисленніша група литовських дієслів.`
          : language === 'lt'
          ? `I asmenuotė nustatoma pagal esamojo laiko 3 asmens galūnę -a arba -ia (jis/ji ${verb.present3}).`
          : `1st conjugation (I asmenuotė) is identified by the 3rd person present ending -a or -ia (jis/ji ${verb.present3}).`
        : verb.conjugation === 2
        ? language === 'uk'
          ? `2-га дієвідміна (II asmenuotė) визначається за закінченням 3-ї особи теперішнього часу на -i (jis/ji ${verb.present3}). Переважно охоплює дієслова з інфінітивом на -ėti (та окремі на -ti).`
          : language === 'lt'
          ? `II asmenuotė nustatoma pagal esamojo laiko 3 asmens galūnę -i (jis/ji ${verb.present3}).`
          : `2nd conjugation (II asmenuotė) is identified by the 3rd person present ending -i (jis/ji ${verb.present3}).`
        : language === 'uk'
        ? `3-тя дієвідміна (III asmenuotė) визначається за закінченням 3-ї особи теперішнього часу на -o (jis/ji ${verb.present3}). Переважно охоплює дієслова з інфінітивом на -yti та -oti.`
        : language === 'lt'
        ? `III asmenuotė nustatoma pagal esamojo laiko 3 asmens galūnę -o (jis/ji ${verb.present3}).`
        : `3rd conjugation (III asmenuotė) is identified by the 3rd person present ending -o (jis/ji ${verb.present3}).`;

    const pastStemType =
      verb.past3.endsWith('ė') || verb.past3.endsWith('ėsi')
        ? language === 'uk'
          ? 'Основа минулого часу на -ė (1 ос. -iau, 2 ос. -ei, 3 ос. -ė)'
          : 'Past stem in -ė (1st sg. -iau, 2nd sg. -ei, 3rd -ė)'
        : language === 'uk'
        ? 'Основа минулого часу на -o (1 ос. -au, 2 ос. -ai, 3 ос. -o)'
        : 'Past stem in -o (1st sg. -au, 2nd sg. -ai, 3rd -o)';

    const activeExample =
      activeTense === 'present'
        ? verb.examples.present
        : activeTense === 'past'
        ? verb.examples.past
        : activeTense === 'future'
        ? verb.examples.future
        : {
            fullSentenceLt: `${
              verb.imperative.tu.charAt(0).toUpperCase() +
              verb.imperative.tu.slice(1)
            }! ${
              verb.imperative.mes.charAt(0).toUpperCase() +
              verb.imperative.mes.slice(1)
            } kartu!`,
            translationUk: `Наказовий спосіб (2 ос. одн. tu: „${verb.imperative.tu}!“, 1 ос. мн. mes: „${verb.imperative.mes}!“, 2 ос. мн. jūs: „${verb.imperative.jus}!“).`,
            translationEn: `Imperative mood (2nd sg. tu: "${verb.imperative.tu}!", 1st pl. mes: "${verb.imperative.mes}!", 2nd pl. jūs: "${verb.imperative.jus}!").`,
          };

    return (
      <div className="space-y-5">
        {/* Top Verb Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-300">
                {language === 'uk'
                  ? 'Дієслово (Veiksmažodis)'
                  : language === 'lt'
                  ? 'Veiksmažodis'
                  : 'Verb (Veiksmažodis)'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                {conjMeta.title[language]}
              </span>
              {verb.isReflexive && (
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300">
                  {language === 'uk'
                    ? 'Зворотне (-tis / -si)'
                    : 'Reflexive (-si)'}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {TOPICS_METADATA[verb.topic].label[language]}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {DIFFICULTY_CEFR_LABELS[verb.difficulty]}
              </span>
              {matchedForm && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-300">
                  {language === 'uk'
                    ? `Знайдена форма: ${matchedForm}`
                    : `Matched form: ${matchedForm}`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {verb.infinitive}
              </h3>
              <button
                type="button"
                onClick={(e) =>
                  onSpeak(`${cleanInf}, ${verb.present3}, ${verb.past3}`, e)
                }
                title={
                  language === 'uk'
                    ? 'Озвучити 3 основні форми'
                    : 'Listen to 3 principal forms'
                }
                className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                (Es. 3 asm.{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {verb.present3}
                </strong>{' '}
                · Būt. 3 asm.{' '}
                <strong className="text-indigo-700 dark:text-indigo-400">
                  {verb.past3}
                </strong>
                )
              </span>
            </div>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              🇺🇦 {verb.uk}{' '}
              <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>{' '}
              🇬🇧 {verb.en}
            </p>
          </div>
        </div>

        {/* 4 Pillars of Verb Grammatical Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. CONJUGATION TYPE (Тип дієвідмінювання) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {language === 'uk'
                ? '1. Тип дієвідмінювання (Asmenuotė)'
                : language === 'lt'
                ? '1. Asmenuotė'
                : '1. Conjugation Type (Asmenuotė)'}
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {conjMeta.title[language]}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {conjugationRuleDetail}
            </p>
          </div>

          {/* 2. THREE PRINCIPAL STEMS (Три основні основи) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              {language === 'uk'
                ? '2. Три основні форми та основи часів (3 Pagrindinės formos)'
                : language === 'lt'
                ? '2. Pagrindinės formos ir kamienai'
                : '2. Three Principal Forms & Stems'}
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                1. {cleanInf}
              </span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300">
                2. {verb.present3}
              </span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300">
                3. {verb.past3}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'uk'
                ? `Від основи інфінітива „${infStem}-“ творяться майбутній час (-s-) і наказовий спосіб (-k-). Від „${verb.present3}“ — теперішній час. Від „${verb.past3}“ — минулий час (${pastStemType}).`
                : `Infinitive stem "${infStem}-" forms Future (-s-) and Imperative (-k-); "${verb.present3}" forms Present; "${verb.past3}" forms Past (${pastStemType}).`}
            </p>
          </div>

          {/* 3. PERSON, NUMBER & GENDER IN VERBS (Особа, Число, Рід) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {language === 'uk'
                ? '3. Число, Особа та Зворотність (Skaičius, Asmuo, Sangrąža)'
                : language === 'lt'
                ? '3. Skaičius, Asmuo ir Sangrąža'
                : '3. Number, Person & Reflexivity'}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {verb.isReflexive
                ? language === 'uk'
                  ? 'Зворотне дієслово (Sangrąžinis, частка -si / -tis)'
                  : 'Reflexive Verb (Sangrąžinis, particle -si / -tis)'
                : language === 'uk'
                ? 'Незворотне дієслово (Nesangrąžinis)'
                : 'Non-reflexive Verb (Nesangrąžinis)'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'uk'
                ? `Змінюється за 3 особами в однині (aš, tu, jis/ji) та множині (mes, jūs, jie/jos). Важливе правило: у 3-й особі всіх часів форма однини (jis/ji) та множини (jie/jos) завжди однакова (${verb.present3}, ${verb.past3}, ${verb.future.jis}), а рід в особових формах не розрізняється.`
                : `Conjugated across 3 persons in singular (aš, tu, jis/ji) and plural (mes, jūs, jie/jos). In Lithuanian, 3rd person singular and plural are always identical (${verb.present3}, ${verb.past3}).`}
            </p>
          </div>

          {/* 4. CASE GOVERNANCE & ALTERNATIONS (Керування відмінком та чергування) */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              {language === 'uk'
                ? '4. Відмінкове керування та особливості основи'
                : language === 'lt'
                ? '4. Linksnių valdymas ir kamieno kaita'
                : '4. Case Governance & Stem Features'}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{govMeta.fullLabel[language]}</span>
            </div>
            {verb.stemAlternation ? (
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                ⚡ {verb.stemAlternation[language]}
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'uk'
                  ? 'Дієслово відмінюється за регулярною моделлю без нестандартних суплетивних основ.'
                  : 'Follows regular stem formation across tenses.'}
              </p>
            )}
          </div>
        </div>

        {/* Interactive Tense & Person Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {language === 'uk'
                  ? 'Морфемний розбір особових форм за часами (основа + закінчення):'
                  : language === 'lt'
                  ? 'Asmens formų analizė pagal laikus:'
                  : 'Personal Forms Breakdown by Tense (Stem + Ending):'}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                ['present', 'past', 'future', 'imperative'] as VerbTense[]
              ).map((tKey) => (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setActiveTense(tKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTense === tKey
                      ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  {VERB_TENSES_METADATA[tKey].title[language]}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white mr-1">
              {tenseMeta.nameLt} ({tenseMeta.questionLt}):
            </strong>
            {tenseMeta.description[language]}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {VERB_PERSON_ORDER.map((pKey) => {
              if (
                activeTense === 'imperative' &&
                pKey !== 'tu' &&
                pKey !== 'mes' &&
                pKey !== 'jus'
              ) {
                return null;
              }

              const rawForm =
                activeTense === 'present'
                  ? verb.present[pKey]
                  : activeTense === 'past'
                  ? verb.past[pKey]
                  : activeTense === 'future'
                  ? verb.future[pKey]
                  : pKey === 'tu'
                  ? verb.imperative.tu
                  : pKey === 'mes'
                  ? verb.imperative.mes
                  : verb.imperative.jus;

              const seg =
                activeTense === 'imperative'
                  ? { stem: rawForm, ending: '' }
                  : segmentLithuanianVerbForm(
                      rawForm,
                      activeTense,
                      pKey,
                      verb.isReflexive
                    );

              return (
                <div
                  key={pKey}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {VERB_PERSONS_METADATA[pKey].label[language]}
                    </div>
                    <div className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5">
                      <span>{seg.stem}</span>
                      {seg.ending && (
                        <span className="text-amber-600 dark:text-amber-400 underline decoration-amber-500/80 decoration-2 underline-offset-4">
                          {seg.ending}
                        </span>
                      )}
                      {activeTense === 'imperative' && '!'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => onSpeak(rawForm, e)}
                    className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-slate-800"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {activeExample && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2">
              <div className="space-y-0.5 text-xs">
                <div className="font-mono font-bold text-slate-900 dark:text-white">
                  „{activeExample.fullSentenceLt}“
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  🇺🇦 {activeExample.translationUk} · 🇬🇧{' '}
                  {activeExample.translationEn}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => onSpeak(activeExample.fullSentenceLt, e)}
                className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-slate-800 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grammar-analysis-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="grammar-analysis-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                {language === 'uk'
                  ? 'Детальний граматичний аналіз слова'
                  : language === 'lt'
                  ? 'Išsami žodžio gramatinė analizė'
                  : 'Detailed Grammatical Analysis'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {target.kind === 'noun'
                  ? language === 'uk'
                    ? 'Рід · Число · Відмінок · Тип відмінювання · Основа та закінчення'
                    : language === 'lt'
                    ? 'Giminė · Skaičius · Linksnis · Linksniuotė · Kamienas ir galūnė'
                    : 'Gender · Number · Case · Declension Pattern · Stem & Ending'
                  : language === 'uk'
                  ? 'Тип дієвідмінювання · 3 основні форми · Зворотність · Число та особа · Відмінкове керування'
                  : language === 'lt'
                  ? 'Asmenuotė · 3 pagrindinės formos · Sangrąža · Skaičius ir asmuo · Linksnių valdymas'
                  : 'Conjugation Type · 3 Principal Forms · Reflexivity · Number & Person · Case Governance'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {target.kind === 'noun'
          ? renderNounAnalysis(target.noun, target.matchedForm)
          : renderVerbAnalysis(target.verb, target.matchedForm)}

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {language === 'uk'
                ? 'Натисніть на іконку динаміка біля будь-якої форми, щоб прослухати литовську вимову.'
                : language === 'lt'
                ? 'Spustelėkite garsiakalbio piktogramą, kad išgirstumėte tarimą.'
                : 'Click the speaker icon next to any form to hear its Lithuanian pronunciation.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
          >
            {language === 'uk'
              ? 'Закрити'
              : language === 'lt'
              ? 'Uždaryti'
              : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
