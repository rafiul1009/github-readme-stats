/**
 * Widget label catalog (task 5.2). English is the always-complete base;
 * every other locale is a *partial* override, so a locale missing a given
 * key (or missing entirely, for the locales in locales.ts that don't have a
 * catalog yet) silently falls back to English rather than rendering blank.
 *
 * Scope: 12 fully-translated locales at launch, not all 25 in the registry
 * — same reasoning as the theme registry's D5 (hand-verified quality over
 * mechanically-generated breadth). The remaining registry locales already
 * get correct number/date formatting via Intl; only their card labels fall
 * back to English pending translation. Extending a locale costs adding one
 * object here — no code changes.
 */
export type LabelKey =
  | "totalContributions"
  | "currentStreak"
  | "longestStreak"
  | "present"
  | "noStreak"
  | "totalStars"
  | "totalCommits"
  | "totalCommitsCurrentYear"
  | "totalPRs"
  | "totalIssues"
  | "contributedTo"
  | "prReviews"
  | "discussionsStarted"
  | "discussionsAnswered"
  | "prsMerged"
  | "prsMergedPercent"
  | "statsTitle"
  | "mostUsedLanguages"
  | "noLanguageData"
  | "archived"
  | "template"
  | "fork"
  | "moreFile"
  | "moreFiles"
  | "couldNotRenderWidget"
  | "activityGraphTitle"
  | "heatmapTitle"
  | "less"
  | "more"
  | "trophyGridTitle"
  | "trophyStars"
  | "trophyCommits"
  | "trophyFollowers"
  | "trophyIssues"
  | "trophyPrs"
  | "trophyRepos"
  | "trophySecretMultiLanguage"
  | "trophySecretMultiOrg"
  | "trophySecretAncientAccount"
  | "trophySecretLongTimeAccount"
  | "trophySecretNewAccount"
  | "trophySecretSuperRank"
  | "profileSummaryTitle"
  | "reposPerLanguageTitle"
  | "mostCommitLanguageTitle"
  | "productiveTimeTitle"
  | "followers"
  | "following"
  | "joined"
  | "hourOfDay"
  | "dayOfWeek"
  | "noTrophiesData"
  | "noCommitLanguageData"
  | "badgeRepositories"
  | "badgeOrganization"
  | "badgeLanguages"
  | "badgeTotalContributors"
  | "badgeJoinedYears"
  | "badgeForks"
  | "badgeContributors"
  | "badgeWatchers"
  | "badgeSize"
  | "badgeUnknown"
  | "noBadgesData"
  | "noTechIconsData"
  | "badgesTitle"
  | "techIconsTitle"
  | "wakatimeTitle"
  | "totalTimeThisWeek"
  | "noWakaTimeData"
  | "skylineTitle"
  | "mediumTitle"
  | "noMediumData"
  | "stackoverflowTitle"
  | "noStackOverflowData"
  | "npmDownloadsTitle"
  | "downloadsLastWeek"
  | "rosterTitle"
  | "noRosterData";

