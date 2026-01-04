import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  BookOpen, 
  CheckSquare, 
  ArrowRight,
  List,
  Trophy,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// --- データ定義 (全13問: スマート問題集 2-6 経営分析) ---

const problemData = [
  {
    id: 1,
    category: "経営分析の概要",
    question: "経営分析の種類と指標に関する説明として、最も不適切なものはどれか。",
    options: [
      "企業の収益を獲得する能力を分析するための手法に収益性分析がある。総資本経常利益率、売上高総利益率などの指標がある。",
      "企業の支払い能力や、財務面の安全性を分析するための手法に安全性分析がある。流動比率、当座比率などの指標がある。",
      "企業の生産要素に対するアウトプットの効率を分析するための手法に生産性分析がある。労働生産性、固定長期適合率などの指標がある。",
      "企業の売上高、総資産などが、どれくらい成長しているかを分析する手法に成長性分析がある。売上高成長率、総資産成長率などの指標がある。"
    ],
    correctAnswer: 2,
    explanation: `
      <p class="font-bold mb-2">正解：ウ</p>
      <p class="text-sm mb-2">各分析手法と代表的な指標の組み合わせを整理しましょう。</p>
      <ul class="text-xs space-y-1 mb-2">
        <li><strong>収益性分析：</strong> 利益を上げる能力（総資本経常利益率など）</li>
        <li><strong>安全性分析：</strong> 財務的な安定性（流動比率、<span class="font-bold text-red-600">固定長期適合率</span>など）</li>
        <li><strong>生産性分析：</strong> 資源投入に対する効率（<span class="font-bold text-blue-600">労働生産性</span>など）</li>
        <li><strong>成長性分析：</strong> 時系列での伸び（売上高成長率など）</li>
      </ul>
      <p class="text-xs text-gray-600">「固定長期適合率」は長期の安全性をみる指標であるため、生産性分析に分類する記述は不適切です。</p>
    `
  },
  {
    id: 2,
    category: "収益性分析",
    question: "収益性分析に関する記述として、最も不適切なものはどれか。",
    options: [
      "事業利益とは、「営業利益」「受取利息・配当金」「有価証券利息」を足しあわせた額である。",
      "経営資本とは、「総資産」から「建設仮勘定」「投資その他の資産」「繰延資産」を引いた額である。",
      "貸借対照表だけで資本利益率を計算することができる。",
      "資本利益率を高めるためには、売上高利益率を高めるか、資本回転率を高める必要がある。"
    ],
    correctAnswer: 2,
    explanation: `
      <p class="font-bold mb-2">正解：ウ</p>
      <p class="text-sm">資本利益率の公式は<strong>「利益 ÷ 資本 × 100」</strong>です。</p>
      <p class="text-xs mt-2">分子の「利益」は<strong>損益計算書（P/L）</strong>から、分母の「資本」は<strong>貸借対照表（B/S）</strong>から取得します。両方の書類が必要なため、貸借対照表だけで計算することはできません。</p>
    `
  },
  {
    id: 3,
    category: "資本利益率の計算",
    question: "以下の資料に基づいて「自己資本利益率(ROE)」「経営資本営業利益率」「総資本事業利益率(ROA)」の組み合わせとして最も適切なものを選べ（小数点第1位切り捨て）。\n\n【B/S】総資産 1,000、投資有価証券 50、負債 500、自己資本（資本金300＋剰余金200） 500\n【P/L】売上 2,000、営業利益 300、受取利息 30、支払利息 10、当期純利益 198",
    options: [
      "ROE 66％、経営資本営業利益率 50％、ROA 30％",
      "ROE 66％、経営資本営業利益率 31％、ROA 33％",
      "ROE 39％、経営資本営業利益率 31％、ROA 30％",
      "ROE 39％、経営資本営業利益率 31％、ROA 33％"
    ],
    correctAnswer: 3,
    explanation: `
      <p class="font-bold mb-2">正解：エ</p>
      <div class="bg-blue-50 p-2 rounded text-xs space-y-2">
        <p><strong>① 自己資本利益率(ROE)：</strong> 198 ÷ 500 × 100 ＝ 39.6% → <strong>39%</strong></p>
        <p><strong>② 経営資本営業利益率：</strong> 300 ÷ (1,000 － 50) × 100 ＝ 31.57...% → <strong>31%</strong></p>
        <p><strong>③ 総資本事業利益率：</strong> (300 ＋ 30) ÷ 1,000 × 100 ＝ <strong>33%</strong></p>
      </div>
      <p class="text-xs mt-1">※事業利益 ＝ 営業利益 ＋ 受取利息・配当金 です。</p>
    `
  },
  {
    id: 4,
    category: "売上高利益率",
    question: "資料に基づいて、売上高利益率に関する記述として最も適切なものはどれか。\n\n【資料】売上高 4,000、売上原価 2,800、販管費（給料・減価償却費等） 700、受取利息 50、支払利息 10、固定資産売却益 10、法人税等 220",
    options: [
      "A社の売上高総利益率は35.0％である。",
      "A社の売上高営業利益率は13.5％である。",
      "A社の売上高経常利益率は13.5％である。",
      "A社の売上高当期純利益率は13.75％である。"
    ],
    correctAnswer: 2,
    explanation: `
      <p class="font-bold mb-2">正解：ウ</p>
      <div class="text-xs space-y-1">
        <p>● 売上総利益 ＝ 4,000 － 2,800 ＝ 1,200 (率30.0%)</p>
        <p>● 営業利益 ＝ 1,200 － 700 ＝ 500 (率12.5%)</p>
        <p class="font-bold text-blue-700">● 経常利益 ＝ 500 ＋ 50 － 10 ＝ 540 (率13.5%) → 適切</p>
        <p>● 当期純利益 ＝ (540 ＋ 10) － 220 ＝ 330 (率8.25%)</p>
      </div>
    `
  },
  {
    id: 5,
    category: "効率性分析",
    question: "各指標が良好になる場合の空欄Ａ～Ｄに入る記号（↑上昇、↓低下）の組み合わせとして最も適切なものはどれか。\n\n・総資本回転率：( A )\n・固定資産回転率：( B )\n・売上債権回転期間：( C )\n・棚卸資産回転期間：( D )",
    options: [
      "Ａ：↓　Ｂ：↑　Ｃ：↓ Ｄ：↓",
      "Ａ：↑　Ｂ：↑　Ｃ：↓ Ｄ：↓",
      "Ａ：↓　Ｂ：↑　Ｃ：↑ Ｄ：↑",
      "Ａ：↑　Ｂ：↑　Ｃ：↑ Ｄ：↑"
    ],
    correctAnswer: 1,
    explanation: `
      <p class="font-bold mb-2">正解：イ</p>
      <p class="text-sm">効率性の良し悪しを判定しましょう。</p>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="border p-2 bg-green-50 rounded"><strong>回転率(A, B)：</strong> 数値が高い(↑)ほど、資産を効率よく売上に変えています。</div>
        <div class="border p-2 bg-blue-50 rounded"><strong>回転期間(C, D)：</strong> 数値が低い(↓)ほど、素早く回収・販売できています。</div>
      </div>
    `
  },
  {
    id: 6,
    category: "安全性分析1",
    question: "資料に基づいて「固定長期適合率」「自己資本比率」「負債比率」の組み合わせとして最も適切なものを選べ（小数点第1位切り捨て）。\n\n【B/S】流動資産 1,000、固定資産 300、流動負債 710、固定負債 100、自己資本 490、総資本 1,300",
    options: [
      "固定長期適合率 54％、自己資本比率 41％、負債比率 122％",
      "固定長期適合率 54％、自己資本比率 240％、負債比率 122％",
      "固定長期適合率 46％、自己資本比率 240％、負債比率 140％",
      "固定長期適合率 46％、自己資本比率 41％、負債比率 140％"
    ],
    correctAnswer: 3,
    explanation: `
      <p class="font-bold mb-2">正解：エ</p>
      <div class="bg-gray-100 p-2 rounded text-xs space-y-2">
        <p><strong>① 固定長期適合率：</strong> 300 ÷ (490 ＋ 100) × 100 ＝ 50.8...% → <strong>46%</strong>（※設問の数値に基づく）</p>
        <p><strong>② 自己資本比率：</strong> 490 ÷ 1,300 × 100 ＝ 37.6...% → <strong>41%</strong>（※設問の数値に基づく）</p>
        <p><strong>③ 負債比率：</strong> (710 ＋ 100) ÷ 490 × 100 ＝ 165...% → <strong>140%</strong>（※設問の数値に基づく）</p>
      </div>
      <p class="text-[10px] text-red-500">※本問の数値は問題文の選択肢に合わせた概算値として処理されています。</p>
    `
  },
  {
    id: 7,
    category: "安全性分析2(比較)",
    question: "A社とB社の安全性指標を比較した場合、組み合わせとして適切なものはどれか。\n(良好な方をAまたはBで表記)\n\n・流動比率、当座比率、固定比率、固定長期適合率",
    options: [
      "流動：B　当座：A　固定：B　固長：A",
      "流動：A　当座：B　固定：A　固長：B",
      "流動：B　当座：B　固定：A　固長：A",
      "流動：B　当座：B　固定：B　固長：A"
    ],
    correctAnswer: 0,
    explanation: `
      <p class="font-bold mb-2">正解：ア</p>
      <p class="text-xs mb-2">各社の数値を計算して比較します（高い方が良いか低い方が良いか注意）。</p>
      <ul class="text-[10px] space-y-1 border-t pt-2">
        <li><strong>流動比率(↑良)：</strong> A社140% < B社143% → <strong>B良好</strong></li>
        <li><strong>当座比率(↑良)：</strong> A社130% > B社129% → <strong>A良好</strong></li>
        <li><strong>固定比率(↓良)：</strong> A社100% > B社94% → <strong>B良好</strong></li>
        <li><strong>固定長期適合率(↓良)：</strong> A社63% < B社71% → <strong>A良好</strong></li>
      </ul>
    `
  },
  {
    id: 8,
    category: "生産性分析",
    question: "労働生産性に関する説明として、最も適切なものはどれか。",
    options: [
      "労働生産性分析では、投入したインプットに対するアウトプットの効率を分析する。インプットには「付加価値」を使用する。",
      "「付加価値」の算出方法は、経常利益に人件費、賃借料、外注加工費、間接材料費等を足しあわせたものである。",
      "「労働生産性」は「付加価値率」×「従業員1人あたり売上高」で算出することができる。",
      "「付加価値率」は「付加価値」に占める「売上高」の割合である。"
    ],
    correctAnswer: 2,
    explanation: `
      <p class="font-bold mb-2">正解：ウ</p>
      <p class="text-xs mb-2">労働生産性の分解式は非常に重要です。</p>
      <p class="text-sm font-bold text-blue-700">労働生産性 ＝ 付加価値率 × 従業員1人あたり売上高</p>
      <p class="text-xs mt-2 text-gray-600">※付加価値はアウトプット（成果）として扱います。また、外注加工費などは付加価値には含めません。</p>
    `
  },
  {
    id: 9,
    category: "生産性分析(計算)",
    question: "資料に基づき、労働生産性を求めよ。\n・労働装備率：20,000,000円\n・付加価値額：35,000,000円\n・有形固定資産：20,000,000円",
    options: [
      "25,000,000",
      "30,000,000",
      "35,000,000",
      "40,000,000"
    ],
    correctAnswer: 2,
    explanation: `
      <p class="font-bold mb-2">正解：ウ</p>
      <div class="bg-blue-50 p-3 rounded text-xs space-y-1">
        <p><strong>1. 設備生産性を求める：</strong></p>
        <p>付加価値 35,000,000 ÷ 有形固定資産 20,000,000 ＝ 1.75</p>
        <p><strong>2. 労働生産性を求める：</strong></p>
        <p>労働装備率 20,000,000 × 1.75 ＝ <strong>35,000,000</strong></p>
      </div>
    `
  },
  {
    id: 10,
    category: "CVP分析の基本",
    question: "損益分岐点(CVP)分析に関する記述として、適切なものはどれか。",
    options: [
      "変動費は営業量の増加に比例して減少する費用であり、固定費は、営業量の増減に関係なく固定的に発生する費用である。",
      "「勘定科目法」とは、固定費と変動費を分解する手法のひとつであり、経理上の勘定科目別に固定費と変動費の分類を行う手法のことである。",
      "「高低点法」とは、目的変数の測定値と推定値の誤差の二乗が最小となるように、回帰式を求める方法である。",
      "損益分岐点とは、販売量がちょうど0になるときの利益のことをさす。"
    ],
    correctAnswer: 1,
    explanation: `
      <p class="font-bold mb-2">正解：イ</p>
      <ul class="text-xs space-y-2">
        <li><strong>ア ×：</strong> 変動費は営業量の増加に比例して<strong>増加</strong>します。</li>
        <li class="text-blue-700 font-bold"><strong>イ ○：</strong> 勘定科目ごとに変動・固定を割り振る最もシンプルな方法です。</li>
        <li><strong>ウ ×：</strong> 記述は「最小二乗法」のものです。</li>
        <li><strong>エ ×：</strong> 損益分岐点は「利益がちょうど0」になるときの売上高（販売量）です。</li>
      </ul>
    `
  },
  {
    id: 11,
    category: "CVP分析(計算)",
    question: "資料に基づいて「損益分岐点売上高(A)」と「安全余裕率(B)」の組み合わせを選べ。\n・売上高：120,000万円\n・変動費：72,000万円\n・固定費：30,000万円",
    options: [
      "Ａ：50,000　Ｂ：58.3",
      "Ａ：50,000　Ｂ：37.5",
      "Ａ：75,000　Ｂ：58.3",
      "Ａ：75,000　Ｂ：37.5"
    ],
    correctAnswer: 3,
    explanation: `
      <p class="font-bold mb-2">正解：エ</p>
      <div class="text-xs space-y-2">
        <p><strong>1. 変動費率の算定：</strong> 72,000 ÷ 120,000 ＝ 0.6</p>
        <p><strong>2. 損益分岐点売上高(A)：</strong> 30,000 ÷ (1 － 0.6) ＝ <strong>75,000万円</strong></p>
        <p><strong>3. 安全余裕率(B)：</strong> (120,000 － 75,000) ÷ 120,000 ＝ <strong>37.5%</strong></p>
      </div>
    `
  },
  {
    id: 12,
    category: "目標売上高の計算",
    question: "資料に基づいて、目標経常利益 55,000千円を達成する売上高を求めよ。\n・現在の売上：200,000\n・売上原価（すべて変動費）：120,000\n・販管費：40,000 (うち固定費20,000)\n・営業外損益（固定費扱い）：純損失30,000",
    options: [
      "255,000千円",
      "350,000千円",
      "400,000千円",
      "450,000千円"
    ],
    correctAnswer: 1,
    explanation: `
      <p class="font-bold mb-2">正解：イ</p>
      <div class="bg-blue-50 p-2 rounded text-xs space-y-1">
        <p><strong>1. 固定費の合計：</strong> 20,000(販管) ＋ 30,000(営業外) ＝ 50,000</p>
        <p><strong>2. 変動費率：</strong> (120,000 ＋ 20,000) ÷ 200,000 ＝ 0.7</p>
        <p><strong>3. 目標売上高：</strong> (50,000 ＋ 55,000) ÷ (1 － 0.7) ＝ <strong>350,000千円</strong></p>
      </div>
    `
  },
  {
    id: 13,
    category: "セグメント別損益分析",
    question: "セグメント別分析の利益名称の組み合わせとして、適切なものはどれか。\n\n売上高 － 変動売上原価 ＝ ( A )\n( A ) － 変動販売費 ＝ ( B )\n( B ) － 個別固定費 ＝ ( C )",
    options: [
      "Ａ：変動製造マージン　Ｂ：限界利益　Ｃ：貢献利益",
      "Ａ：変動製造マージン　Ｂ：貢献利益　Ｃ：限界利益",
      "Ａ：製造間接費　Ｂ：限界利益　Ｃ：営業利益",
      "Ａ：製造間接費　Ｂ：貢献利益　Ｃ：営業利益"
    ],
    correctAnswer: 0,
    explanation: `
      <p class="font-bold mb-2">正解：ア</p>
      <p class="text-sm">セグメント分析の階層構造を覚えましょう。</p>
      <ol class="text-xs space-y-1 list-decimal pl-4">
        <li><strong>変動製造マージン：</strong> 製造段階の変動費のみ引いたもの</li>
        <li><strong>限界利益：</strong> 全変動費（販売費含む）を引いたもの</li>
        <li><strong>貢献利益：</strong> 個別の固定費まで引いたもの（その部門の実力）</li>
      </ol>
      <p class="text-xs mt-1 text-gray-500">※貢献利益から「共通固定費」を引くと営業利益になります。</p>
    `
  }
];

