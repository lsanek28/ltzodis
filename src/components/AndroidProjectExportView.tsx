import React, { useState } from 'react';
import { Check, Copy, Download, FileCode, Terminal } from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';
import { ALL_VERIFIED_NOUNS } from '../data/nounsDatabase';
import { AppLanguage } from '../types/grammar';

interface AndroidProjectExportViewProps {
  language: AppLanguage;
}

export const AndroidProjectExportView: React.FC<
  AndroidProjectExportViewProps
> = ({ language }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = ANDROID_PROJECT_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadRoomAssetJson = () => {
    const roomEntities = ALL_VERIFIED_NOUNS.map((n) => ({
      id: n.id,
      lemma: n.lemma,
      translationUk: n.uk,
      translationEn: n.en,
      topic: n.topic,
      declension: n.declension,
      subtype: n.subtype,
      gender: n.gender,
      difficulty: n.difficulty,
      frequency: n.frequency,
      verified: n.verified,
      stemAlternationUk: n.stemAlternation?.uk ?? null,
      stemAlternationLt: n.stemAlternation?.lt ?? null,
      stemAlternationEn: n.stemAlternation?.en ?? null,
      sgNom: n.sg.nom,
      sgGen: n.sg.gen,
      sgDat: n.sg.dat,
      sgAcc: n.sg.acc,
      sgIns: n.sg.ins,
      sgLoc: n.sg.loc,
      sgVoc: n.sg.voc,
      plNom: n.pl.nom,
      plGen: n.pl.gen,
      plDat: n.pl.dat,
      plAcc: n.pl.acc,
      plIns: n.pl.ins,
      plLoc: n.pl.loc,
      plVoc: n.pl.voc,
    }));

    const blob = new Blob([JSON.stringify(roomEntities, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nouns_verified_150.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Android Studio Project (Kotlin · Jetpack Compose · Room · MVVM)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {language === 'uk'
              ? 'Повний вихідний код нативного Android-додатка (Kotlin, Compose, Room, DataStore, щоденні фонові нагадування через AlarmManager + WorkManager та Android Notifications API), JSON-база 150 іменників і збирання APK.'
              : language === 'lt'
              ? 'Pilnas Android Studio projekto pirminis kodas (Kotlin, Compose, Room, DataStore, kasdieniai priminimai su AlarmManager + WorkManager ir Notifications API), 150 daiktavardžių JSON bazė ir APK instrukcija.'
              : 'Complete native Android Studio source modules (Kotlin, Compose, Room, DataStore, daily background reminders via AlarmManager + WorkManager & Notifications API), 150-noun Room JSON asset, and APK build instructions.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadRoomAssetJson}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0 min-h-[42px]"
        >
          <Download className="w-4 h-4" />
          <span>assets/nouns_verified_150.json (2 100 форм)</span>
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {ANDROID_PROJECT_FILES.map((file, idx) => {
            const active = idx === selectedFileIndex;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left p-4 transition-colors ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-900 dark:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold truncate">
                  <FileCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </div>
                <div
                  className={`text-xs mt-1 ${
                    active
                      ? 'text-slate-200 dark:text-slate-900'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {file.module}
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                {activeFile.path}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeFile.description[language]}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 shrink-0 min-h-[36px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-5 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed max-h-[540px]">
            <code>{activeFile.code}</code>
          </pre>
        </div>
      </div>

      {/* Build & APK Assembly Instructions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
          <Terminal className="w-5 h-5 text-amber-600" />
          <span>
            {language === 'uk'
              ? 'Інструкція зі збирання Android Studio проєкту та APK-файлу'
              : language === 'lt'
              ? 'Android Studio projekto ir APK failo surinkimo instrukcija'
              : 'Android Studio Project & APK Build Instructions'}
          </span>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <li>
            Відкрийте <strong>Android Studio Ladybug (2024.2.1+)</strong> із встановленим{' '}
            <strong>JDK 17</strong> та Android SDK 35.
          </li>
          <li>
            Скопіюйте наведені вище модулі у структуру проєкту{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              lt.galunes.trainer
            </code>{' '}
            та покладіть завантажений файл{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              nouns_verified_150.json
            </code>{' '}
            у папку{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              app/src/main/assets/nouns_verified_150.json
            </code>
            .
          </li>
          <li>
            Для запуску автоматичних модульних тестів граматичних форм і логіки оцінювання виконайте:{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              ./gradlew testDebugUnitTest
            </code>
          </li>
          <li>
            Для збирання інсталяційного APK-файлу виконайте:{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              ./gradlew assembleDebug
            </code>{' '}
            — готовий APK буде збережено за шляхом{' '}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              app/build/outputs/apk/debug/app-debug.apk
            </code>
            .
          </li>
        </ol>
      </div>
    </div>
  );
};
