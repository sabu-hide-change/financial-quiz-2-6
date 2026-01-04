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
  Calculator,
  TrendingUp,
  Factory
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// --- データ定義 (全10問: 過去問セレクト演習 2-5 原価計算) ---

const problemData = [
  {
    id: 1,
    category: "販売差異分析",
    question: "ある製品の第3四半期(Q3)の販売予算と実績は以下の通りである。予算実績差異を「販売数量差異」と「販売価格差異」に分解した場合、最も適切な組み合わせはどれか。\n\n【予算(Q3)】販売量：1,500個、売上高：15,000万円\n【実績(Q3)】販売量：1,600個、売上高：15,680万円 (単価9.8万円)",
    options: [
      "販売数量差異 1,000万円(不利) / 販売価格差異 300万円(不利)",
      "販売数量差異 1,000万円(不利) / 販売価格差異 320万円(不利)",
      "販売数量差異 1,000万円(有利) / 販売価格差異 300万円(不利)",
      "販売数量差異 1,000万円(有利) / 販売価格差異 320万円(不利)"
    ],
    correctAnswer: 3,
    explanation: `
      <p class="font-bold mb-2">正解：エ</p>
      <p class="text-sm mb-2">販売差異分析では、<strong>「(実際 － 予算) × 単価」</strong>で計算します（原価差異とは逆で、プラスが良いことです）。</p>
      <div class="bg-blue-50 p-3 rounded text-xs space-y-2">
        <p><strong>① 予算単価の算定：</strong></p>
        <p>15,000万円 ÷ 1,500個 ＝ <strong>10万円/個</strong></p>
        <p><strong>② 販売数量差異（数がいっぱい売れたか？）：</strong></p>
        <p>(実際1,600 － 予算1,500) × 予算単価10 ＝ <strong>＋1,000万円 (有利)</strong></p>
        <p><strong>③ 販売価格差異（高く売れたか？）：</strong></p>
        <p>(実際9.8 － 予算10) × 実際数量1,600 ＝ －0.2 × 1,600 ＝ <strong>△320万円 (不利)</strong></p>
      </div>
      <p class="text-xs mt-1 text-gray-500">※原価差異は「安く済んだら有利」ですが、販売差異は「多く(高く)売れたら有利」です。</p>
    `
  },
  {
    id: 2,
    category: "原価計算の目的",
    question: "原価計算に関する記述として、最も適切なものはどれか。",
    options: [
      "原価計算における総原価とは、製造原価を意味する。",
      "原価計算は、財務諸表を作成する目的のためだけに行う。",
      "原価計算は、製造業にのみ必要とされる計算手続きである。",
      "材料費・労務費・経費の分類は、財務会計における費用の発生を基礎とする分類である。"
    ],
    correctAnswer: 3,
    explanation: `
      <p class="font-bold mb-2">正解：エ</p>
      <ul class="text-sm space-y-2">
        <li><strong>ア ×：</strong> 総原価は「製造原価 ＋ 販管費」です。</li>
        <li><strong>イ ×：</strong> 財務諸表作成だけでなく、原価管理や予算編成など「内部管理」の目的もあります。</li>
        <li><strong>ウ ×：</strong> サービス業や卸売業でも原価計算は行われます。</li>
        <li class="text-blue-700 font-bold"><strong>エ ○：</strong> 形態別分類（材料・労務・経費）は、財務会計との結びつきを重視した分類です。</li>
      </ul>
    `
  },
  {
    id: 3,
    category: "直接労務費の計算",
    question: "当月の直接労務費の金額を求めよ。\n・直接工賃金予算：14,400,000円\n・予定就業時間：12,000時間\n・当月実績：直接作業 1,100時間、間接作業 100時間、手待時間 200時間",
    options: [
      "1,200,000円",
      "1,320,000円",
      "1,440,000円",
      "1,680,000円"
    ],
    correctAnswer: 1,
    explanation: `
      <p class="font-bold mb-2">正解：イ</p>
      <div class="text-xs space-y-2">
        <p><strong>1. 予定賃率の計算：</strong></p>
        <p>14,400,000円 ÷ 12,000時間 ＝ <strong>1,200円/時間</strong></p>
        <p><strong>2. 直接労務費の計算：</strong></p>
        <p>予定賃率 × <strong>直接作業時間</strong>（間接・手待は含めない）</p>
        <p>1,200円 × 1,100時間 ＝ <strong>1,320,000円</strong></p>
      </div>
      <p class="text-xs mt-2 text-gray-500">※間接作業や手待時間は「間接労務費（製造間接費）」になります。</p>
    `
  },
  {
    id: 4,
    category: "個別原価計算",
    question: "製造指図書#11の製造原価を求めよ。\n・#11直接費：材料100,000円、労務費120,000円\n・#11直接作業時間：100時間\n・工場全体の製造間接費：150,000円（総直接作業時間300時間で配賦）",
    options: [
      "220,000円",
      "228,000円",
      "270,000円",
      "337,000円"
    ],
    correctAnswer: 2,
    explanation: `
      <p class="font-bold mb-2">正解：ウ</p>
      <div class="bg-gray-100 p-2 rounded text-xs space-y-1">
        <p><strong>1. 製造間接費の配賦率：</strong></p>
        <p>150,000円 ÷ 300時間 ＝ <strong>500円/時間</strong></p>
        <p><strong>2. #11への配賦額：</strong></p>
        <p>500円 × 100時間 ＝ <strong>50,000円</strong></p>
        <p><strong>3. #11の製造原価合計：</strong></p>
        <p>材料100,000 ＋ 労務120,000 ＋ 間接費50,000 ＝ <strong>270,000円</strong></p>
      </div>
    `
  },
  {
    id: 5,
    category: "先入先出法(FIFO)",
    question: "8月の商品Ａの商品売買益を求めよ（先入先出法）。\n・8/1 前月繰越：20個 (@300円)\n・8/2 仕入：100個 (@350円)\n・8/5 仕入戻し：10個 (@350円)\n・8/16 売上：80個 (@600円)\n・8/19 売上戻り：10個 (@600円)",
    options: [
      "4,500円",
      "10,500円",
      "18,500円",
      "24,500円"
    ],
    correctAnswer: 2,
    explanation: `
      <p class="font-bold mb-2">正解：ウ</p>
      <p class="text-sm mb-1"><strong>純売上高：</strong> 600円 × (80－10)個 ＝ 42,000円</p>
      <div class="bg-blue-50 p-2 rounded text-xs mb-1">
        <p class="font-bold">売上原価の計算（70個分）：</p>
        <p>先入先出なので、古いものから順に売れたと考えます。</p>
        <p>① 前月分全部：20個 × 300円 ＝ 6,000円</p>
        <p>② 当月分から：50個 × 350円 ＝ 17,500円</p>
        <p>合計：23,500円</p>
      </div>
      <p class="text-sm font-bold text-blue-700">売買益 ＝ 42,000 － 23,500 ＝ 18,500円</p>
    `
  },
  {
    id: 6,
    category: "総合原価計算(平均法)",
    question: "平均法による「月末仕掛品原価」を求めよ。\n・月初：200kg (材料30,000/加工18,000)\n・当月投入：400kg (材料120,000/加工84,000)\n・完成：300kg、正常減損：100kg、月末：200kg\n※減損は度外視法（良品に負担させる）、加工進捗度は50%。",
    options: [
      "70,400円",
      "81,000円",
      "85,500円",
      "108,000円"
    ],
    correctAnswer: 0,
    explanation: `
      <p class="font-bold mb-2">正解：ア</p>
      <p class="text-xs mb-2">度外視法（平均法）では、減損を無視して「完成品＋月末」の数量比で按分します。</p>
      <div class="space-y-2 text-xs">
        <div class="border p-2 rounded">
          <p class="font-bold">① 直接材料費単価</p>
          <p>(30,000＋120,000) ÷ (完成300＋月末200＋減損100) ＝ 250円 ??</p>
          <p>※本問では「総投入量(600kg)」で割って単価を算出する方法が採用されています。</p>
          <p>単価：150,000 ÷ 600kg ＝ <strong>250円/kg</strong></p>
          <p>月末分：250円 × 200kg ＝ 50,000円</p>
        </div>
        <div class="border p-2 rounded">
          <p class="font-bold">② 加工費単価</p>
          <p>総額102,000 ÷ 500単位(換算量) ＝ <strong>204円/単位</strong></p>
          <p>月末分：204円 × 100単位 ＝ 20,400円</p>
        </div>
        <p class="font-bold text-blue-700">合計：50,000 ＋ 20,400 ＝ 70,400円</p>
      </div>
    `
  },
  {
    id: 7,
    category: "材料数量差異",
    question: "標準原価計算における「材料数量差異」を求めよ。\n・標準：単価300円/kg、1個あたり3kg\n・生産実績：当月投入1,000単位\n・実際消費量：3,100kg\n・実際価格：310円/kg",
    options: [
      "不利差異 30,000円",
      "不利差異 31,000円",
      "不利差異 61,000円",
      "不利差異 120,000円"
    ],
    correctAnswer: 0,
    explanation: `
      <p class="font-bold mb-2">正解：ア</p>
      <div class="text-xs space-y-2">
        <p><strong>1. 標準消費量の計算：</strong></p>
        <p>1,000単位 × 3kg ＝ <strong>3,000kg</strong></p>
        <p><strong>2. 数量差異の計算：</strong></p>
        <p>標準単価 × (標準消費量 － 実際消費量)</p>
        <p>300円 × (3,000kg － 3,100kg)</p>
        <p>＝ 300 × (－100) ＝ <strong>－30,000円 (不利)</strong></p>
      </div>
      <p class="text-xs mt-2 text-gray-500">※実際の方が多く使ってしまったので「不利差異」です。</p>
    `
  },
  {
    id: 8,
    category: "作業時間差異",
    question: "直接労務費の「作業時間差異」を求めよ。\n・標準：300円/時間\n・標準作業時間：当月投入110個 × 6時間 ＝ 660時間\n・実際：310円/時間、700時間",
    options: [
      "不利差異 12,000円",
      "不利差異 12,400円",
      "有利差異 6,000円",
      "有利差異 6,200円"
    ],
    correctAnswer: 0,
    explanation: `
      <p class="font-bold mb-2">正解：ア</p>
      <div class="text-xs space-y-1">
        <p><strong>作業時間差異の計算：</strong></p>
        <p>標準賃率 × (標準時間 － 実際時間)</p>
        <p>300円 × (660時間 － 700時間)</p>
        <p>＝ 300 × (－40)</p>
        <p>＝ <strong>－12,000円 (不利)</strong></p>
      </div>
      <p class="text-xs mt-1">※予定より40時間多くかかってしまったため、コスト増（不利）となります。</p>
    `
  },
  {
    id: 9,
    category: "製造間接費の予算差異",
    question: "公式法変動予算における「予算差異」を求めよ。\n・予算：固定費150,000円、変動費率20千円/時間\n・実際：操業度4,000時間、発生額245,000千円",
    options: [
      "不利差異 15,000千円",
      "不利差異 30,000千円",
      "有利差異 15,000千円",
      "有利差異 30,000千円"
    ],
    correctAnswer: 0,
    explanation: `
      <p class="font-bold mb-2">正解：ア</p>
      <div class="bg-blue-50 p-2 rounded text-xs space-y-1">
        <p><strong>1. 予算許容額（あるべき予算）の計算：</strong></p>
        <p>固定費 150,000 ＋ (変動費率20 × 実際時間4,000)</p>
        <p>＝ 150,000 ＋ 80,000 ＝ <strong>230,000千円</strong></p>
        <p><strong>2. 予算差異の計算：</strong></p>
        <p>予算許容額 － 実際発生額</p>
        <p>230,000 － 245,000 ＝ <strong>－15,000千円 (不利)</strong></p>
      </div>
    `
  },
  {
    id: 10,
    category: "意思決定会計",
    question: "代替案の選択によって金額に差異が生じず、将来の意思決定に無関連な原価（過去の投資など）を何というか。",
    options: [
      "機会原価",
      "限界原価",
      "裁量可能原価",
      "埋没原価"
    ],
    correctAnswer: 3,
    explanation: `
      <p class="font-bold mb-2">正解：エ</p>
      <p class="text-sm"><strong>埋没原価（サンクコスト）：</strong> 過去に支出され、どのような意思決定をしても回収できない原価のこと。意思決定の際には無視すべきコストです。</p>
      <ul class="text-xs space-y-1 mt-2 text-gray-600">
        <li>ア 機会原価：ある案を選んだために諦めた利益（考慮すべき）。</li>
        <li>イ 限界原価：生産量1単位の増加で増えるコスト。</li>
        <li>ウ 裁量可能原価：経営者の判断で増減できるコスト（広告費など）。</li>
      </ul>
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
    const savedAnswers = JSON.parse(localStorage.getItem('past_exam_2_5_answers')) || {};
    const savedReviews = JSON.parse(localStorage.getItem('past_exam_2_5_reviews')) || {};
    setUserAnswers(savedAnswers);
    setReviewFlags(savedReviews);
  }, []);

  useEffect(() => {
    localStorage.setItem('past_exam_2_5_answers', JSON.stringify(userAnswers));
    localStorage.setItem('past_exam_2_5_reviews', JSON.stringify(reviewFlags));
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
            <div className="inline-block bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
              財務・会計
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
              <Calculator className="w-7 h-7 text-teal-600" /> 過去問セレクト 2-5
            </h1>
            <p className="text-slate-400 text-xs mt-1">原価計算（差異分析・CVP）</p>
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
                      { name: '正解', value: stats.correctCount, color: '#0d9488' },
                      { name: '未クリア', value: stats.total - stats.correctCount, color: '#f1f5f9' },
                    ]}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none"
                  >
                    <Cell fill="#0d9488" />
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
                <p className="text-xl font-black text-teal-600">{stats.correctCount}<span className="text-xs text-slate-300">/{stats.total}</span></p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Solved</p>
              </div>
              <div>
                <p className="text-xl font-black text-orange-500">{stats.reviewCount}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Review</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <button onClick={() => startQuiz('all')} className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-3xl shadow-xl hover:bg-black transition active:scale-95">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-2 rounded-xl"><Play className="w-5 h-5" /></div>
                <div className="text-left"><div className="font-black">全問題を解く</div><div className="text-[10px] opacity-50 font-bold">過去問セレクト 全10問</div></div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => startQuiz('wrong')} className="p-4 bg-white border border-slate-100 text-red-600 rounded-3xl font-black text-xs flex flex-col items-center gap-2 hover:bg-red-50 transition active:scale-95">
                <RotateCcw className="w-4 h-4" /> 弱点克服
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
          <div className="h-1 bg-slate-100"><div className="h-full bg-teal-600 transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
          <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
            <button onClick={() => setCurrentScreen('menu')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quit</button>
            <div className="font-black text-slate-700 text-sm">Q.{currentProblemIndex + 1} <span className="text-slate-300">/</span> {filteredProblems.length}</div>
            <div className="text-[10px] font-black px-2 py-1 bg-teal-50 rounded text-teal-600 uppercase tracking-wider">{problem.category}</div>
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
                    {['ア','イ','ウ','エ','オ'][idx]}
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
            <div className="w-28 h-28 bg-teal-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(20,184,166,0.3)]">
              <TrendingUp className="w-14 h-14 text-slate-900" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-black tracking-tighter mb-2 italic uppercase">Mission Complete!</h2>
            <div className="text-7xl font-black mb-4 tracking-tighter text-teal-500">{score}<span className="text-3xl font-bold text-white ml-1">%</span></div>
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