export const EN_CATALOG: Record<LabelKey, string> = {
  totalContributions: "Total Contributions",
  currentStreak: "Current Streak",
  longestStreak: "Longest Streak",
  present: "Present",
  noStreak: "No streak",
  totalStars: "Total Stars",
  totalCommits: "Total Commits",
  totalCommitsCurrentYear: "Total Commits (Current Year)",
  totalPRs: "Total PRs",
  totalIssues: "Total Issues",
  contributedTo: "Contributed to",
  prReviews: "PR Reviews",
  discussionsStarted: "Discussions Started",
  discussionsAnswered: "Discussions Answered",
  prsMerged: "PRs Merged",
  prsMergedPercent: "PRs Merged %",
  statsTitle: "{name}'s GitHub Stats",
  mostUsedLanguages: "Most Used Languages",
  noLanguageData: "No language data available.",
  archived: "Archived",
  template: "Template",
  fork: "Fork",
  moreFile: "+{n} more file",
  moreFiles: "+{n} more files",
  couldNotRenderWidget: "Could not render widget",
  activityGraphTitle: "Contribution Activity",
  heatmapTitle: "Contribution Heatmap",
  less: "Less",
  more: "More",
  trophyGridTitle: "GitHub Trophies",
  trophyStars: "Stars",
  trophyCommits: "Commits",
  trophyFollowers: "Followers",
  trophyIssues: "Issues",
  trophyPrs: "Pull Requests",
  trophyRepos: "Repositories",
  trophySecretMultiLanguage: "Polyglot",
  trophySecretMultiOrg: "Team Player",
  trophySecretAncientAccount: "Ancient Account",
  trophySecretLongTimeAccount: "Long-Time User",
  trophySecretNewAccount: "New Account",
  trophySecretSuperRank: "Super Rank",
  profileSummaryTitle: "{name}'s GitHub Profile",
  reposPerLanguageTitle: "Repos per Language",
  mostCommitLanguageTitle: "Most Commit Language",
  productiveTimeTitle: "Productive Time",
  followers: "Followers",
  following: "Following",
  joined: "Joined {year}",
  hourOfDay: "Hour of Day",
  dayOfWeek: "Day of Week",
  noTrophiesData: "No trophies matched the given filters.",
  noCommitLanguageData: "No commit data available.",
  badgeRepositories: "Repositories",
  badgeOrganization: "Organizations",
  badgeLanguages: "Languages",
  badgeTotalContributors: "Contributed To",
  badgeJoinedYears: "Years on GitHub",
  badgeForks: "Forks",
  badgeContributors: "Contributors",
  badgeWatchers: "Watchers",
  badgeSize: "Size",
  badgeUnknown: "Unknown",
  noBadgesData: "No badges requested — pass name=stars,followers,...",
  noTechIconsData: "No icons requested — pass name=react,python,...",
  badgesTitle: "Badges",
  techIconsTitle: "Tech Stack",
  wakatimeTitle: "{username}'s Weekly Coding Activity",
  totalTimeThisWeek: "Total Time: {total}",
  noWakaTimeData: "No WakaTime activity data available.",
  skylineTitle: "Contribution Skyline",
  mediumTitle: "Latest Articles",
  noMediumData: "No articles found.",
  stackoverflowTitle: "Stack Overflow",
  noStackOverflowData: "No Stack Overflow data available.",
  npmDownloadsTitle: "npm Downloads",
  downloadsLastWeek: "downloads last week",
  rosterTitle: "Stargazers",
  noRosterData: "No one yet — be the first!",
};

/**
 * Phase 7 labels (trophies, profile summary, repos-per-language,
 * most-commit-language, productive-time) ship English-only for now — see
 * docs/TODOS.md 7.x. Extending the 12 fully-translated locales above to
 * cover them is unstarted, scoped-down work, not a bug: `t()` already
 * falls back to English for any locale missing a key, so nothing renders
 * blank in the meantime.
 */

type PartialCatalog = Partial<Record<LabelKey, string>>;

