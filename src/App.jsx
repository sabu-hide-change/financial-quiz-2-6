// npm install lucide-react recharts firebase
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { Check, X, Home, ChevronRight, RefreshCw, BookOpen, AlertTriangle, List, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const APP_ID = "QuizApp_ManagementAnalysis_001";

// --- Quiz Questions Data ---
const QUESTIONS = [
  {
    id: 1,
    title: "問題 1 経営分析の概要",
    category: "経営分析の概要",
    question: "経営分析の種類と指標に関する説明として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "企業の収益を獲得する能力を分析するための手法に収益性分析がある。総資本経常利益率、売上高総利益率などの指標がある。" },
      { key: "イ", text: "企業の支払い能力や、財務面の安全性を分析するための手法に安全性分析がある。流動比率、当座比率などの指標がある。" },
      { key: "ウ", text: "企業の生産要素に対するアウトプットの効率を分析するための手法に生産性分析がある。労働生産性、固定長期適合率などの指標がある。" },
      { key: "エ", text: "企業の売上高、総資産などが、どれくらい成長しているかを分析する手法に成長性分析がある。売上高成長率、総資産成長率などの指標がある。" }
    ],
    answer: "ウ",
    explanation: "「労働生産性」は生産性分析になりますが、「固定長期適合率」は安全性分析にあたるため不適切です。安全性分析は「短期安全性」「長期安全性」「資本構成」の分析があり、固定長期適合率は長期安全性の指標です。",
    tableData: [
      { type: "収益性分析", desc: "企業が利益を上げる能力を分析する", metrics: "総資本経常利益率、売上高総利益率など" },
      { type: "安全性分析", desc: "企業の支払能力や倒産リスクを分析する", metrics: "流動比率、当座比率、固定長期適合率など" },
      { type: "生産性分析", desc: "経営資源（インプット）に対する成果（アウトプット）の効率を分析する", metrics: "労働生産性など" },
      { type: "成長性分析", desc: "企業が時系列でどれくらい成長したかを分析する", metrics: "売上高成長率、総資産成長率など" }
    ]
  },
  {
    id: 2,
    title: "問題 2 収益性分析",
    category: "収益性分析",
    question: "収益性分析に関する次の記述のうち、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "事業利益とは、「営業利益」「受取利息・配当金」「有価証券利息」を足しあわせた額である。" },
      { key: "イ", text: "経営資本とは、「総資産」から「建設仮勘定」「投資その他の資産」「繰延資産」を引いた額である。" },
      { key: "ウ", text: "貸借対照表だけで資本利益率を計算することができる。" },
      { key: "エ", text: "資本利益率を高めるためには、売上高利益率を高めるか、資本回転率を高める必要がある。" }
    ],
    answer: "ウ",
    explanation: "資本利益率の計算において、分子の「利益」は損益計算書(P/L)から、分母の「資本」は貸借対照表(B/S)から取得します。そのため、貸借対照表だけで算出することはできません。資本利益率は「売上高利益率 × 資本回転率」に分解できます。",
    formulas: [
      { name: "資本利益率", calc: "利益 ÷ 資本 × 100 (%)" },
      { name: "事業利益", calc: "営業利益 ＋ 受取利息・配当金 ＋ 有価証券利息" },
      { name: "経営資本", calc: "総資産 － 建設仮勘定 － 投資その他の資産 － 繰延資産" }
    ]
  },
  {
    id: 3,
    title: "問題 3 収益性分析 資本利益率",
    category: "収益性分析",
    question: "Y社の貸借対照表および損益計算書に基づいて、自己資本利益率、経営資本営業利益率、総資本事業利益率の組み合わせとして、最も適切なものを選べ。なお計算結果は、小数点第1位を切り捨てること。",
    options: [
      { key: "ア", text: "自己資本利益率 66％、経営資本営業利益率 50％、総資本事業利益率 30％" },
      { key: "イ", text: "自己資本利益率 66％、経営資本営業利益率 31％、総資本事業利益率 33％" },
      { key: "ウ", text: "自己資本利益率 39％、経営資本営業利益率 31％、総資本事業利益率 30％" },
      { key: "エ", text: "自己資本利益率 39％、経営資本営業利益率 31％、総資本事業利益率 33％" }
    ],
    answer: "エ",
    explanation: "各比率の計算は以下の通りです：\n1. 自己資本利益率(ROE) ＝ 当期純利益(198) ÷ 自己資本(資本金300＋資本剰余金100＋利益剰余金100) × 100 ＝ 39.6% → 切り捨て39%\n2. 経営資本営業利益率 ＝ 営業利益(300) ÷ 経営資本(総資産1000－投資有価証券50) × 100 ＝ 31.57% → 切り捨て31%\n3. 総資本事業利益率 ＝ 事業利益(営業利益300＋受取利息30) ÷ 総資本(1000) × 100 ＝ 33%",
    bsTable: {
      title: "貸借対照表（単位：百万円）",
      left: [
        { name: "現金及び預金", val: 208 }, { name: "受取手形", val: 50 }, { name: "  貸倒引当金", val: -2 },
        { name: "売掛金", val: 150 }, { name: "  貸倒引当金", val: -6 }, { name: "棚卸資産", val: 200 },
        { name: "土地", val: 150 }, { name: "建物・機械設備等", val: 250 }, { name: "減価償却累計額", val: -50 },
        { name: "投資有価証券", val: 50 }, { name: "資産合計", val: 1000 }
      ],
      right: [
        { name: "支払手形", val: 100 }, { name: "買掛金", val: 150 }, { name: "短期借入金", val: 50 },
        { name: "長期借入金", val: 100 }, { name: "退職給付引当金", val: 100 }, { name: "資本金", val: 300 },
        { name: "資本剰余金", val: 100 }, { name: "利益剰余金", val: 100 }, { name: "", val: "" },
        { name: "", val: "" }, { name: "負債・純資産合計", val: 1000 }
      ]
    },
    plTable: [
      { name: "売上高", val: 2000 }, { name: "売上原価", val: 1200 }, { name: "売上総利益", val: 800 },
      { name: "販売費・一般管理費", val: 500 }, { name: "営業利益", val: 300 }, { name: "受取利息", val: 30 },
      { name: "支払利息", val: 10 }, { name: "経常利益", val: 320 }, { name: "特別利益", val: 10 },
      { name: "特別損失", val: 0 }, { name: "税引前当期純利益", val: 330 }, { name: "法人税等", val: 132 },
      { name: "当期純利益", val: 198 }
    ]
  },
  {
    id: 4,
    title: "問題 4 収益性分析 売上高利益率",
    category: "収益性分析",
    question: "A社に関する資料に基づいて、売上高利益率に関する記述として最も適切なものはどれか。",
    options: [
      { key: "ア", text: "A社の売上高総利益率は35.0％である。" },
      { key: "イ", text: "A社の売上高営業利益率は13.5％である。" },
      { key: "ウ", text: "A社の売上高経常利益率は13.5％である。" },
      { key: "エ", text: "A社の売上高当期純利益率は13.75％である。" }
    ],
    answer: "ウ",
    explanation: "資料より販売費・一般管理費(給料400+広告費50+減価償却費200+旅費50=700)を計算。売上総利益は 4,000 - 2,800 = 1,200 (30.0%)。営業利益は 1,200 - 700 = 500 (12.5%)。経常利益は 500 + 受取利息50 - 支払利息10 = 540。売上高経常利益率は 540 ÷ 4,000 × 100 ＝ 13.5％ となり、ウが適切です。当期純利益は 540 + 特別利益10 - 法人税等220 = 330 (8.25%)です。",
    dataValues: [
      { name: "売上高", val: "4,000" }, { name: "減価償却費", val: "200" },
      { name: "受取利息", val: "50" }, { name: "旅費交通費", val: "50" },
      { name: "支払利息", val: "10" }, { name: "固定資産売却益", val: "10" },
      { name: "給料", val: "400" }, { name: "売上原価", val: "2,800" },
      { name: "広告宣伝費", val: "50" }, { name: "法人税等", val: "220" }
    ]
  },
  {
    id: 5,
    title: "問題 5 収益性分析 効率性分析",
    category: "収益性分析",
    question: "各指標が良好になる場合の空欄A～Dに入る記号(↑:上昇、↓:低下)の組み合わせとして、最も適切なものを選べ。",
    options: [
      { key: "ア", text: "A：↓、B：↑、C：↓、D：↓" },
      { key: "イ", text: "A：↑、B：↑、C：↓、D：↓" },
      { key: "ウ", text: "A：↓、B：↑、C：↑、D：↑" },
      { key: "エ", text: "A：↑、B：↑、C：↑、D：↑" }
    ],
    answer: "イ",
    explanation: "「回転率」は数値が高いほど資産を効率活用して売上に貢献しているため良好（↑）。よって総資本回転率(A)・固定資産回転率(B)は↑。「回転期間」は資産が1回転する期間を示し、短い（低い）ほど効率的なため良好（↓）。よって売上債権回転期間(C)・棚卸資産回転期間(D)は↓です。",
    matrix: [
      { metric: "総資本回転率", key: "A", ans: "↑" },
      { metric: "固定資産回転率", key: "B", ans: "↑" },
      { metric: "売上債権回転期間", key: "C", ans: "↓" },
      { metric: "棚卸資産回転率", key: "—", ans: "↑ (固定提示)" },
      { metric: "棚卸資産回転期間", key: "D", ans: "↓" }
    ]
  },
  {
    id: 6,
    title: "問題 6 安全性分析1",
    category: "安全性分析",
    question: "Y社の財務資料に基づいて、固定長期適合率、自己資本比率、負債比率の組み合わせとして、最も適切なものを選べ。なお計算結果は小数点第1位を切り捨てること。",
    options: [
      { key: "ア", text: "固定長期適合率 54％、自己資本比率 41％、負債比率 122％" },
      { key: "イ", text: "固定長期適合率 54％、自己資本比率 240％、負債比率 122％" },
      { key: "ウ", text: "固定長期適合率 46％、自己資本比率 240％、負債比率 140％" },
      { key: "エ", text: "固定長期適合率 46％、自己資本比率 41％、負債比率 140％" }
    ],
    answer: "エ",
    explanation: "1. 固定長期適合率 ＝ 固定資産(190+110=300) ÷ (固定負債100 ＋ 自己資本[300+150+90=540]) × 100 ＝ 300 ÷ 640 ＝ 46.875% → 46%\n2. 自己資本比率 ＝ 自己資本(540) ÷ 総資本(1,300) × 100 ＝ 41.53% → 41%\n3. 負債比率 ＝ 負債(250+210+200+100=760) ÷ 自己資本(540) × 100 ＝ 140.74% → 140%",
    bsData: {
      left: [
        { name: "現金及び預金", val: 230 }, { name: "受取手形", val: 100 }, { name: "売掛金", val: 320 },
        { name: "有価証券", val: 200 }, { name: "棚卸資産", val: 150 }, { name: "有形固定資産", val: 190 },
        { name: "無形固定資産", val: 110 }, { name: "資産合計", val: 1300 }
      ],
      right: [
        { name: "支払手形", val: 250 }, { name: "買掛金", val: 210 }, { name: "短期借入金", val: 200 },
        { name: "長期借入金", val: 100 }, { name: "資本金", val: 300 }, { name: "資本剰余金", val: 150 },
        { name: "利益剰余金", val: 90 }, { name: "負債・純資産合計", val: 1300 }
      ]
    }
  },
  {
    id: 7,
    title: "問題 7 安全性分析2",
    category: "安全性分析",
    question: "流動比率、当座比率、固定比率、固定長期適合率について、A社とB社のどちらが良好であるかの組み合わせとして最も適切なものはどれか。(A:A社が良好、B:B社が良好)",
    options: [
      { key: "ア", text: "流動比率：B、当座比率：A、固定比率：B、固定長期適合率：A" },
      { key: "イ", text: "流動比率：A、当座比率：B、固定比率：A、固定長期適合率：B" },
      { key: "ウ", text: "流動比率：B、当座比率：B、固定比率：A、固定長期適合率：A" },
      { key: "エ", text: "流動比率：B、当座比率：B、固定比率：B、固定長期適合率：A" }
    ],
    answer: "ア",
    explanation: "各指標の算出結果：\n・流動比率 (大が良い): A社=140%, B社=143% → B良好\n・当座比率 (大が良い): A社=130%, B社=129% → A良好\n・固定比率 (小が良い): A社=100%, B社=94% → B良好\n・固定長期適合率 (小が良い): A社=63%, B社=71% → A良好",
    comparisonData: [
      { metric: "流動比率", a: "140.00%", b: "142.86%", better: "B社が良好" },
      { metric: "当座比率", a: "130.00%", b: "128.57%", better: "A社が良好" },
      { metric: "固定比率", a: "100.00%", b: "93.75%", better: "B社が良好" },
      { metric: "固定長期適合率", a: "62.96%", b: "71.43%", better: "A社が良好" }
    ]
  },
  {
    id: 8,
    title: "問題 8 生産性分析 労働生産性",
    category: "生産性分析",
    question: "労働生産性に関する説明として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "労働生産性分析では、投入したインプットに対するアウトプットの効率を分析する。インプットには「付加価値」を使用する。" },
      { key: "イ", text: "「付加価値」の算出方法は、経常利益に人件費、賃借料、外注加工費、間接材料費等を足しあわせたものである。" },
      { key: "ウ", text: "「労働生産性」は「付加価値率」×「従業員1人あたり売上高」で算出することができる。" },
      { key: "エ", text: "「付加価値率」は「付加価値」に占める「売上高」の割合である。" }
    ],
    answer: "ウ",
    explanation: "労働生産性は「付加価値 ÷ 従業員数」であり、「付加価値/売上高 (付加価値率) × 売上高/従業員数 (1人あたり売上高)」に分解できます。アは付加価値がアウトプットのため誤り。イは外注加工費・間接材料費は含まないため誤り。エは売上高に占める付加価値の割合のため逆であり誤りです。",
    formulaDetails: "付加価値 ＝ 経常利益 ＋ 人件費 ＋ 賃借料 ＋ 純金利費用 ＋ 減価償却費 ＋ 租税公課"
  },
  {
    id: 9,
    title: "問題 9 生産性分析 労働生産性の分解",
    category: "生産性分析",
    question: "次の資料(労働装備率: 20,000,000円、付加価値額: 35,000,000円、有形固定資産: 20,000,000円)に基づき、労働生産性の数値として最も適切なものを選べ。",
    options: [
      { key: "ア", text: "25,000,000" },
      { key: "イ", text: "30,000,000" },
      { key: "ウ", text: "35,000,000" },
      { key: "エ", text: "40,000,000" }
    ],
    answer: "ウ",
    explanation: "労働生産性は「労働装備率 × 設備生産性」で求められます。設備生産性 ＝ 付加価値額(35,000,000) ÷ 有形固定資産(20,000,000) ＝ 1.75。よって、労働生産性 ＝ 20,000,000 × 1.75 ＝ 35,000,000 円となります。",
    breakdown: [
      { step: "1. 設備生産性の計算", formula: "付加価値額 ÷ 有形固定資産", result: "35,000,000 ÷ 20,000,000 = 1.75" },
      { step: "2. 労働生産性の計算", formula: "労働装備率 × 設備生産性", result: "20,000,000 × 1.75 = 35,000,000" }
    ]
  },
  {
    id: 10,
    title: "問題 10 損益分岐点(CVP)分析の基本知識",
    category: "CVP分析",
    question: "費用分解や損益分岐点に関する説明として、適切なものはどれか。",
    options: [
      { key: "ア", text: "変動費は営業量の増加に比例して減少する費用であり、固定費は、営業量の増減に関係なく固定的に発生する費用である。" },
      { key: "イ", text: "「勘定科目法」とは、固定費と変動費を分解する手法のひとつであり、経理上の勘定科目別に固定費と変動費の分類を行う手法のことである。" },
      { key: "ウ", text: "「高低点法」とは、目的変数の測定値と推定値の誤差の二乗が最小となるように、回帰式を求める方法である。" },
      { key: "エ", text: "損益分岐点とは、販売量がちょうど0になるときの利益のことをさす。" }
    ],
    answer: "イ",
    explanation: "勘定科目法は科目ごとに変動・固定費を分ける手法で、記述通り適切です。アは変動費は比例して「増加」するため誤り。ウの記述は「最小二乗法」の内容であるため誤り。エは「利益がちょうど0になるときの販売量（売上高）」を指すため誤りです。",
    costType: [
      { name: "変動費", behavior: "営業量の増加に比例して増加", examples: "材料費、運送費、販売促進費" },
      { name: "固定費", behavior: "営業量の増減に関係なく一定に発生", examples: "支払家賃、給料、支払利息、火災保険料" }
    ]
  },
  {
    id: 11,
    title: "問題 11 損益分岐点(CVP)分析",
    category: "CVP分析",
    question: "前事業年度の実績(売上高:120,000万円、変動費:72,000万円、固定費:30,000万円)に基づく、損益分岐点売上高(A)万円と安全余裕率(B)％の組み合わせとして適切なものを選べ。",
    options: [
      { key: "ア", text: "A：50,000、B：58.3" },
      { key: "イ", text: "A：50,000、B：37.5" },
      { key: "ウ", text: "A：75,000、B：58.3" },
      { key: "エ", text: "A：75,000、B：37.5" }
    ],
    answer: "エ",
    explanation: "1. 変動費率 ＝ 72,000 ÷ 120,000 ＝ 0.6\n2. 損益分岐点売上高 ＝ 固定費(30,000) ÷ (1 － 変動費率0.6) ＝ 75,000 万円\n3. 安全余裕率 ＝ (実際売上120,000 － 損益分岐点売上75,000) ÷ 実際売上120,000 × 100 ＝ 37.5%",
    calcTable: [
      { item: "売上高", value: "120,000 万円" },
      { item: "変動費 (率: 60%)", value: "72,000 万円" },
      { item: "固定費", value: "30,000 万円" },
      { item: "営業利益", value: "18,000 万円" }
    ]
  },
  {
    id: 12,
    title: "問題 12 損益分岐点(CVP)分析 目標売上高の計算",
    category: "CVP分析",
    question: "当期の経常利益目標55,000千円を達成するために必要な売上高として、最も適切なものを選べ。なお営業外損益は固定費、売上原価はすべて変動費とし、販管費のうち固定費は20,000千円とする。",
    options: [
      { key: "ア", text: "255,000千円" },
      { key: "イ", text: "350,000千円" },
      { key: "ウ", text: "400,000千円" },
      { key: "エ", text: "450,000千円" }
    ],
    answer: "イ",
    explanation: "1. 固定費の整理: 販管費固定分20,000 ＋ (営業外費用50,000 － 営業外収益20,000) ＝ 50,000千円\n2. 変動費の整理: 売上原価120,000 ＋ 販管費変動分(40,000－20,000) ＝ 140,000千円\n3. 変動費率 ＝ 140,000 ÷ 売上高200,000 ＝ 0.7\n4. 目標売上高 ＝ (固定費50,000 ＋ 目標利益55,000) ÷ (1 － 0.7) ＝ 105,000 ÷ 0.3 ＝ 350,000 千円",
    plSummary: [
      { name: "売上高", val: 200000 }, { name: "売上原価 (すべて変動)", val: 120000 },
      { name: "販売費及び一般管理費", val: 40000 }, { name: "営業利益", val: 40000 },
      { name: "営業外収益", val: 20000 }, { name: "営業外費用", val: 50000 },
      { name: "経常利益", val: 10000 }
    ]
  },
  {
    id: 13,
    title: "問題 13 セグメント別損益分析",
    category: "セグメント別損益",
    question: "直接原価計算に基づくセグメント損益分析の空欄A、B、Cに入る正しい語句の組み合わせを選べ。\n「売上高 － 変動売上原価 ＝ A。A － 変動販売費 ＝ B。B － 個別固定費 ＝ C」",
    options: [
      { key: "ア", text: "A：変動製造マージン、B：限界利益、C：貢献利益" },
      { key: "イ", text: "A：変動製造マージン、B：貢献利益、C：限界利益" },
      { key: "ウ", text: "A：製造間接費、B：限界利益、C：営業利益" },
      { key: "エ", text: "A：製造間接費、B：貢献利益、C：営業利益" }
    ],
    answer: "ア",
    explanation: "売上高から製造段階の変動費を引いたものが「変動製造マージン(A)」、そこから販売費の変動費を引いたものが「限界利益(B)」、さらに各セグメントに直課できる「個別固定費」を差し引いたものが「貢献利益(C)」となります。貢献利益から全社共通固定費を引くと営業利益になります。",
    segmentFlow: [
      "売上高",
      "  [マイナス] 変動売上原価",
      "＝ 変動製造マージン (A)",
      "  [マイナス] 変動販売費",
      "＝ 限界利益 (B)",
      "  [マイナス] 個別固定費",
      "＝ 貢献利益 (C)",
      "  [マイナス] 共通固定費",
      "＝ 営業利益"
    ]
  }
];

