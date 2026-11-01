import React, { useState } from 'react';
import {
  CASES_METADATA,
  CASE_ORDER,
  DECLENSION_PDF_TABLE,
} from '../data/grammarRules';
import { UI_TEXT } from '../i18n/translations';
import { AppLanguage, VerbConjugationType } from '../types/grammar';
import {
  VERB_CONJUGATIONS_METADATA,
  VERB_GOVERNED_CASES_METADATA,
  VERB_PERSONS_METADATA,
  VERB_PERSON_ORDER,
} from '../utils/verbConjugations';

interface GrammarReferenceViewProps {
  language: AppLanguage;
}

interface DeclensionTableProps {
  language: AppLanguage;
  number: 'sg' | 'pl';
  headerTitle: string;
}

const DeclensionTable: React.FC<DeclensionTableProps> = ({
  language,
  number: num,
  headerTitle,
}) => {
  const t = UI_TEXT[language];
  const isSg = num === 'sg';
  const nomMeta = CASES_METADATA['nom'];
  const obliqueCases = CASE_ORDER.filter((c) => c !== 'nom');

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Table section header with sticky badge note */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        <div className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isSg ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
          {headerTitle}
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2 font-medium">
          <span className="flex items-center gap-1">
            <span className="text-amber-600 dark:text-amber-400">📌</span>
            <span className="hidden sm:inline">
              {language === 'uk'
                ? 'V. (Називний) закріплено вгорі'
                : language === 'lt'
                ? 'V. (Vardininkas) prisegtas viršuje'
                : 'V. (Nominative) pinned at top'}
            </span>
            <span className="sm:hidden">
              {language === 'uk' ? 'V. вгорі' : language === 'lt' ? 'V. viršuje' : 'V. at top'}
            </span>
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="flex items-center gap-1">
            <span className="text-slate-500">↔</span>
            <span className="hidden sm:inline">
              {language === 'uk'
                ? 'Відмінок / Питання закріплено ліворуч'
                : language === 'lt'
                ? 'Linksnis / Klausimas prisegtas kairėje'
                : 'Case / Question pinned on left'}
            </span>
            <span className="sm:hidden">
              {language === 'uk' ? 'Ліворуч' : language === 'lt' ? 'Kairėje' : 'On left'}
            </span>
          </span>
        </div>
      </div>

      {/* Scrollable table container with sticky 2D headers */}
      <div className="overflow-auto max-h-[520px] sm:max-h-[640px] relative scrollbar-thin">
        <table className="w-full text-left border-separate border-spacing-0 text-xs sm:text-sm">
          {/* THEAD: Fixed at the top containing both Column titles AND Nominative base row */}
          <thead className="sticky top-0 z-30 shadow-[0_4px_6px_-2px_rgba(0,0,0,0.06)]">
            {/* Row 1: Declension Headers */}
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="sticky left-0 top-0 z-50 bg-slate-100 dark:bg-slate-800 p-2 sm:p-3.5 font-bold text-slate-800 dark:text-slate-200 border-b border-r border-slate-300 dark:border-slate-700 w-[100px] min-w-[100px] max-w-[105px] sm:w-auto sm:min-w-[160px] sm:max-w-none shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold leading-tight truncate">
                    {t.reference.caseColumn}
                  </span>
                  <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 hidden sm:inline">
                    [V. — Š.]
                  </span>
                </div>
              </th>
              {DECLENSION_PDF_TABLE.map((col) => (
                <th
                  key={col.declension}
                  className="p-2 sm:p-3.5 font-bold text-slate-900 dark:text-white min-w-[145px] sm:min-w-[190px] border-b border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                >
                  <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                    {col.title[language]}
                  </div>
                  {isSg && col.examplesLt && (
                    <div className="hidden sm:block text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <span>{col.examplesLt.join(', ')}</span>
                      {language !== 'lt' && col.examplesHeaderTranslated && (
                        <span className="block text-[10.5px] text-slate-400 dark:text-slate-500">
                          ({col.examplesHeaderTranslated[language]})
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>

            {/* Row 2: V. (Nom.) Називний (Vardininkas) Kas? — Хто? Що? (PINNED AT THE TOP!) */}
            <tr
              className={
                isSg
                  ? 'bg-amber-50 dark:bg-slate-800'
                  : 'bg-emerald-50 dark:bg-slate-800'
              }
            >
              {/* Left Cell: Pinned on the left AND pinned at top with z-50 */}
              <th
                className={`sticky left-0 z-50 ${
                  isSg
                    ? 'bg-amber-50 dark:bg-slate-800 border-amber-300 dark:border-amber-600/70'
                    : 'bg-emerald-50 dark:bg-slate-800 border-emerald-300 dark:border-emerald-600/70'
                } p-2 sm:p-3.5 align-top text-left font-normal border-b-2 border-r w-[100px] min-w-[100px] max-w-[105px] sm:w-auto sm:min-w-[160px] sm:max-w-none shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {nomMeta.shortLt}
                  </span>
                  <span
                    className={`hidden sm:inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ml-auto ${
                      isSg
                        ? 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200'
                        : 'bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200'
                    }`}
                  >
                    {language === 'uk'
                      ? 'Вгорі'
                      : language === 'lt'
                      ? 'Viršuje'
                      : 'Top'}
                  </span>
                </div>
                <div className="text-[10.5px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 sm:mt-1 leading-tight truncate">
                  {nomMeta.name[language]}
                </div>
                <div
                  className={`text-[10.5px] sm:text-xs font-mono font-bold mt-0.5 sm:mt-1 leading-tight ${
                    isSg
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  <span>{nomMeta.questionLt}</span>
                  {language !== 'lt' && (
                    <span className="font-sans text-slate-600 dark:text-slate-400 font-normal block sm:inline text-[9.5px] sm:text-xs">
                      {' '}— {nomMeta.questionTranslated[language]}
                    </span>
                  )}
                </div>
              </th>

              {/* 5 Declension Nominative endings & examples */}
              {DECLENSION_PDF_TABLE.map((col) => {
                const cell = isSg
                  ? col.singularEndings['nom']
                  : col.pluralEndings['nom'];
                return (
                  <th
                    key={col.declension}
                    className={`p-2 sm:p-3.5 align-top text-left font-normal border-b-2 border-r min-w-[145px] sm:min-w-[190px] ${
                      isSg
                        ? 'border-amber-300 dark:border-amber-600/70 bg-amber-50/90 dark:bg-slate-800'
                        : 'border-emerald-300 dark:border-emerald-600/70 bg-emerald-50/90 dark:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`font-mono font-bold text-xs sm:text-base leading-tight ${
                        isSg
                          ? 'text-amber-800 dark:text-amber-300'
                          : 'text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {cell.endings}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-800 dark:text-slate-200 italic mt-0.5 sm:mt-1 font-medium leading-tight">
                      <span>{cell.examples}</span>
                    </div>
                    {language !== 'lt' && cell.examplesTranslated && (
                      <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight truncate sm:whitespace-normal">
                        ({cell.examplesTranslated[language]})
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* TBODY: Remaining Oblique cases (K., N., G., Įn., Vt., Š.) scrolling under Nominative */}
          <tbody className="bg-white dark:bg-slate-900">
            {obliqueCases.map((c) => {
              const cMeta = CASES_METADATA[c];
              return (
                <tr
                  key={c}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Left Column (Sticky left-0) */}
                  <td className="sticky left-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/60 p-2 sm:p-3.5 align-top border-b border-r border-slate-200 dark:border-slate-800 w-[100px] min-w-[100px] max-w-[105px] sm:w-auto sm:min-w-[160px] sm:max-w-none shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] transition-colors">
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {cMeta.shortLt}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-tight mt-0.5 truncate">
                      {cMeta.name[language]}
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs font-mono mt-0.5 leading-tight ${
                        isSg
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      <span>{cMeta.questionLt}</span>
                      {language !== 'lt' && (
                        <span className="font-sans text-slate-500 dark:text-slate-400 font-normal block sm:inline text-[9.5px] sm:text-xs">
                          {' '}— {cMeta.questionTranslated[language]}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Declension Columns */}
                  {DECLENSION_PDF_TABLE.map((col) => {
                    const cell = isSg
                      ? col.singularEndings[c]
                      : col.pluralEndings[c];
                    return (
                      <td
                        key={col.declension}
                        className="p-2 sm:p-3.5 align-top border-b border-r border-slate-200/70 dark:border-slate-800 min-w-[145px] sm:min-w-[190px]"
                      >
                        <div
                          className={`font-mono font-bold text-xs sm:text-sm leading-tight ${
                            isSg
                              ? 'text-amber-800 dark:text-amber-400'
                              : 'text-emerald-800 dark:text-emerald-400'
                          }`}
                        >
                          {cell.endings}
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 italic mt-0.5 sm:mt-1 leading-tight">
                          <span>{cell.examples}</span>
                        </div>
                        {language !== 'lt' && cell.examplesTranslated && (
                          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate sm:whitespace-normal">
                            ({cell.examplesTranslated[language]})
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PRESENT_TENSE_TABLE: Record<
  VerbConjugationType,
  {
    modelLt: string;
    modelUk: string;
    modelEn: string;
    forms: Record<
      (typeof VERB_PERSON_ORDER)[number],
      { ending: string; example: string }
    >;
  }
> = {
  1: {
    modelLt: 'dirbti (dirba), eiti (eina), kalbėti (kalba)',
    modelUk: 'працювати, іти, говорити',
    modelEn: 'to work, to go, to speak',
    forms: {
      as: { ending: '-u / -iu', example: 'dirb-u, kalb-u, jauč-iu' },
      tu: { ending: '-i', example: 'dirb-i, kalb-i, jaut-i' },
      jis: { ending: '-a / -ia', example: 'dirb-a, kalb-a, jauč-ia' },
      mes: { ending: '-ame / -iame', example: 'dirb-ame, kalb-ame' },
      jus: { ending: '-ate / -iate', example: 'dirb-ate, kalb-ate' },
      jie: { ending: '-a / -ia', example: 'dirb-a, kalb-a, jauč-ia' },
    },
  },
  2: {
    modelLt: 'mylėti (myli), turėti (turi), žiūrėti (žiūri)',
    modelUk: 'любити, мати, дивитися',
    modelEn: 'to love, to have, to watch',
    forms: {
      as: { ending: '-iu (-u)', example: 'myl-iu, tur-iu, žiūr-iu' },
      tu: { ending: '-i', example: 'myl-i, tur-i, žiūr-i' },
      jis: { ending: '-i', example: 'myl-i, tur-i, žiūr-i' },
      mes: { ending: '-ime', example: 'myl-ime, tur-ime, žiūr-ime' },
      jus: { ending: '-ite', example: 'myl-ite, tur-ite, žiūr-ite' },
      jie: { ending: '-i', example: 'myl-i, tur-i, žiūr-i' },
    },
  },
  3: {
    modelLt: 'skaityti (skaito), rašyti (rašo), žinoti (žino)',
    modelUk: 'читати, писати, знати',
    modelEn: 'to read, to write, to know',
    forms: {
      as: { ending: '-au', example: 'skait-au, raš-au, žin-au' },
      tu: { ending: '-ai', example: 'skait-ai, raš-ai, žin-ai' },
      jis: { ending: '-o', example: 'skait-o, raš-o, žin-o' },
      mes: { ending: '-ome', example: 'skait-ome, raš-ome, žin-ome' },
      jus: { ending: '-ote', example: 'skait-ote, raš-ote, žin-ote' },
      jie: { ending: '-o', example: 'skait-o, raš-o, žin-o' },
    },
  },
};

export const GrammarReferenceView: React.FC<GrammarReferenceViewProps> = ({
  language,
}) => {
  const t = UI_TEXT[language];
  const [refTab, setRefTab] = useState<'nouns' | 'verbs'>('nouns');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header + Part-of-Speech Switcher */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {refTab === 'nouns'
              ? t.reference.title
              : language === 'uk'
              ? 'Таблиця дієвідмінювання дієслів (Veiksmažodžių asmenavimas)'
              : language === 'lt'
              ? 'Veiksmažodžių asmenavimo lentelė (I–III asmenuotės ir laikai)'
              : 'Lithuanian Verb Conjugation Reference Table'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {refTab === 'nouns'
              ? t.reference.subtitle
              : language === 'uk'
              ? '3 дієвідміни (-a, -i, -o), 3 основні форми дієслова, теперішній, минулий, майбутній час, наказовий спосіб та керування відмінками'
              : language === 'lt'
              ? '3 asmenuotės (-a, -i, -o), 3 pagrindinės formos, esamasis, būtasis kartinis, būsimasis laikas ir liepiamoji nuosaka'
              : '3 conjugations (-a, -i, -o), 3 principal forms, present, past, future, imperative, and case governance'}
          </p>
        </div>

        <div
          role="tablist"
          className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={refTab === 'nouns'}
            onClick={() => setRefTab('nouns')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              refTab === 'nouns'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'uk'
              ? 'Іменники (5 відмін)'
              : language === 'lt'
              ? 'Daiktavardžiai (5 linksn.)'
              : 'Nouns (5 Declensions)'}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={refTab === 'verbs'}
            onClick={() => setRefTab('verbs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              refTab === 'verbs'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-amber-500 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'uk'
              ? 'Дієслова (3 дієвідміни)'
              : language === 'lt'
              ? 'Veiksmažodžiai (3 asmen.)'
              : 'Verbs (3 Conjugations)'}
          </button>
        </div>
      </div>

      {refTab === 'nouns' ? (
        <>
          {/* VIENASKAITA (Singular) Full 5-Declension Matrix */}
          <DeclensionTable
            language={language}
            number="sg"
            headerTitle={t.reference.singularHeader}
          />

          {/* DAUGISKAITA (Plural) Full 5-Declension Matrix */}
          <DeclensionTable
            language={language}
            number="pl"
            headerTitle={t.reference.pluralHeader}
          />

          {/* PRIELINKSNIAI (Prepositions Governance from the bottom of the PDF Table) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.reference.prepositionsTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t.reference.prepositionsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['gen', 'acc', 'ins'] as const).map((c) => {
                const cMeta = CASES_METADATA[c];
                return (
                  <div
                    key={c}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-2"
                  >
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {cMeta.name[language]} ({cMeta.questionLt}
                      {language !== 'lt'
                        ? ` — ${cMeta.questionTranslated[language]}`
                        : ''}
                      )
                    </div>

                    {language === 'lt' ? (
                      <div className="font-mono text-sm font-semibold text-amber-800 dark:text-amber-400">
                        {cMeta.prepositionsLt.join(', ')}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200/60 dark:divide-slate-700/50 text-xs">
                        {cMeta.prepositionsWithTranslations.map((item) => (
                          <div
                            key={item.prep}
                            className="py-1.5 flex items-baseline justify-between gap-2"
                          >
                            <span className="font-mono font-bold text-sm text-amber-800 dark:text-amber-400 shrink-0">
                              {item.prep}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 text-right">
                              {item[language]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                      {cMeta.description[language]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {/* 1. Three Principal Forms Explanation Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'uk'
                  ? 'Три основні форми литовського дієслова (3 pagrindinės veiksmažodžio formos)'
                  : language === 'lt'
                  ? 'Trys pagrindinės veiksmažodžio formos'
                  : 'The 3 Principal Forms of a Lithuanian Verb'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                {language === 'uk'
                  ? 'У литовських словниках кожне дієслово подається трьома базовими формами. Знаючи їх, можна утворити будь-який час і спосіб (3-тя особа однини та множини в литовській мові ЗАВЖДИ збігається!):'
                  : language === 'lt'
                  ? 'Žodynuose pateikiamos trys pagrindinės veiksmažodžio formos, iš kurių padaromi visi laikai ir nuosakos:'
                  : 'Every Lithuanian verb is learned through 3 principal forms (note: 3rd person singular and plural are ALWAYS identical in Lithuanian):'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="text-xs font-bold uppercase text-slate-500">
                  1. Bendratis (-ti / -tis)
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'uk'
                    ? 'Інфінітив (Що робити?)'
                    : language === 'lt'
                    ? 'Bendratis (Ką veikti?)'
                    : 'Infinitive'}
                </div>
                <div className="font-mono text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  dirb-ti, mylė-ti, skaity-ti
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'uk'
                    ? 'Від основи інфінітива (без -ti) утворюються Майбутній час (-siu, -si, -s) та Наказовий спосіб (-k, -kime, -kite).'
                    : 'Used to form the Future Tense (-siu, -si, -s) and Imperative Mood (-k, -kime, -kite).'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                <div className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
                  2. Esamojo l. 3 asm. (-a / -i / -o)
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'uk'
                    ? 'Теперішній час (jis/ji/jie/jos)'
                    : language === 'lt'
                    ? 'Esamasis laikas (jis/ji/jie/jos)'
                    : '3rd Person Present'}
                </div>
                <div className="font-mono text-xs text-amber-800 dark:text-amber-300 font-semibold">
                  dirb-a (I), myl-i (II), skait-o (III)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'uk'
                    ? 'Визначає дієвідміну дієслова: I дієвідміна (-a/-ia), II дієвідміна (-i), III дієвідміна (-o).'
                    : 'Determines the conjugation class: I (-a/-ia), II (-i), or III (-o).'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5">
                <div className="text-xs font-bold uppercase text-indigo-800 dark:text-indigo-300">
                  3. Būtojo k. l. 3 asm. (-o / -ė)
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'uk'
                    ? 'Минулий одноразовий час (jis/ji)'
                    : language === 'lt'
                    ? 'Būtasis kartinis laikas (jis/ji)'
                    : '3rd Person Past Simple'}
                </div>
                <div className="font-mono text-xs text-indigo-800 dark:text-indigo-300 font-semibold">
                  dirb-o (-au, -ai), skait-ė (-iau, -ei)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'uk'
                    ? 'Має лише два типи закінчень: на -o (aš dirbau, tu dirbai) та на -ė (aš skaičiau, tu skaitei).'
                    : 'Has two ending patterns: -o stem (dirbau, dirbai) and -ė stem (skaičiau, skaitei).'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Present Tense Matrix: 3 Conjugations (Esamasis laikas) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>
                  {language === 'uk'
                    ? 'Теперішній час (Esamasis laikas) — І, ІІ та ІІІ дієвідміни'
                    : language === 'lt'
                    ? 'Esamasis laikas — I, II ir III asmenuotės'
                    : 'Present Tense (Esamasis laikas) — Conjugations I, II, III'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3.5 font-bold border-r border-slate-200 dark:border-slate-700">
                      {language === 'uk' ? 'Особа (Asmuo)' : 'Asmuo / Person'}
                    </th>
                    {([1, 2, 3] as VerbConjugationType[]).map((c) => (
                      <th
                        key={c}
                        className="p-3.5 font-bold border-r border-slate-200 dark:border-slate-700"
                      >
                        <div className="text-slate-900 dark:text-white">
                          {VERB_CONJUGATIONS_METADATA[c].title[language]}
                        </div>
                        <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                          {PRESENT_TENSE_TABLE[c].modelLt}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {VERB_PERSON_ORDER.map((pKey) => (
                    <tr
                      key={pKey}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {VERB_PERSONS_METADATA[pKey].label[language]}
                      </td>
                      {([1, 2, 3] as VerbConjugationType[]).map((c) => {
                        const cell = PRESENT_TENSE_TABLE[c].forms[pKey];
                        return (
                          <td
                            key={c}
                            className="p-3.5 border-r border-slate-200/70 dark:border-slate-800"
                          >
                            <div className="font-mono font-bold text-amber-800 dark:text-amber-400">
                              {cell.ending}
                            </div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 italic mt-0.5">
                              {cell.example}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Past, Future & Imperative Reference Matrix */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>
                  {language === 'uk'
                    ? 'Минулий час (на -o та -ė), Майбутній час (-s-) та Наказовий спосіб (-k-)'
                    : language === 'lt'
                    ? 'Būtasis kartinis laikas (-o / -ė), Būsimasis laikas (-s-) ir Liepiamoji nuosaka (-k-)'
                    : 'Past Tense (-o & -ė), Future Tense (-s-), and Imperative Mood (-k-)'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3.5 font-bold border-r border-slate-200 dark:border-slate-700">
                      {language === 'uk' ? 'Особа' : 'Asmuo'}
                    </th>
                    <th className="p-3.5 font-bold border-r border-slate-200 dark:border-slate-700">
                      <div>Būtasis k. l. (-o)</div>
                      <div className="text-[11px] font-normal text-slate-500">
                        dirbti → jis dirbo
                      </div>
                    </th>
                    <th className="p-3.5 font-bold border-r border-slate-200 dark:border-slate-700">
                      <div>Būtasis k. l. (-ė)</div>
                      <div className="text-[11px] font-normal text-slate-500">
                        skaityti → jis skaitė
                      </div>
                    </th>
                    <th className="p-3.5 font-bold border-r border-slate-200 dark:border-slate-700">
                      <div>Būsimasis laikas (+ s)</div>
                      <div className="text-[11px] font-normal text-slate-500">
                        dirb-ti → dirb-s
                      </div>
                    </th>
                    <th className="p-3.5 font-bold">
                      <div>Liepiamoji nuosaka (+ k)</div>
                      <div className="text-[11px] font-normal text-slate-500">
                        dirb-ti → dirb-k!
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {[
                    {
                      person: 'as' as const,
                      pastO: '-au (dirb-au, ėj-au)',
                      pastE: '-iau (skaič-iau, raš-iau)',
                      future: '-siu (dirb-siu, skaity-siu)',
                      imp: '—',
                    },
                    {
                      person: 'tu' as const,
                      pastO: '-ai (dirb-ai, ėj-ai)',
                      pastE: '-ei (skait-ei, raš-ei)',
                      future: '-si (dirb-si, skaity-si)',
                      imp: '-k / -ki (dirb-k!, skaity-k!)',
                    },
                    {
                      person: 'jis' as const,
                      pastO: '-o (dirb-o, ėj-o)',
                      pastE: '-ė (skait-ė, raš-ė)',
                      future: '-s (dirb-s, skaity-s)',
                      imp: 'tegul + Esam. 3 asm.',
                    },
                    {
                      person: 'mes' as const,
                      pastO: '-ome (dirb-ome, ėj-ome)',
                      pastE: '-ėme (skait-ėme, raš-ėme)',
                      future: '-sime (dirb-sime, skaity-sime)',
                      imp: '-kime (dirb-kime!, skaity-kime!)',
                    },
                    {
                      person: 'jus' as const,
                      pastO: '-ote (dirb-ote, ėj-ote)',
                      pastE: '-ėjote / -ėte (skait-ėte)',
                      future: '-site (dirb-site, skaity-site)',
                      imp: '-kite (dirb-kite!, skaity-kite!)',
                    },
                    {
                      person: 'jie' as const,
                      pastO: '-o (dirb-o, ėj-o)',
                      pastE: '-ė (skait-ė, raš-ė)',
                      future: '-s (dirb-s, skaity-s)',
                      imp: 'tegul + Esam. 3 asm.',
                    },
                  ].map((row) => (
                    <tr
                      key={row.person}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {VERB_PERSONS_METADATA[row.person].label[language]}
                      </td>
                      <td className="p-3.5 font-mono text-indigo-800 dark:text-indigo-300 border-r border-slate-200/70 dark:border-slate-800">
                        {row.pastO}
                      </td>
                      <td className="p-3.5 font-mono text-indigo-800 dark:text-indigo-300 border-r border-slate-200/70 dark:border-slate-800">
                        {row.pastE}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-800 dark:text-emerald-300 border-r border-slate-200/70 dark:border-slate-800">
                        {row.future}
                      </td>
                      <td className="p-3.5 font-mono text-amber-800 dark:text-amber-300">
                        {row.imp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Verb Case Governance (Яким відмінком керують дієслова) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'uk'
                  ? 'Керування відмінками дієслів (Veiksmažodžių linksnių valdymas)'
                  : language === 'lt'
                  ? 'Veiksmažodžių linksnių valdymas'
                  : 'Lithuanian Verb Case Governance'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                {language === 'uk'
                  ? 'У литовській мові дієслово визначає, у якому відмінку має стояти залежний іменник (зверніть увагу на дієслова, що вимагають Родового відмінка Ko? замість Знахідного):'
                  : 'In Lithuanian, the verb dictates which grammatical case the object noun must take:'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  {
                    gov: 'acc' as const,
                    verbs: 'matyti, skaityti, rašyti, pirkti, turėti, mylėti, valgyti, gerti',
                    example: 'Aš skaitau įdomią knygą (Ką? — Galininkas).',
                  },
                  {
                    gov: 'gen' as const,
                    verbs: 'ieškoti, laukti, norėti, bijoti, klausyti, prašyti, trūkti, vengti',
                    example: 'Aš ieškau naujo darbo ir laukiu autobuso (Ko? — Kilmininkas!).',
                  },
                  {
                    gov: 'dat' as const,
                    verbs: 'padėti, dėkoti, skambinti, patikti, priklausyti, atleisti, linkėti',
                    example: 'Aš padedu broliui ir skambinu draugui (Kam? — Naudininkas).',
                  },
                  {
                    gov: 'ins' as const,
                    verbs: 'domėtis, džiaugtis, didžiuotis, pasitikėti, naudotis, rūpintis, grožėtis',
                    example: 'Mes domimės istorija ir džiaugiamės vasara (Kuo? — Įnagininkas).',
                  },
                  {
                    gov: 'loc' as const,
                    verbs: 'gyventi, būti, dirbti, mokytis, ilsėtis, nakvoti, dalyvauti',
                    example: 'Jie gyvena Vilniuje ir dirba universitete (Kur? Kame? — Vietininkas).',
                  },
                  {
                    gov: 'intransitive' as const,
                    verbs: 'eiti, važiuoti, bėgti, skristi, miegoti, juoktis, šypsotis, grįžti',
                    example: 'Mes einame į parką ir važiuojame į pajūrį (прийменникові конструкції).',
                  },
                ] as const
              ).map((item) => {
                const meta = VERB_GOVERNED_CASES_METADATA[item.gov];
                return (
                  <div
                    key={item.gov}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {meta.shortBadge[language]}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {meta.fullLabel[language]}
                    </p>
                    <div className="text-xs font-mono font-semibold text-amber-800 dark:text-amber-400">
                      {item.verbs}
                    </div>
                    <div className="text-xs italic text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      „{item.example}“
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