export const CATALOGS: Record<string, PartialCatalog> = {
  es: {
    totalContributions: "Contribuciones Totales",
    currentStreak: "Racha Actual",
    longestStreak: "Racha Más Larga",
    present: "Presente",
    noStreak: "Sin racha",
    totalStars: "Estrellas Totales",
    totalCommits: "Commits Totales",
    totalCommitsCurrentYear: "Commits Totales (Año Actual)",
    totalPRs: "PRs Totales",
    totalIssues: "Issues Totales",
    contributedTo: "Contribuido a",
    prReviews: "Revisiones de PR",
    discussionsStarted: "Discusiones Iniciadas",
    discussionsAnswered: "Discusiones Respondidas",
    prsMerged: "PRs Fusionados",
    prsMergedPercent: "% de PRs Fusionados",
    statsTitle: "Estadísticas de GitHub de {name}",
    mostUsedLanguages: "Lenguajes Más Usados",
    noLanguageData: "No hay datos de lenguajes disponibles.",
    archived: "Archivado",
    template: "Plantilla",
    fork: "Fork",
    moreFile: "+{n} archivo más",
    moreFiles: "+{n} archivos más",
    couldNotRenderWidget: "No se pudo renderizar el widget",
    activityGraphTitle: "Actividad de Contribuciones",
    heatmapTitle: "Mapa de Calor de Contribuciones",
    less: "Menos",
    more: "Más",
  },
  fr: {
    totalContributions: "Contributions Totales",
    currentStreak: "Série Actuelle",
    longestStreak: "Plus Longue Série",
    present: "Présent",
    noStreak: "Aucune série",
    totalStars: "Étoiles Totales",
    totalCommits: "Commits Totaux",
    totalCommitsCurrentYear: "Commits Totaux (Année en Cours)",
    totalPRs: "PRs Totales",
    totalIssues: "Issues Totales",
    contributedTo: "A contribué à",
    prReviews: "Revues de PR",
    discussionsStarted: "Discussions Lancées",
    discussionsAnswered: "Discussions Répondues",
    prsMerged: "PRs Fusionnées",
    prsMergedPercent: "% de PRs Fusionnées",
    statsTitle: "Statistiques GitHub de {name}",
    mostUsedLanguages: "Langages les Plus Utilisés",
    noLanguageData: "Aucune donnée de langage disponible.",
    archived: "Archivé",
    template: "Modèle",
    fork: "Fork",
    moreFile: "+{n} fichier de plus",
    moreFiles: "+{n} fichiers de plus",
    couldNotRenderWidget: "Impossible d'afficher le widget",
    activityGraphTitle: "Activité des Contributions",
    heatmapTitle: "Carte de Chaleur des Contributions",
    less: "Moins",
    more: "Plus",
  },
  de: {
    totalContributions: "Beiträge Gesamt",
    currentStreak: "Aktuelle Serie",
    longestStreak: "Längste Serie",
    present: "Heute",
    noStreak: "Keine Serie",
    totalStars: "Sterne Gesamt",
    totalCommits: "Commits Gesamt",
    totalCommitsCurrentYear: "Commits Gesamt (Aktuelles Jahr)",
    totalPRs: "PRs Gesamt",
    totalIssues: "Issues Gesamt",
    contributedTo: "Beigetragen zu",
    prReviews: "PR-Reviews",
    discussionsStarted: "Diskussionen Gestartet",
    discussionsAnswered: "Diskussionen Beantwortet",
    prsMerged: "PRs Gemerged",
    prsMergedPercent: "% PRs Gemerged",
    statsTitle: "GitHub-Statistik von {name}",
    mostUsedLanguages: "Meistgenutzte Sprachen",
    noLanguageData: "Keine Sprachdaten verfügbar.",
    archived: "Archiviert",
    template: "Vorlage",
    fork: "Fork",
    moreFile: "+{n} weitere Datei",
    moreFiles: "+{n} weitere Dateien",
    couldNotRenderWidget: "Widget konnte nicht gerendert werden",
    activityGraphTitle: "Beitragsaktivität",
    heatmapTitle: "Beitrags-Heatmap",
    less: "Weniger",
    more: "Mehr",
  },
  "pt-BR": {
    totalContributions: "Total de Contribuições",
    currentStreak: "Sequência Atual",
    longestStreak: "Sequência Mais Longa",
    present: "Presente",
    noStreak: "Sem sequência",
    totalStars: "Total de Estrelas",
    totalCommits: "Total de Commits",
    totalCommitsCurrentYear: "Total de Commits (Ano Atual)",
    totalPRs: "Total de PRs",
    totalIssues: "Total de Issues",
    contributedTo: "Contribuiu para",
    prReviews: "Revisões de PR",
    discussionsStarted: "Discussões Iniciadas",
    discussionsAnswered: "Discussões Respondidas",
    prsMerged: "PRs Mesclados",
    prsMergedPercent: "% de PRs Mesclados",
    statsTitle: "Estatísticas do GitHub de {name}",
    mostUsedLanguages: "Linguagens Mais Usadas",
    noLanguageData: "Nenhum dado de linguagem disponível.",
    archived: "Arquivado",
    template: "Modelo",
    fork: "Fork",
    moreFile: "+{n} arquivo a mais",
    moreFiles: "+{n} arquivos a mais",
    couldNotRenderWidget: "Não foi possível renderizar o widget",
    activityGraphTitle: "Atividade de Contribuições",
    heatmapTitle: "Mapa de Calor de Contribuições",
    less: "Menos",
    more: "Mais",
  },
  it: {
    totalContributions: "Contributi Totali",
    currentStreak: "Serie Attuale",
    longestStreak: "Serie Più Lunga",
    present: "Presente",
    noStreak: "Nessuna serie",
    totalStars: "Stelle Totali",
    totalCommits: "Commit Totali",
    totalCommitsCurrentYear: "Commit Totali (Anno Corrente)",
    totalPRs: "PR Totali",
    totalIssues: "Issue Totali",
    contributedTo: "Ha contribuito a",
    prReviews: "Revisioni PR",
    discussionsStarted: "Discussioni Avviate",
    discussionsAnswered: "Discussioni Risposte",
    prsMerged: "PR Unite",
    prsMergedPercent: "% PR Unite",
    statsTitle: "Statistiche GitHub di {name}",
    mostUsedLanguages: "Linguaggi Più Usati",
    noLanguageData: "Nessun dato sui linguaggi disponibile.",
    archived: "Archiviato",
    template: "Modello",
    fork: "Fork",
    moreFile: "+{n} altro file",
    moreFiles: "+{n} altri file",
    couldNotRenderWidget: "Impossibile renderizzare il widget",
    activityGraphTitle: "Attività dei Contributi",
    heatmapTitle: "Mappa di Calore dei Contributi",
    less: "Meno",
    more: "Più",
  },
  ru: {
    totalContributions: "Всего вкладов",
    currentStreak: "Текущая серия",
    longestStreak: "Самая длинная серия",
    present: "Сейчас",
    noStreak: "Нет серии",
    totalStars: "Всего звёзд",
    totalCommits: "Всего коммитов",
    totalCommitsCurrentYear: "Всего коммитов (текущий год)",
    totalPRs: "Всего PR",
    totalIssues: "Всего issue",
    contributedTo: "Внёс вклад в",
    prReviews: "Обзоры PR",
    discussionsStarted: "Начатые обсуждения",
    discussionsAnswered: "Отвеченные обсуждения",
    prsMerged: "Слито PR",
    prsMergedPercent: "% слитых PR",
    statsTitle: "GitHub-статистика {name}",
    mostUsedLanguages: "Самые используемые языки",
    noLanguageData: "Нет данных о языках.",
    archived: "В архиве",
    template: "Шаблон",
    fork: "Форк",
    moreFile: "+ещё {n} файл",
    moreFiles: "+ещё {n} файлов",
    couldNotRenderWidget: "Не удалось отобразить виджет",
    activityGraphTitle: "Активность вкладов",
    heatmapTitle: "Тепловая карта вкладов",
    less: "Меньше",
    more: "Больше",
  },
  ja: {
    totalContributions: "総コントリビューション数",
    currentStreak: "現在の連続記録",
    longestStreak: "最長連続記録",
    present: "現在",
    noStreak: "連続記録なし",
    totalStars: "総スター数",
    totalCommits: "総コミット数",
    totalCommitsCurrentYear: "総コミット数(今年)",
    totalPRs: "総PR数",
    totalIssues: "総Issue数",
    contributedTo: "コントリビュート先",
    prReviews: "PRレビュー数",
    discussionsStarted: "開始したディスカッション",
    discussionsAnswered: "回答したディスカッション",
    prsMerged: "マージ済みPR",
    prsMergedPercent: "PRマージ率",
    statsTitle: "{name}のGitHub統計",
    mostUsedLanguages: "よく使う言語",
    noLanguageData: "言語データがありません。",
    archived: "アーカイブ済み",
    template: "テンプレート",
    fork: "フォーク",
    moreFile: "他{n}件のファイル",
    moreFiles: "他{n}件のファイル",
    couldNotRenderWidget: "ウィジェットを表示できませんでした",
    activityGraphTitle: "コントリビューション活動",
    heatmapTitle: "コントリビューションヒートマップ",
    less: "少ない",
    more: "多い",
  },
  ko: {
    totalContributions: "총 기여 수",
    currentStreak: "현재 연속 기록",
    longestStreak: "최장 연속 기록",
    present: "현재",
    noStreak: "연속 기록 없음",
    totalStars: "총 스타 수",
    totalCommits: "총 커밋 수",
    totalCommitsCurrentYear: "총 커밋 수(올해)",
    totalPRs: "총 PR 수",
    totalIssues: "총 이슈 수",
    contributedTo: "기여한 저장소",
    prReviews: "PR 리뷰",
    discussionsStarted: "시작한 토론",
    discussionsAnswered: "답변한 토론",
    prsMerged: "병합된 PR",
    prsMergedPercent: "PR 병합 비율",
    statsTitle: "{name}의 GitHub 통계",
    mostUsedLanguages: "가장 많이 사용한 언어",
    noLanguageData: "언어 데이터가 없습니다.",
    archived: "보관됨",
    template: "템플릿",
    fork: "포크",
    moreFile: "파일 {n}개 더보기",
    moreFiles: "파일 {n}개 더보기",
    couldNotRenderWidget: "위젯을 렌더링할 수 없습니다",
    activityGraphTitle: "기여 활동",
    heatmapTitle: "기여 히트맵",
    less: "적음",
    more: "많음",
  },
  "zh-CN": {
    totalContributions: "总贡献数",
    currentStreak: "当前连续天数",
    longestStreak: "最长连续天数",
    present: "至今",
    noStreak: "无连续记录",
    totalStars: "总星标数",
    totalCommits: "总提交数",
    totalCommitsCurrentYear: "总提交数(今年)",
    totalPRs: "总PR数",
    totalIssues: "总Issue数",
    contributedTo: "贡献仓库数",
    prReviews: "PR评审数",
    discussionsStarted: "发起的讨论",
    discussionsAnswered: "回答的讨论",
    prsMerged: "已合并PR",
    prsMergedPercent: "PR合并率",
    statsTitle: "{name} 的 GitHub 统计",
    mostUsedLanguages: "最常用语言",
    noLanguageData: "暂无语言数据。",
    archived: "已归档",
    template: "模板",
    fork: "复刻",
    moreFile: "还有{n}个文件",
    moreFiles: "还有{n}个文件",
    couldNotRenderWidget: "无法渲染组件",
    activityGraphTitle: "贡献活动",
    heatmapTitle: "贡献热力图",
    less: "较少",
    more: "较多",
  },
  ar: {
    totalContributions: "إجمالي المساهمات",
    currentStreak: "التتابع الحالي",
    longestStreak: "أطول تتابع",
    present: "حتى الآن",
    noStreak: "لا يوجد تتابع",
    totalStars: "إجمالي النجوم",
    totalCommits: "إجمالي الالتزامات",
    totalCommitsCurrentYear: "إجمالي الالتزامات (السنة الحالية)",
    totalPRs: "إجمالي طلبات السحب",
    totalIssues: "إجمالي المشكلات",
    contributedTo: "ساهم في",
    prReviews: "مراجعات الطلبات",
    discussionsStarted: "المناقشات التي بدأها",
    discussionsAnswered: "المناقشات التي أجاب عنها",
    prsMerged: "طلبات السحب المدمجة",
    prsMergedPercent: "نسبة دمج الطلبات",
    statsTitle: "إحصائيات GitHub لـ {name}",
    mostUsedLanguages: "أكثر اللغات استخدامًا",
    noLanguageData: "لا توجد بيانات عن اللغات.",
    archived: "مؤرشف",
    template: "قالب",
    fork: "نسخة (Fork)",
    moreFile: "+{n} ملف إضافي",
    moreFiles: "+{n} ملفات إضافية",
    couldNotRenderWidget: "تعذر عرض العنصر",
    activityGraphTitle: "نشاط المساهمات",
    heatmapTitle: "خريطة حرارة المساهمات",
    less: "أقل",
    more: "أكثر",
  },
  hi: {
    totalContributions: "कुल योगदान",
    currentStreak: "मौजूदा स्ट्रीक",
    longestStreak: "सबसे लंबी स्ट्रीक",
    present: "अब तक",
    noStreak: "कोई स्ट्रीक नहीं",
    totalStars: "कुल स्टार",
    totalCommits: "कुल कमिट",
    totalCommitsCurrentYear: "कुल कमिट (मौजूदा वर्ष)",
    totalPRs: "कुल PR",
    totalIssues: "कुल इश्यू",
    contributedTo: "योगदान दिया",
    prReviews: "PR समीक्षाएं",
    discussionsStarted: "शुरू की गई चर्चाएं",
    discussionsAnswered: "उत्तर दी गई चर्चाएं",
    prsMerged: "मर्ज किए गए PR",
    prsMergedPercent: "PR मर्ज प्रतिशत",
    statsTitle: "{name} का GitHub आँकड़ा",
    mostUsedLanguages: "सबसे ज्यादा उपयोग की गई भाषाएं",
    noLanguageData: "कोई भाषा डेटा उपलब्ध नहीं है।",
    archived: "संग्रहीत",
    template: "टेम्पलेट",
    fork: "फ़ोर्क",
    moreFile: "+{n} और फ़ाइल",
    moreFiles: "+{n} और फ़ाइलें",
    couldNotRenderWidget: "विजेट प्रस्तुत नहीं किया जा सका",
    activityGraphTitle: "योगदान गतिविधि",
    heatmapTitle: "योगदान हीटमैप",
    less: "कम",
    more: "ज्यादा",
  },
  tr: {
    totalContributions: "Toplam Katkı",
    currentStreak: "Mevcut Seri",
    longestStreak: "En Uzun Seri",
    present: "Şimdi",
    noStreak: "Seri yok",
    totalStars: "Toplam Yıldız",
    totalCommits: "Toplam Commit",
    totalCommitsCurrentYear: "Toplam Commit (Bu Yıl)",
    totalPRs: "Toplam PR",
    totalIssues: "Toplam Issue",
    contributedTo: "Katkıda Bulunulan",
    prReviews: "PR İncelemeleri",
    discussionsStarted: "Başlatılan Tartışmalar",
    discussionsAnswered: "Yanıtlanan Tartışmalar",
    prsMerged: "Birleştirilen PR",
    prsMergedPercent: "PR Birleştirme Oranı",
    statsTitle: "{name} GitHub İstatistikleri",
    mostUsedLanguages: "En Çok Kullanılan Diller",
    noLanguageData: "Dil verisi bulunamadı.",
    archived: "Arşivlendi",
    template: "Şablon",
    fork: "Fork",
    moreFile: "+{n} dosya daha",
    moreFiles: "+{n} dosya daha",
    couldNotRenderWidget: "Widget oluşturulamadı",
    activityGraphTitle: "Katkı Aktivitesi",
    heatmapTitle: "Katkı Isı Haritası",
    less: "Az",
    more: "Çok",
  },
};