export default function App() {
  // --- States ---
  const [userId, setUserId] = useState("");
  const [isKeyAuthenticated, setIsKeyAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("login"); // login, menu, quiz, history, dashboard

  // Quiz States
  const [selectedMode, setSelectedMode] = useState("all"); // all, wrong, review
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Cloud Sync Syncing State
  const [userRecords, setUserRecords] = useState({}); // { qId: { isCorrect: bool, isReview: bool } }
  const [hasResumeData, setHasResumeData] = useState(null); // { index, mode }

  // --- Authentication ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setIsLoading(true);
    console.log(`[Auth] Attempting anonymous sign-in for User ID: ${userId}`);
    try {
      await signInAnonymously(auth);
      console.log("[Auth] Signed in anonymously successfully.");
      
      // Fetch user data from Firestore
      const userDocRef = doc(db, APP_ID, userId.trim());
      const userDocSnap = await getDoc(userDocRef);

      let records = {};
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        records = data.records || {};
        setUserRecords(records);
        console.log("[Firestore] User records loaded:", records);

        if (data.progressIndex !== undefined && data.progressIndex !== null && data.progressIndex < QUESTIONS.length) {
          setHasResumeData({
            index: data.progressIndex,
            mode: data.progressMode || "all"
          });
          console.log(`[Firestore] Found unfinished progress at index ${data.progressIndex} inside mode ${data.progressMode}`);
        }
      } else {
        console.log("[Firestore] No existing user doc found. Creating new data framework.");
        await setDoc(userDocRef, { records: {}, progressIndex: 0, progressMode: "all" });
      }

      setIsKeyAuthenticated(true);
      setCurrentView("menu");
    } catch (error) {
      console.error("[Error] Critical failure in auth or loading sequence:", error);
      alert("通信エラーが発生しました。設定項目を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Quiz Core Logic ---
  const startQuiz = (mode, resumeIndex = null) => {
    console.log(`[Quiz] Initiating Quiz Mode: ${mode}`);
    let list = [...QUESTIONS];
    
    if (mode === "wrong") {
      list = QUESTIONS.filter(q => userRecords[q.id] && !userRecords[q.id].isCorrect);
    } else if (mode === "review") {
      list = QUESTIONS.filter(q => userRecords[q.id] && userRecords[q.id].isReview);
    }

    if (list.length === 0) {
      alert("該当する問題がありません。別モードを選択してください。");
      return;
    }

    setFilteredQuestions(list);
    setSelectedMode(mode);
    setCurrentIndex(resumeIndex !== null ? resumeIndex : 0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentView("quiz");
  };

  const handleSelectAnswer = (key) => {
    if (isAnswered) return;
    setSelectedAnswer(key);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || isAnswered) return;

    const currentQuestion = filteredQuestions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    setIsAnswered(true);

    // Update Local and Cloud state
    const currentReviewState = userRecords[currentQuestion.id]?.isReview || false;
    const updatedRecords = {
      ...userRecords,
      [currentQuestion.id]: {
        isCorrect,
        isReview: currentReviewState
      }
    };
    setUserRecords(updatedRecords);

    // Dynamic next calculation index tracking
    const nextIndex = currentIndex + 1;
    const isFinished = nextIndex >= filteredQuestions.length;

    console.log(`[Answer Submit] Q:${currentQuestion.id}, Selected:${selectedAnswer}, Correct:${isCorrect}. Next index state target: ${nextIndex}`);

    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, {
        records: updatedRecords,
        progressIndex: isFinished ? 0 : nextIndex,
        progressMode: selectedMode
      });
      console.log("[Firestore] Answer and progress saved successfully.");
    } catch (e) {
      console.error("[Error] Saving answer data failed:", e);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      console.log("[Quiz] Finished all filtered questions.");
      // Reset cloud state tracker when entirely finished
      handleResetProgress();
      setCurrentView("dashboard");
    }
  };

  const toggleReviewFlag = async (qId) => {
    const existing = userRecords[qId] || { isCorrect: false, isReview: false };
    const updatedRecords = {
      ...userRecords,
      [qId]: {
        ...existing,
        isReview: !existing.isReview
      }
    };
    setUserRecords(updatedRecords);
    console.log(`[Review Toggle] Toggled Review State on Q:${qId} to ${!existing.isReview}`);

    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, { records: updatedRecords });
    } catch (e) {
      console.error("[Error] Failed to toggle review state on server:", e);
    }
  };

  const handleResetProgress = async () => {
    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, { progressIndex: 0, progressMode: "all" });
      setHasResumeData(null);
      console.log("[Firestore] Session context progress tracking index set to zero.");
    } catch (e) {
      console.error("[Error] Failure resetting track progress data states:", e);
    }
  };

  const handleReturnHome = async () => {
    // Ensure accurate persistence of state location upon voluntary navigation exit
    if (currentView === "quiz" && !isAnswered) {
      try {
        const userDocRef = doc(db, APP_ID, userId.trim());
        await updateDoc(userDocRef, {
          progressIndex: currentIndex,
          progressMode: selectedMode
        });
        setHasResumeData({ index: currentIndex, mode: selectedMode });
        console.log(`[Voluntary Exit] Saved intermediate state index ${currentIndex}`);
      } catch (e) {
        console.error(e);
      }
    }
    setCurrentView("menu");
  };

  // --- Calculations for Analytics Dashboard ---
  const getDashboardData = () => {
    const categories = Array.from(new Set(QUESTIONS.map(q => q.category)));
    return categories.map(cat => {
      const related = QUESTIONS.filter(q => q.category === cat);
      const answeredCorrectly = related.filter(q => userRecords[q.id]?.isCorrect).length;
      return {
        name: cat,
        "正解数": answeredCorrectly,
        "総問題数": related.length
      };
    });
  };

  const getTotalStats = () => {
    const totalQuestions = QUESTIONS.length;
    const correctCount = QUESTIONS.filter(q => userRecords[q.id]?.isCorrect).length;
    const reviewCount = QUESTIONS.filter(q => userRecords[q.id]?.isReview).length;
    const remainingCount = totalQuestions - correctCount;

    return { totalQuestions, correctCount, reviewCount, remainingCount };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-indigo-600 animate-pulse text-lg font-semibold">
          <RefreshCw className="animate-spin w-6 h-6" />
          <span>クラウドから学習データを同期しています...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* Top Banner Navigation Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReturnHome}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white font-black tracking-wider text-sm shadow-inner">
              診断士
            </div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              中小企業診断士 スマート問題集2-6 【経営分析】
            </h1>
          </div>
          {isKeyAuthenticated && (
            <div className="flex items-center space-x-3 text-sm">
              <span className="bg-slate-700 px-3 py-1.5 rounded-full text-slate-300 border border-slate-600 font-mono">
                ID: {userId}
              </span>
              <button
                onClick={handleReturnHome}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 p-2 rounded-lg transition-all border border-slate-600"
                title="メニューに戻る"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:py-8">
        
        {/* --- VIEW: Authentication Entry Screen --- */}
        {currentView === "login" && (
          <div className="max-w-md mx-auto my-12 bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="bg-indigo-500/10 text-indigo-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">マルチデバイス同期システム</h2>
              <p className="text-slate-400 text-xs mt-1">
                自由な合言葉を入力してください。PCやスマートフォンで同じ合言葉を入力することで、どこからでもリアルタイムに履歴を同期して学習可能です。
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  同期用ユーザーID / 合言葉
                </label>
                <input
                  type="text"
                  required
                  placeholder="例: my-passcode-2026"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-mono text-center text-lg tracking-widest text-indigo-300"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3 shadow-lg shadow-indigo-600/20 transition-all text-sm active:scale-[0.99]"
              >
                学習システムへ入室
              </button>
            </form>
          </div>
        )}

        {/* --- VIEW: Main Menu Dashboard & Modes Selection --- */}
        {currentView === "menu" && (
          <div className="space-y-6">
            
            {/* Resume Session Banner Modal Area */}
            {hasResumeData && (
              <div className="bg-gradient-to-r from-indigo-950 to-slate-800 border-2 border-indigo-500/50 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">前回の未完セッションを検出しました</h3>
                    <p className="text-sm text-slate-300 mt-0.5">
                      前回はモード <span className="text-indigo-400 font-bold">[{hasResumeData.mode === "all" ? "すべての問題" : hasResumeData.mode === "wrong" ? "前回不正解のみ" : "要復習のみ"}]</span> の <span className="text-indigo-400 font-bold">問題 {hasResumeData.index + 1}</span> まで進んでいます。続きから再開しますか？
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={async () => {
                      await handleResetProgress();
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-medium border border-slate-600 transition-all"
                  >
                    最初からやり直す
                  </button>
                  <button
                    onClick={() => startQuiz(hasResumeData.mode, hasResumeData.index)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-md shadow-indigo-600/20"
                  >
                    <span>続きから再開する</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Stats Grid Summary Widget */}
            {(() => {
              const stats = getTotalStats();
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm text-center">
                    <div className="text-xs font-medium text-slate-400">総問題収録数</div>
                    <div className="text-2xl font-black mt-1 text-slate-100">{stats.totalQuestions} <span className="text-sm font-normal text-slate-500">問</span></div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm text-center">
                    <div className="text-xs font-medium text-slate-400 text-emerald-400">現在の正解マスター数</div>
                    <div className="text-2xl font-black mt-1 text-emerald-400">{stats.correctCount} <span className="text-xs font-normal text-slate-500">/{stats.totalQuestions}</span></div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm text-center">
                    <div className="text-xs font-medium text-slate-400 text-amber-400">要復習マーク数</div>
                    <div className="text-2xl font-black mt-1 text-amber-400">{stats.reviewCount} <span className="text-sm font-normal text-slate-500">問</span></div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm text-center">
                    <div className="text-xs font-medium text-slate-400 text-indigo-400">進捗達成率</div>
                    <div className="text-2xl font-black mt-1 text-indigo-400">
                      {Math.round((stats.correctCount / stats.totalQuestions) * 100) || 0}%
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Selection Mode Router Actions Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              
              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span>すべての問題</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    章全体の全13問を網羅的に学習します。基本的な経営分析の概要から始まり、CVP（損益分岐点）、直接原価計算セグメント分析まで全域を完全収録しています。
                  </p>
                </div>
                <button
                  onClick={() => startQuiz("all")}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10"
                >
                  学習を開始する
                </button>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-amber-400 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    <span>前回不正解の問題のみ</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    現在不正解のステータスになっている弱点問題のみを抽出して再チャレンジします。２次試験対策に不可欠な計算ミス・論点誤認の自動撲滅用。
                  </p>
                </div>
                <button
                  onClick={() => startQuiz("wrong")}
                  className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-600/10"
                >
                  弱点を克服する
                </button>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-rose-400 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                    <span>要復習の問題のみ</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    自身で「要復習」のチェックボックスにマークを入れた問題のみを抽出し徹底反復します。公式の暗記や解法のロジックを再確認する為の個別リスト。
                  </p>
                </div>
                <button
                  onClick={() => startQuiz("review")}
                  className="w-full mt-6 bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-md shadow-rose-600/10"
                >
                  要復習リストへ
                </button>
              </div>

            </div>

            {/* Extended Action Utilities Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentView("history")}
                className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 transition-colors"
              >
                <List className="w-4 h-4 text-indigo-400" />
                <span>問題一覧・個別同期履歴の確認</span>
              </button>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 transition-colors"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>カテゴリ別分析ダッシュボード</span>
              </button>
            </div>

          </div>
        )}

        {/* --- VIEW: Quiz Interactive Sandbox --- */}
        {currentView === "quiz" && filteredQuestions[currentIndex] && (
          (() => {
            const q = filteredQuestions[currentIndex];
            return (
              <div className="space-y-6">
                
                {/* Meta Question Header Progress Tracker */}
                <div className="flex items-center justify-between bg-slate-800 px-4 py-3 rounded-xl border border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-indigo-400 text-xs font-bold uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      {q.category}
                    </span>
                    <h2 className="font-bold text-sm text-slate-200">{q.title}</h2>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    進行度: <span className="text-white font-bold">{currentIndex + 1}</span> / {filteredQuestions.length} 問
                  </div>
                </div>

                {/* Main Question Description Text Arena */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-sm space-y-4">
                  <p className="text-base font-medium leading-relaxed whitespace-pre-wrap text-slate-100">
                    {q.question}
                  </p>

                  {/* Problem Embedded Matrix Reconstruction (Safe Table Tag Render Method) */}
                  {q.bsTable && (
                    <div className="my-6 border border-slate-700 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-700 text-center font-bold py-2 text-slate-200 border-b border-slate-600">
                        {q.bsTable.title}
                      </div>
                      <table className="w-full text-left border-collapse bg-slate-900">
                        <thead>
                          <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400">
                            <th className="p-2 border-r border-slate-700 w-1/2">資産の部</th>
                            <th className="p-2 w-1/2">負債・純資産の部</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: Math.max(q.bsTable.left.length, q.bsTable.right.length) }).map((_, idx) => {
                            const l = q.bsTable.left[idx] || { name: "", val: "" };
                            const r = q.bsTable.right[idx] || { name: "", val: "" };
                            return (
                              <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/20 font-mono">
                                <td className="p-2 border-r border-slate-700 flex justify-between">
                                  <span>{l.name}</span>
                                  <span className="text-indigo-300">{l.val !== "" ? l.val.toLocaleString() : ""}</span>
                                </td>
                                <td className="p-2">
                                  <div className="flex justify-between">
                                    <span>{r.name}</span>
                                    <span className="text-emerald-300">{r.val !== "" ? r.val.toLocaleString() : ""}</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {q.plTable && (
                    <div className="my-6 max-w-md mx-auto border border-slate-700 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-700 text-center font-bold py-2 text-slate-200 border-b border-slate-600">
                        損益計算書（単位：百万円）
                      </div>
                      <table className="w-full text-left border-collapse bg-slate-900 font-mono">
                        <tbody>
                          {q.plTable.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/20 flex justify-between p-2">
                              <td className="text-slate-300">{item.name}</td>
                              <td className="text-indigo-400 font-bold">{item.val.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {q.dataValues && (
                    <div className="my-4 grid grid-cols-2 gap-2 max-w-xl mx-auto text-xs bg-slate-900 p-4 rounded-xl border border-slate-700 font-mono">
                      {q.dataValues.map((d, idx) => (
                        <div key={idx} className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">{d.name}</span>
                          <span className="text-slate-200 font-bold">{d.val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.bsData && (
                    <div className="my-6 border border-slate-700 rounded-xl overflow-hidden text-xs">
                      <div className="bg-slate-700 text-center font-bold py-2 text-slate-200 border-b border-slate-600">
                        貸借対照表（単位：百万円）
                      </div>
                      <table className="w-full text-left border-collapse bg-slate-900">
                        <thead>
                          <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400">
                            <th className="p-2 border-r border-slate-700 w-1/2">資産の部</th>
                            <th className="p-2 w-1/2">負債・純資産の部</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: Math.max(q.bsData.left.length, q.bsData.right.length) }).map((_, idx) => {
                            const l = q.bsData.left[idx] || { name: "", val: "" };
                            const r = q.bsData.right[idx] || { name: "", val: "" };
                            return (
                              <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/20 font-mono">
                                <td className="p-2 border-r border-slate-700 flex justify-between">
                                  <span>{l.name}</span>
                                  <span className="text-indigo-300">{l.val ? l.val.toLocaleString() : ""}</span>
                                </td>
                                <td className="p-2 flex justify-between">
                                  <span>{r.name}</span>
                                  <span className="text-emerald-300">{r.val ? r.val.toLocaleString() : ""}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Multiple Choices Interactivity List */}
                <div className="space-y-3">
                  {q.options.map((opt) => {
                    let btnStyle = "bg-slate-800 border-slate-700 hover:border-indigo-500/50";
                    if (selectedAnswer === opt.key) {
                      btnStyle = "bg-indigo-950/40 border-indigo-500 text-indigo-200";
                    }
                    if (isAnswered) {
                      if (opt.key === q.answer) {
                        btnStyle = "bg-emerald-950/50 border-emerald-500 text-emerald-200";
                      } else if (selectedAnswer === opt.key) {
                        btnStyle = "bg-rose-950/50 border-rose-500 text-rose-200";
                      } else {
                        btnStyle = "bg-slate-800/40 border-slate-800 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        disabled={isAnswered}
                        onClick={() => handleSelectAnswer(opt.key)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-start space-x-3 text-sm ${btnStyle}`}
                      >
                        <div className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center shrink-0 border ${
                          selectedAnswer === opt.key ? "bg-indigo-600 text-white border-transparent" : "bg-slate-900 text-slate-400 border-slate-700"
                        }`}>
                          {opt.key}
                        </div>
                        <span className="leading-relaxed pt-0.5">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Action Control Processing Segment Bar */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleReturnHome}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    中断してメニューに戻る
                  </button>

                  {!isAnswered ? (
                    <button
                      disabled={!selectedAnswer}
                      onClick={handleSubmitAnswer}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-bold text-white rounded-xl text-sm shadow-md transition-all active:scale-[0.98]"
                    >
                      解答を確定する
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm shadow-md transition-all flex items-center space-x-1"
                    >
                      <span>{currentIndex + 1 === filteredQuestions.length ? "結果画面へ" : "次の問題へ"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* --- Interactive Expanded Solution Commentary Component --- */}
                {isAnswered && (
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-inner animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-700 gap-3">
                      <div className="flex items-center space-x-2">
                        {selectedAnswer === q.answer ? (
                          <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/20 text-xs font-bold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>正解</span>
                          </div>
                        ) : (
                          <div className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-lg border border-rose-500/20 text-xs font-bold flex items-center space-x-1">
                            <X className="w-3.5 h-3.5" />
                            <span>不正解 (正解は {q.answer})</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Live Checkbox Review Data Persistence Trigger */}
                      <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={userRecords[q.id]?.isReview || false}
                          onChange={() => toggleReviewFlag(q.id)}
                          className="w-4 h-4 accent-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-0"
                        />
                        <span className="font-medium">この問題を「要復習」リストへ追加</span>
                      </label>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1.5">解説セクション</h4>
                      <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                        {q.explanation}
                      </p>
                    </div>

                    {/* Extended Matrix Reconstructions Inside Analytical Interpretations */}
                    {q.tableData && (
                      <div className="overflow-x-auto text-xs bg-slate-900 p-3 rounded-xl border border-slate-700">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-800">
                              <th className="pb-1.5 w-1/4">分類</th>
                              <th className="pb-1.5 w-1/3">目的と概要</th>
                              <th className="pb-1.5">代表的な経営指標</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-300">
                            {q.tableData.map((t, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/10">
                                <td className="py-2 font-bold text-slate-200">{t.type}</td>
                                <td className="py-2 pr-2">{t.desc}</td>
                                <td className="py-2 text-indigo-300 font-mono">{t.metrics}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {q.formulas && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
                        <div className="font-bold text-slate-400 mb-1">【重要公式】</div>
                        {q.formulas.map((f, idx) => (
                          <div key={idx} className="flex justify-between border-b border-slate-800 pb-1">
                            <span className="text-slate-300 font-medium">{f.name}</span>
                            <span className="font-mono text-indigo-300 font-bold">{f.calc}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.comparisonData && (
                      <div className="text-xs bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-800 text-slate-400 font-medium border-b border-slate-700">
                              <th className="p-2">指標</th>
                              <th className="p-2 font-mono text-right">A社</th>
                              <th className="p-2 font-mono text-right">B社</th>
                              <th className="p-2 text-center">判定結果</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 font-mono">
                            {q.comparisonData.map((c, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/20">
                                <td className="p-2 font-sans text-slate-200">{c.metric}</td>
                                <td className="p-2 text-right text-indigo-300">{c.a}</td>
                                <td className="p-2 text-right text-emerald-300">{c.b}</td>
                                <td className="p-2 text-center font-sans text-xs font-bold text-amber-400">{c.better}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {q.breakdown && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2 text-xs font-mono">
                        <div className="font-bold text-slate-400 font-sans mb-1">【分解ステップ】</div>
                        {q.breakdown.map((b, idx) => (
                          <div key={idx} className="space-y-0.5 border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                            <div className="text-slate-400 font-sans text-xs">{b.step}</div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-50">{b.formula}</span>
                              <span className="text-indigo-300 font-bold">{b.result}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })()
        )}

        {/* --- VIEW: Comprehensive History List Component --- */}
        {currentView === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <List className="w-5 h-5 text-indigo-400" />
                <span>収録問題・同期ステータス一覧</span>
              </h2>
              <button
                onClick={() => setCurrentView("menu")}
                className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-1.5 rounded-xl transition-colors"
              >
                メニューに戻る
              </button>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-700/50 text-slate-400 font-medium border-b border-slate-700">
                    <th className="p-3 w-16 text-center">No</th>
                    <th className="p-3">問題区分・カテゴリ</th>
                    <th className="p-3">論点タイトル</th>
                    <th className="p-3 text-center w-24">正誤履歴</th>
                    <th className="p-3 text-center w-24">要復習</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {QUESTIONS.map((q) => {
                    const record = userRecords[q.id];
                    return (
                      <tr key={q.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-3 text-center font-mono text-slate-400">{q.id}</td>
                        <td className="p-3">
                          <span className="bg-slate-900 px-2 py-0.5 rounded text-xs font-medium text-indigo-300 border border-slate-700">
                            {q.category}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-200">{q.title}</td>
                        <td className="p-3 text-center">
                          {record ? (
                            record.isCorrect ? (
                              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">正解</span>
                            ) : (
                              <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md font-bold">不正解</span>
                            )
                          ) : (
                            <span className="text-xs bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800">未解答</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleReviewFlag(q.id)}
                            className={`p-1 rounded transition-colors ${record?.isReview ? "text-amber-400 hover:text-amber-500" : "text-slate-600 hover:text-slate-400"}`}
                          >
                            <AlertTriangle className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- VIEW: Recharts Analytics Dashboard --- */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>カテゴリ別正解率アナリティクス</span>
              </h2>
              <button
                onClick={() => setCurrentView("menu")}
                className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-1.5 rounded-xl transition-colors"
              >
                メニューに戻る
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Recharts Pie Chart Visual Breakdown */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-sm font-bold text-slate-300 mb-4 text-center">全13問 正解シェア比率</h3>
                {(() => {
                  const stats = getTotalStats();
                  const data = [
                    { name: "正解済み", value: stats.correctCount, color: "#10b981" },
                    { name: "未正解", value: stats.remainingCount, color: "#475569" }
                  ];
                  return (
                    <div className="w-full h-48 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center">
                        <div className="text-2xl font-black text-emerald-400">{stats.correctCount}</div>
                        <div className="text-xs text-slate-400">/ {stats.totalQuestions} 正解</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Recharts Bar Chart Breakdown Matrix Container */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm md:col-span-2">
                <h3 className="text-sm font-bold text-slate-300 mb-4">カテゴリ別正解数マトリックス</h3>
                <div className="w-full h-48 text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDashboardData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569" }} />
                      <Legend />
                      <Bar dataKey="正解数" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="総問題数" fill="#334155" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Motivational Review Block */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center max-w-xl mx-auto space-y-3 shadow-md">
              <h3 className="font-bold text-base text-slate-100">二次試験合格へのアドバイス</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                中小企業診断士の財務会計・経営分析は、単に公式を暗記するだけでなく「売上高」「有形固定資産」「人件費」など各構成要素への【分解公式の意味】を深く理解することが２次記述試験突破の鍵を握ります。弱点モードを活用し全問正解率100%をマークするまで反復演習を行いましょう。
              </p>
              <button
                onClick={() => setCurrentView("menu")}
                className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-white font-medium transition-all shadow-md shadow-indigo-600/10"
              >
                メニューに戻って学習を継続する
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>© 2026 Small and Medium Enterprise Consultant Study Guide Automation. Sync verified on Google Firestore Engine.</p>
      </footer>
    </div>
  );
}