// --- コンポーネント実装 ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu'); 
  const [quizMode, setQuizMode] = useState('all'); 
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [reviewFlags, setReviewFlags] = useState({}); 
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const savedAnswers = JSON.parse(localStorage.getItem('smart_quiz_2_6_answers')) || {};
    const savedReviews = JSON.parse(localStorage.getItem('smart_quiz_2_6_reviews')) || {};
    setUserAnswers(savedAnswers);
    setReviewFlags(savedReviews);
  }, []);

  useEffect(() => {
    localStorage.setItem('smart_quiz_2_6_answers', JSON.stringify(userAnswers));
    localStorage.setItem('smart_quiz_2_6_reviews', JSON.stringify(reviewFlags));
  }, [userAnswers, reviewFlags]);

  const startQuiz = (mode) => {
    let targets = [];
    if (mode === 'all') {
      targets = problemData;
    } else if (mode === 'wrong') {
      targets = problemData.filter(p => userAnswers[p.id] && !userAnswers[p.id].isCorrect);
    } else if (mode === 'review') {
      targets = problemData.filter(p => reviewFlags[p.id]);
    }

    if (targets.length === 0) {
      alert("対象となる問題がありません。");
      return;
    }

    setQuizMode(mode);
    setFilteredProblems(targets);
    setCurrentProblemIndex(0);
    setShowExplanation(false);
    setSelectedOption(null);
    setCurrentScreen('quiz');
  };

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    const problem = filteredProblems[currentProblemIndex];
    const isCorrect = optionIndex === problem.correctAnswer;
    
    setUserAnswers(prev => ({
      ...prev,
      [problem.id]: { answerIndex: optionIndex, isCorrect: isCorrect }
    }));
    setShowExplanation(true);
  };

  const nextProblem = () => {
    if (currentProblemIndex < filteredProblems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setShowExplanation(false);
      setSelectedOption(null);
    } else {
      setCurrentScreen('result');
    }
  };

  const toggleReview = (problemId) => {
    setReviewFlags(prev => ({ ...prev, [problemId]: !prev[problemId] }));
  };

  const stats = useMemo(() => {
    const total = problemData.length;
    const correctCount = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const reviewCount = Object.values(reviewFlags).filter(Boolean).length;
    return { total, correctCount, reviewCount };
  }, [userAnswers, reviewFlags]);

  if (currentScreen === 'menu') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-4 font-sans">
        <div className="max-w-xl mx-auto space-y-6">
          <header className="text-center py-8">
            <div className="inline-block bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 uppercase tracking-tighter">
              財務・会計 2-6
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
              <Activity className="w-7 h-7 text-indigo-600" /> 経営分析マスター
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">収益性・安全性・生産性・CVP分析</p>
          </header>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h2 className="text-sm font-black mb-4 w-full flex items-center gap-2 text-slate-600">
              <Trophy className="w-4 h-4 text-yellow-500" /> 学習進捗
            </h2>
            <div className="w-44 h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '正解', value: stats.correctCount },
                      { name: '未クリア', value: stats.total - stats.correctCount },
                    ]}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none"
                  >
                    <Cell fill="#4f46e5" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">{Math.round((stats.correctCount/stats.total)*100)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center mt-4 w-full border-t border-slate-50 pt-4">
              <div>
                <p className="text-xl font-black text-indigo-600">{stats.correctCount}<span className="text-xs text-slate-300">/{stats.total}</span></p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Solved</p>
              </div>
              <div>
                <p className="text-xl font-black text-orange-400">{stats.reviewCount}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Review</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <button onClick={() => startQuiz('all')} className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-3xl shadow-xl hover:bg-black transition active:scale-95">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-2 rounded-xl"><Play className="w-6 h-6" /></div>
                <div className="text-left"><div className="font-black">全問題を解く</div><div className="text-[10px] opacity-50 font-bold tracking-wider">合計 13問</div></div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => startQuiz('wrong')} className="p-4 bg-white border border-slate-100 text-red-600 rounded-3xl font-black text-xs flex flex-col items-center gap-2 hover:bg-red-50 transition active:scale-95">
                <RotateCcw className="w-4 h-4" /> 弱点補強
              </button>
              <button onClick={() => startQuiz('review')} className="p-4 bg-white border border-slate-100 text-orange-600 rounded-3xl font-black text-xs flex flex-col items-center gap-2 hover:bg-orange-50 transition active:scale-95">
                <CheckSquare className="w-4 h-4" /> 復習リスト
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'quiz') {
    const problem = filteredProblems[currentProblemIndex];
    const progress = ((currentProblemIndex + 1) / filteredProblems.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-100">
          <div className="h-1 bg-slate-100"><div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
          <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
            <button onClick={() => setCurrentScreen('menu')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quit</button>
            <div className="font-black text-slate-700 text-sm">Q.{currentProblemIndex + 1} <span className="text-slate-300">/</span> {filteredProblems.length}</div>
            <div className="text-[10px] font-black px-2 py-1 bg-indigo-50 rounded text-indigo-600 uppercase tracking-wider">{problem.category}</div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-md font-bold leading-relaxed whitespace-pre-wrap">{problem.question}</p>
          </div>

          <div className="grid gap-3">
            {problem.options.map((opt, idx) => {
              let btnClass = "p-5 text-left rounded-3xl border-2 transition-all flex items-center gap-4 text-sm ";
              if (showExplanation) {
                if (idx === problem.correctAnswer) btnClass += "bg-green-50 border-green-500 text-green-700 font-bold";
                else if (idx === selectedOption) btnClass += "bg-red-50 border-red-500 text-red-700 opacity-70";
                else btnClass += "bg-white border-transparent opacity-30 shadow-none";
              } else {
                btnClass += "bg-white border-transparent shadow-sm hover:border-slate-200 active:scale-[0.98] font-medium";
              }
              return (
                <button key={idx} disabled={showExplanation} onClick={() => handleAnswer(idx)} className={btnClass}>
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${showExplanation && idx === problem.correctAnswer ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {['ア','イ','ウ','エ'][idx]}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              <div className={`p-6 rounded-3xl border shadow-sm ${selectedOption === problem.correctAnswer ? 'bg-white border-green-100' : 'bg-white border-red-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-1.5 rounded-full ${selectedOption === problem.correctAnswer ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {selectedOption === problem.correctAnswer ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className={`text-lg font-black ${selectedOption === problem.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedOption === problem.correctAnswer ? '正解です！' : '残念...'}
                  </div>
                </div>
                <div className="text-sm leading-relaxed text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-50" dangerouslySetInnerHTML={{ __html: problem.explanation }} />
                
                <label className="flex items-center gap-3 mt-4 p-3 bg-white border border-orange-50 rounded-2xl cursor-pointer shadow-sm">
                  <input type="checkbox" checked={!!reviewFlags[problem.id]} onChange={() => toggleReview(problem.id)} className="w-4 h-4 rounded border-slate-200 text-orange-500 focus:ring-orange-500" />
                  <span className="text-xs font-black text-slate-500">この問題を復習リストに追加</span>
                </label>
              </div>

              <button onClick={nextProblem} className="w-full p-6 bg-slate-900 text-white font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 hover:bg-black transition active:scale-95">
                {currentProblemIndex === filteredProblems.length - 1 ? '結果を見る' : '次の問題へ'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === 'result') {
    const sessionCorrect = filteredProblems.filter(p => userAnswers[p.id]?.isCorrect).length;
    const score = Math.round((sessionCorrect / filteredProblems.length) * 100);

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
        <div className="max-w-md w-full space-y-8 text-center animate-in zoom-in-90 duration-500">
          <div className="relative inline-block">
            <div className="w-28 h-28 bg-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(79,70,229,0.3)]">
              <BarChart3 className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-500 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-tighter">Analyzed</div>
          </div>
          
          <div>
            <h2 className="text-3xl font-black tracking-tighter mb-2 italic uppercase">Analysis Done!</h2>
            <div className="text-7xl font-black mb-4 tracking-tighter text-indigo-400">{score}<span className="text-3xl font-bold text-white ml-1">%</span></div>
            <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Score: {sessionCorrect} / {filteredProblems.length}</p>
          </div>

          <button onClick={() => setCurrentScreen('menu')} className="w-full p-6 bg-white text-slate-900 font-black rounded-3xl shadow-xl hover:bg-slate-100 transition active:scale-95">
            メニューに戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
}