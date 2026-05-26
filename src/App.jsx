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

// --- Quiz Questions Data (完全網羅版) ---
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
    explanation: "「労働生産性」は生産性分析になります。「労働生産性」とは従業員一人あたりの付加価値であり、生産性分析では最も重要な指標です。なお「固定長期適合率」は、安全性分析にあたるので、不適切です。安全性分析には「短期安全性」「長期安全性」「資本構成」の分析があります。",
    tableData: [
      { type: "収益性分析", desc: "企業が利益を上げる能力を分析します。主な経営指標に「総資本経常利益率」「売上高総利益率」などがあります。" },
      { type: "安全性分析", desc: "企業の支払能力や倒産リスクを分析するための代表的な指標に「流動比率」「当座比率」「固定長期適合率」などがあります。" },
      { type: "生産性分析", desc: "投入したインプット（経営資源）に対するアウトプット（付加価値）の効率を分析します。主な指標に「労働生産性」があります。" },
      { type: "成長性分析", desc: "企業の売上高や利益、総資産などが一定期間でどれぐらい成長しているかを分析します。主な指標に「売上高成長率」「総資産成長率」などがあります。" }
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
    explanation: "資本利益率の計算は、利益は損益計算書(P/L)から、資本は貸借対照表(B/S)から取得します。貸借対照表だけでは数値を求めることができないので、不適切です。\n\n・事業利益を使用した指標（総資本事業利益率など）は、より厳密に企業の資金調達によらない収益性を表せます。\n・経営資本を使用した指標（経営資本営業利益率など）は、資産のうち本業で使用されていないものを除き、本業からの儲けを表せます。",
    formulas: [
      { name: "資本利益率", calc: "利益 ÷ 資本 × 100（％）" },
      { name: "事業利益", calc: "営業利益 ＋ 受取利息･配当金 ＋ 有価証券利息" },
      { name: "総資本", calc: "負債 ＋ 純資産" },
      { name: "経営資本", calc: "総資産 － 建設仮勘定 － 投資その他の資産 － 繰延資産" },
      { name: "資本利益率の分解", calc: "利益/資本 ＝ 利益/売上高 × 売上高/資本 ＝ 売上高利益率 × 資本回転率" }
    ]
  },
  {
    id: 3,
    title: "問題 3 収益性分析 資本利益率",
    category: "収益性分析",
    question: "Y社の以下の貸借対照表、損益計算書に基づいて、自己資本利益率、経営資本営業利益率、総資本事業利益率の組み合わせとして、最も適切なものを下記の解答群から選べ。なお計算結果は、小数点第1位を切り捨てること。",
    options: [
      { key: "ア", text: "自己資本利益率 66％ 経営資本営業利益率 50％ 総資本事業利益率 30％" },
      { key: "イ", text: "自己資本利益率 66％ 経営資本営業利益率 31％ 総資本事業利益率 33％" },
      { key: "ウ", text: "自己資本利益率 39％ 経営資本営業利益率 31％ 総資本事業利益率 30％" },
      { key: "エ", text: "自己資本利益率 39％ 経営資本営業利益率 31％ 総資本事業利益率 33％" }
    ],
    answer: "エ",
    explanation: "問題文より、計算結果は小数点第1位を切り捨てる必要があります。\n\n1. 自己資本利益率 ＝ 当期純利益(198) ÷ 自己資本(資本金300 ＋ 資本剰余金100 ＋ 利益剰余金100) × 100 ＝ 39.6％ → 切り捨てて 39％\n2. 経営資本営業利益率 ＝ 営業利益(300) ÷ 経営資本(総資産1,000 － 投資有価証券50) × 100 ＝ 31.5789…％ → 切り捨てて 31％\n3. 総資本事業利益率 ＝ 事業利益(営業利益300 ＋ 受取利息30) ÷ 総資本(1,000) × 100 ＝ 33％",
    bsTable: {
      title: "貸借対照表（単位：百万円）",
      left: [
        { name: "現金及び預金", val: 208 }, { name: "受取手形", val: 50 }, { name: "  貸倒引当金", val: -2 },
        { name: "売掛金", val: 150 }, { name: "  貸倒引当金", val: -6 }, { name: "棚卸資産", val: 200 },
        { name: "土地", val: 150 }, { name: "建物・機械設備等", val: 250 }, { name: "  減価償却累計額", val: -50 },
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
    ],
    extraInfo: "※貸借対照表が一期分しか提示されない場合は、その数字をそのまま使います。もし二期分示されている場合は平均値を使います。"
  },
  {
    id: 4,
    title: "問題 4 収益性分析 売上高利益率",
    category: "収益性分析",
    question: "A社に関する次の資料に基づいて、売上高利益率に関する記述として最も適切なものはどれか。",
    options: [
      { key: "ア", text: "A社の売上高総利益率は35.0％である。" },
      { key: "イ", text: "A社の売上高営業利益率は13.5％である。" },
      { key: "ウ", text: "A社の売上高経常利益率は13.5％である。" },
      { key: "エ", text: "A社の売上高当期純利益率は13.75％である。" }
    ],
    answer: "ウ",
    explanation: "A社資料より、「給料400」「広告宣伝費50」「減価償却費200」「旅費交通費50」の合計700が「販売費・一般管理費」になります。「固定資産売却益10」は「特別利益」です。\n\n・売上高総利益率 ＝ 売上総利益(4,000－2,800＝1,200) ÷ 売上高4,000 × 100 ＝ 30.0％\n・売上高営業利益率 ＝ 営業利益(1,200－700＝500) ÷ 売上高4,000 × 100 ＝ 12.5％\n・売上高経常利益率 ＝ 経常利益(500＋50－10＝540) ÷ 売上高4,000 × 100 ＝ 13.5％ (正解)\n・売上高当期純利益率 ＝ 当期純利益(540＋10－220＝330) ÷ 売上高4,000 × 100 ＝ 8.25％",
    dataValues: [
      { name: "売上高", val: "4,000" }, { name: "減価償却費", val: "200" },
      { name: "受取利息", val: "50" }, { name: "旅費交通費", val: "50" },
      { name: "支払利息", val: "10" }, { name: "固定資産売却益", val: "10" },
      { name: "給料", val: "400" }, { name: "売上原価", val: "2,800" },
      { name: "広告宣伝費", val: "50" }, { name: "法人税等", val: "220" }
    ],
    unit: "（単位：百万円）"
  },
  {
    id: 5,
    title: "問題 5 収益性分析 効率性分析",
    category: "収益性分析",
    question: "次の表において記号「↑」は指標の値の上昇を、「↓」は指標の値の低下を表す。各指標が良好になる場合の空欄Ａ～Ｄに入る記号の組み合わせとして、最も適切なものを下記の解答群から選べ。",
    options: [
      { key: "ア", text: "Ａ：↓ Ｂ：↑ Ｃ：↓ Ｄ：↓" },
      { key: "イ", text: "Ａ：↑ Ｂ：↑ Ｃ：↓ Ｄ：↓" },
      { key: "ウ", text: "Ａ：↓ Ｂ：↑ Ｃ：↑ Ｄ：↑" },
      { key: "エ", text: "Ａ：↑ Ｂ：↑ Ｃ：↑ Ｄ：↑" }
    ],
    answer: "イ",
    explanation: "「回転率」の計算式は「売上高÷資産」等であり、値が高い(↑)ほど資産を効率活用して売上に貢献しているため良好です（総資本回転率A、固定資産回転率B）。\n「回転期間」は回転率の逆数に365日等を掛けた「資産÷売上」であり、値が低い・短い(↓)ほど資産が効率よく本業で回転しているため良好です（売上債権回転期間C、棚卸資産回転期間D）。",
    matrix: [
      { metric: "総資本回転率", key: "（ Ａ ）" },
      { metric: "固定資産回転率", key: "（ Ｂ ）" },
      { metric: "売上債権回転期間", key: "（ Ｃ ）" },
      { metric: "棚卸資産回転率", key: "↑" },
      { metric: "棚卸資産回転期間", key: "（ Ｄ ）" }
    ]
  },
  {
    id: 6,
    title: "問題 6 安全性分析1",
    category: "安全性分析",
    question: "Y社の以下の財務資料に基づいて、固定長期適合率、自己資本比率、負債比率の組み合わせとして、最も適切なものを下記の解答群から選べ。なお計算結果は小数点第1位を切り捨てること。",
    options: [
      { key: "ア", text: "固定長期適合率 54％ 自己資本比率 41％ 負債比率 122％" },
      { key: "イ", text: "固定長期適合率 54％ 自己資本比率 240％ 負債比率 122％" },
      { key: "ウ", text: "固定長期適合率 46％ 自己資本比率 240％ 負債比率 140％" },
      { key: "エ", text: "固定長期適合率 46％ 自己資本比率 41％ 負債比率 140％" }
    ],
    answer: "エ",
    explanation: "公式に基づき算出します（小数点第1位切り捨て）：\n\n1. 固定長期適合率 ＝ 固定資産(190＋110＝300) ÷ （固定負債100 ＋ 自己資本[300＋150＋90＝540]） × 100 ＝ 46.875％ → 46％\n2. 自己資本比率 ＝ 自己資本(540) ÷ 総資本(1,300) × 100 ＝ 41.538…％ → 41％\n3. 負債比率 ＝ 負債(250＋210＋200＋100＝760) ÷ 自己資本(540) × 100 ＝ 140.740…％ → 140％",
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
    },
    unit: "（単位：百万円）"
  },
  {
    id: 7,
    title: "問題 7 安全性分析2",
    category: "安全性分析",
    question: "流動比率、当座比率、固定比率、固定長期適合率について、A社がB社より良好な場合（Ａで表す）とB社がA社より良好な場合（Bで表す）の組み合わせとして最も適切なものはどれか。",
    options: [
      { key: "ア", text: "流動比率：Ｂ 当座比率：Ａ 固定比率：Ｂ 固定長期適合率：Ａ" },
      { key: "イ", text: "流動比率：Ａ 当座比率：Ｂ 固定比率：Ａ 固定長期適合率：Ｂ" },
      { key: "ウ", text: "流動比率：Ｂ 当座比率：Ｂ 固定比率：Ａ 固定長期適合率：Ａ" },
      { key: "エ", text: "流動比率：Ｂ 当座比率：Ｂ 固定比率：Ｂ 固定長期適合率：Ａ" }
    ],
    answer: "ア",
    explanation: "各比率を公式から計算し、優劣を判定します（流動・当座は高い方が良好、固定・固定長期適合は低い方が良好）。\n\n・流動比率: A社＝140.00%、B社＝142.86% → B社が良好 (Ｂ)\n・当座比率: A社＝130.00%、B社＝128.57% → A社が良好 (Ａ) （※当座資産＝現預金＋受取手形＋売掛金＋有価証券）\n・固定比率: A社＝100.00%、B社＝93.75% → B社が良好 (Ｂ)\n・固定長期適合率: A社＝62.96%、B社＝71.43% → A社が良好 (Ａ)",
    bsComparisonTable: {
      headers: ["資産の部", "A社", "B社", "負債・純資産の部", "A社", "B社"],
      rows: [
        ["現金及び預金", 180, 110, "支払手形", 200, 80],
        ["受取手形", 140, 80, "買掛金", 150, 110],
        ["売掛金", 150, 100, "短期借入金", 150, 90],
        ["有価証券", 180, 70, "長期借入金", 200, 100],
        ["棚卸資産", 50, 40, "資本金", 100, 140],
        ["有形固定資産", 300, 190, "資本剰余金", 150, 110],
        ["無形固定資産", 40, 110, "利益剰余金", 90, 70],
        ["資産合計", 1040, 700, "負債・純資産合計", 1040, 700]
      ]
    },
    unit: "（単位：百万円）"
  },
  {
    id: 8,
    title: "問題 8 経営分析（生産性分析）",
    category: "生産性分析",
    question: "労働生産性に関する説明として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "労働生産性分析では、投入したインプットに対するアウトプットの効率を分析する。インプットには「付加価値」を使用する。" },
      { key: "イ", text: "「付加価値」の算出方法は、経常利益に人件費、賃借料、外注加工費、間接材料費等を足しあわせたものである。" },
      { key: "ウ", text: "「労働生産性」は「付加価値率」×「従業員1人あたり売上高」で算出することができる。" },
      { key: "エ", text: "「付加価値率」は「付加価値」に占める「売上高」の割合である。" }
    ],
    answer: "ウ",
    explanation: "労働生産性 ＝ 付加価値 ÷ 従業員数 ＝ 付加価値/売上高 × 売上高/従業員数 ＝ 付加価値率 × 従業員1人あたり売上高。よってウが正しいです。\nア：付加価値は「インプット」ではなく「アウトプット」です。\nイ：付加価値に外注加工費や間接材料費は含みません。\nエ：付加価値率は「売上高」に占める「付加価値」の割合です。",
    formulaDetails: "付加価値 ＝ 経常利益 ＋ 人件費 ＋ 賃借料 ＋ 純金利費用 ＋ 減価償却費 ＋ 租税公課"
  },
  {
    id: 9,
    title: "問題 9 生産性分析 労働生産性の分解",
    category: "生産性分析",
    question: "次の資料に基づき、労働生産性の数値として、最も適切なものを下記の解答群から選べ。",
    options: [
      { key: "ア", text: "25,000,000" },
      { key: "イ", text: "30,000,000" },
      { key: "ウ", text: "35,000,000" },
      { key: "エ", text: "40,000,000" }
    ],
    answer: "ウ",
    explanation: "労働生産性は「労働装備率（資本装備率） × 設備生産性（資本生産性）」で求められます。\n\n1. 設備生産性 ＝ 付加価値額(35,000,000) ÷ 有形固定資産(20,000,000) ＝ 1.75\n2. 労働生産性 ＝ 労働装備率(20,000,000) × 設備生産性(1.75) ＝ 35,000,000 円",
    calcTable: [
      { item: "労働装備率", value: "20,000,000 円" },
      { item: "付加価値額", value: "35,000,000 円" },
      { item: "有形固定資産", value: "20,000,000 円" }
    ],
    extraInfo: "※労働装備率 ＝ 有形固定資産 ÷ 従業員数（従業員一人あたりの設備投資額）"
  },
  {
    id: 10,
    title: "問題 10 損益分岐点(CVP)分析の基本知識",
    category: "CVP分析",
    question: "経営分析の種類と指標に関する説明として、適切なものはどれか。",
    options: [
      { key: "ア", text: "変動費は営業量の増加に比例して減少する費用であり、固定費は、営業量の増減に関係なく固定的に発生する費用である。" },
      { key: "イ", text: "「勘定科目法」とは、固定費と変動費を分解する手法のひとつであり、経理上の勘定科目別に固定費と変動費の分類を行う手法のことである。" },
      { key: "ウ", text: "「高低点法」とは、目的変数の測定値と推定値の誤差の二乗が最小となるように、回帰式を求める方法である。" },
      { key: "エ", text: "損益分岐点とは、販売量がちょうど0になるときの利益のことをさす。" }
    ],
    answer: "イ",
    explanation: "勘定科目法は記述の通り適切です（仕入高等を変動費、家賃等を固定費とする方法）。\nア：変動費は営業量の増加に比例して「増加」する費用です。\nウ：記述は「最小二乗法」の内容です。高低点法は「最高売上高と最低売上高の２点」から計算します。\nエ：損益分岐点とは、「利益がちょうど0になるときの売上高（販売量）」を指します。",
    costType: [
      { name: "変動費", behavior: "営業量の増加に比例して増加", examples: "材料費、運送費、販売促進費" },
      { name: "固定費", behavior: "営業量の増減に関係なく一定に発生", examples: "支払家賃、給料、支払利息、火災保険料" }
    ]
  },
  {
    id: 11,
    title: "問題 11 損益分岐点(CVP)分析",
    category: "CVP分析",
    question: "企業の収益力の余裕をはかる尺度について述べた次の文章の空欄Ａ、空欄Ｂに入る数値として、最も適切なものを下記の解答群から選べ。\n「前事業年度の損益分岐点売上高は（ Ａ ）万円である。このとき、安全余裕率、すなわち売上高が損益分岐点売上高を上回る額の売上高に対する比率は（ Ｂ ）％である」",
    options: [
      { key: "ア", text: "Ａ：50,000 Ｂ：58.3" },
      { key: "イ", text: "Ａ：50,000 Ｂ：37.5" },
      { key: "ウ", text: "Ａ：75,000 Ｂ：58.3" },
      { key: "エ", text: "Ａ：75,000 Ｂ：37.5" }
    ],
    answer: "エ",
    explanation: "1. 変動費率 ＝ 変動費72,000 ÷ 売上高120,000 ＝ 0.6\n2. 損益分岐点売上高(A) ＝ 固定費30,000 ÷ (1 － 変動費率0.6) ＝ 75,000（万円）\n3. 安全余裕率(B) ＝ （実際売上高120,000 － 損益分岐点売上高75,000） ÷ 実際売上高120,000 × 100 ＝ 37.5（％）",
    calcTable: [
      { item: "① 前事業年度の売上高", value: "120,000 万円" },
      { item: "② 原価のうち変動費", value: "72,000 万円" },
      { item: "③ 原価のうち固定費", value: "30,000 万円" }
    ]
  },
  {
    id: 12,
    title: "問題 12 損益分岐点(CVP)分析 目標売上高の計算",
    category: "CVP分析",
    question: "当期の損益計算書（要旨）は次のとおりである。変動費、固定費の構造は一定とし、売上原価はすべて変動費とすると、経常利益の目標55,000千円を達成する売上高として、最も適切なものを下記の解答群から選べ（単位：千円）。",
    options: [
      { key: "ア", text: "255,000千円" },
      { key: "イ", text: "350,000千円" },
      { key: "ウ", text: "400,000千円" },
      { key: "エ", text: "450,000千円" }
    ],
    answer: "イ",
    explanation: "条件に従って固変分解を行います。\n\n1. 固定費の計算 ＝ 営業外費用50,000 － 営業外収益20,000 ＋ 販管費固定分20,000 ＝ 50,000（千円）\n2. 変動費の計算 ＝ 売上原価120,000 ＋ 販管費変動分（40,000 － 20,000） ＝ 140,000（千円）\n3. 変動費率 ＝ 140,000 ÷ 200,000 ＝ 0.7\n4. 目標売上高 ＝ （固定費50,000 ＋ 目標利益55,000） ÷ （1 － 変動費率0.7） ＝ 105,000 ÷ 0.3 ＝ 350,000（千円）",
    plTable: [
      { name: "売上高", val: 200000 }, { name: "売上原価", val: 120000 },
      { name: "販売費及び一般管理費", val: 40000 }, { name: "営業利益", val: 40000 },
      { name: "営業外収益", val: 20000 }, { name: "営業外費用", val: 50000 },
      { name: "経常利益", val: 10000 }
    ],
    notes: [
      "1. 販売費及び一般管理費のうち、固定費は 20,000千円である。",
      "2. 売上高が変化しても営業外収益、営業外費用は一定である。",
      "3. 営業外損益は固定費として扱う。"
    ]
  },
  {
    id: 13,
    title: "問題 13 セグメント別損益分析",
    category: "セグメント別損益",
    question: "セグメント別損益分析について述べた次の文章の空欄Ａ、空欄Ｂ、空欄Cに入る語句の組み合わせとして、最も適切なものはどれか。\n「売上高から変動売上原価を引いたものが、Ａである。このＡから変動販売費を引いたものが、Ｂである。Ｂから、個別固定費を引いたものが、Ｃである。」",
    options: [
      { key: "ア", text: "Ａ：変動製造マージン   Ｂ：限界利益   Ｃ：貢献利益" },
      { key: "イ", text: "Ａ：変動製造マージン   Ｂ：貢献利益   Ｃ：限界利益" },
      { key: "ウ", text: "Ａ：製造間接費     Ｂ：限界利益   Ｃ：営業利益" },
      { key: "エ", text: "Ａ：製造間接費      Ｂ：貢献利益   Ｃ：営業利益" }
    ],
    answer: "ア",
    explanation: "直接原価計算に基づく損益計算書の構造に関する問題です。\n・売上高 － 変動売上原価 ＝ 変動製造マージン(A)\n・変動製造マージン － 変動販売費 ＝ 限界利益(B)（売上高から全ての変動費を引いた額）\n・限界利益 － 個別固定費（その事業部固有の固定費） ＝ 貢献利益(C)\n・貢献利益 － 共通固定費（全社共通の本社費など） ＝ 営業利益 となります。",
    segmentFlow: [
      "売上高",
      "  [-] 変動売上原価",
      "＝ 変動製造マージン （ Ａ ）",
      "  [-] 変動販売費",
      "＝ 限界利益 （ Ｂ ）",
      "  [-] 個別固定費",
      "＝ 貢献利益 （ Ｃ ）",
      "  [-] 共通固定費",
      "＝ 営業利益"
    ]
  }
];

export default function App() {
  // --- States ---
  const [userId, setUserId] = useState("");
  const [isKeyAuthenticated, setIsKeyAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("login");

  // Quiz States
  const [selectedMode, setSelectedMode] = useState("all");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Sync / Tracking States
  const [userRecords, setUserRecords] = useState({});
  const [hasResumeData, setHasResumeData] = useState(null);

  // --- Authentication & Initialization ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setIsLoading(true);
    console.log(`[Auth Session Initiated] Target ID Key: ${userId}`);
    try {
      await signInAnonymously(auth);
      
      const userDocRef = doc(db, APP_ID, userId.trim());
      const userDocSnap = await getDoc(userDocRef);

      let records = {};
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        records = data.records || {};
        setUserRecords(records);

        if (data.progressIndex !== undefined && data.progressIndex !== null && data.progressIndex < QUESTIONS.length) {
          setHasResumeData({
            index: data.progressIndex,
            mode: data.progressMode || "all"
          });
          console.log(`[Resume Check] Unfinished track loaded at index: ${data.progressIndex}, mode: ${data.progressMode}`);
        }
      } else {
        await setDoc(userDocRef, { records: {}, progressIndex: 0, progressMode: "all" });
      }

      setIsKeyAuthenticated(true);
      setCurrentView("menu");
    } catch (error) {
      console.error("[Fatal Login Error] Handshake or write sequence broke:", error);
      alert("データベースとの同期に失敗しました。認証設定とネットワーク接続を確認してください。");
    } block: {
      setIsLoading(false);
    }
  };

  // --- Quiz Core Engine Router ---
  const startQuiz = (mode, resumeIndex = null) => {
    let list = [...QUESTIONS];
    
    if (mode === "wrong") {
      list = QUESTIONS.filter(q => userRecords[q.id] && !userRecords[q.id].isCorrect);
    } else if (mode === "review") {
      list = QUESTIONS.filter(q => userRecords[q.id] && userRecords[q.id].isReview);
    }

    if (list.length === 0) {
      alert("該当する問題がありません。別のモードを選択してください。");
      return;
    }

    setFilteredQuestions(list);
    setSelectedMode(mode);
    setCurrentIndex(resumeIndex !== null ? resumeIndex : 0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentView("quiz");
    console.log(`[Quiz Mode Triggered] Mode: ${mode}, Position: ${resumeIndex || 0}`);
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

    const currentReviewState = userRecords[currentQuestion.id]?.isReview || false;
    const updatedRecords = {
      ...userRecords,
      [currentQuestion.id]: {
        isCorrect,
        isReview: currentReviewState
      }
    };
    setUserRecords(updatedRecords);

    const nextIndex = currentIndex + 1;
    const isFinished = nextIndex >= filteredQuestions.length;

    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, {
        records: updatedRecords,
        progressIndex: isFinished ? 0 : nextIndex,
        progressMode: selectedMode
      });
      console.log(`[Answer Written] ID: ${currentQuestion.id} -> Cloud index sync position: ${isFinished ? 0 : nextIndex}`);
    } catch (e) {
      console.error("[Error] Realtime cloud syncing dropped:", e);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
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

    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, { records: updatedRecords });
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetProgress = async () => {
    try {
      const userDocRef = doc(db, APP_ID, userId.trim());
      await updateDoc(userDocRef, { progressIndex: 0, progressMode: "all" });
      setHasResumeData(null);
      console.log("[Progress Scrubbed] Session tracking counter reset to zero.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleReturnHome = async () => {
    if (currentView === "quiz" && !isAnswered) {
      try {
        const userDocRef = doc(db, APP_ID, userId.trim());
        await updateDoc(userDocRef, {
          progressIndex: currentIndex,
          progressMode: selectedMode
        });
        setHasResumeData({ index: currentIndex, mode: selectedMode });
      } catch (e) {
        console.error(e);
      }
    }
    setCurrentView("menu");
  };

  // --- Dash Insights Formulas ---
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-indigo-400 animate-pulse text-lg font-semibold">
          <RefreshCw className="animate-spin w-6 h-6" />
          <span>クラウドから同期用暗号化ノードを展開中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
      
      {/* Universal Sticky Header Bar */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 px-4 py-3 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReturnHome}>
            <div className="bg-indigo-600 px-2.5 py-1 rounded-lg text-white font-black text-xs tracking-wider shadow-inner">
              診断士
            </div>
            <h1 className="text-base md:text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              スマート問題集2-6 【経営分析】
            </h1>
          </div>
          {isKeyAuthenticated && (
            <div className="flex items-center space-x-3 text-sm">
              <span className="bg-slate-900 px-3 py-1 rounded-full text-indigo-400 border border-slate-700 font-mono text-xs hidden sm:inline">
                同期ID: {userId}
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
        
        {/* --- VIEW: Authentication Gateway --- */}
        {currentView === "login" && (
          <div className="max-w-md mx-auto my-12 bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="bg-indigo-500/10 text-indigo-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">マルチデバイス同期システム</h2>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                自由な合言葉を入力してください。PCで学習した続きを、スマートフォンでも同じキーワードを入力して瞬時に復元・同期できます。
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
                  placeholder="例: osaka-studying-2026"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-mono text-center text-lg tracking-widest text-indigo-300"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3 shadow-lg transition-all text-sm shadow-indigo-600/20"
              >
                暗号化セッションに接続
              </button>
            </form>
          </div>
        )}

        {/* --- VIEW: Main Navigation Menu --- */}
        {currentView === "menu" && (
          <div className="space-y-6">
            
            {/* Resume Task Banner */}
            {hasResumeData && (
              <div className="bg-gradient-to-r from-indigo-950 to-slate-800 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeIn">
                <div className="flex items-start space-x-3">
                  <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm md:text-base">前回の続きからリジューム可能</h3>
                    <p className="text-xs md:text-sm text-slate-300 mt-0.5">
                      前回はモード <span className="text-indigo-400 font-bold">[{hasResumeData.mode === "all" ? "すべての問題" : hasResumeData.mode === "wrong" ? "前回不正解のみ" : "要復習のみ"}]</span> の <span className="text-indigo-400 font-bold">問題 {hasResumeData.index + 1}</span> で中断しています。
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
                  <button
                    onClick={async () => { if (window.confirm("進行状況をリセットして最初から開始しますか？")) await handleResetProgress(); }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-medium border border-slate-600 transition-all"
                  >
                    最初から始める
                  </button>
                  <button
                    onClick={() => startQuiz(hasResumeData.mode, hasResumeData.index)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-md"
                  >
                    <span>続きから再開する</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Total Performance KPI Cards Group */}
            {(() => {
              const stats = getTotalStats();
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm text-center">
                    <div className="text-xs font-medium text-slate-400">合計問題数</div>
                    <div className="text-xl md:text-2xl font-black mt-1 text-slate-100">{stats.totalQuestions} <span className="text-xs font-normal text-slate-500">問</span></div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm text-center">
                    <div className="text-xs font-medium text-emerald-400">現在正解数</div>
                    <div className="text-xl md:text-2xl font-black mt-1 text-emerald-400">{stats.correctCount} <span className="text-xs font-normal text-slate-500">/{stats.totalQuestions}</span></div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm text-center">
                    <div className="text-xs font-medium text-amber-400">要復習マーク</div>
                    <div className="text-xl md:text-2xl font-black mt-1 text-amber-400">{stats.reviewCount} <span className="text-xs font-normal text-slate-500">問</span></div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm text-center">
                    <div className="text-xs font-medium text-indigo-400">章別達成度</div>
                    <div className="text-xl md:text-2xl font-black mt-1 text-indigo-400">
                      {Math.round((stats.correctCount / stats.totalQuestions) * 100) || 0}%
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Study Mode Direct Launchers Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span>すべての問題</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    章全体の全13問を漏れなく学習します。経営分析の分類から複雑な財務指標の算出、損益分岐点（CVP）、直接原価計算まで試験範囲をカバー。
                  </p>
                </div>
                <button
                  onClick={() => startQuiz("all")}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all"
                >
                  学習を開始する
                </button>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-amber-400 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    <span>前回不正解の問題</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    現在同期されている不正解フラグデータに絞り込み、リベンジ判定演習を行います。ケアレスミスや論点の混同を撲滅するのに最適です。
                  </p>
                </div>
                <button
                  onClick={() => startQuiz("wrong")}
                  className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all"
                >
                  弱点を徹底克服する
                </button>
              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-rose-400 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
                    <span>要復習の問題</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    ご自身が要復習としてブックマークした問題だけを徹底反復します。公式の暗記状況や特定の計算手順、問題構造の理解確認用です。
                  </p>
                </div>
                <button
                  onClick={() => startQuiz("review")}
                  className="w-full mt-6 bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all"
                >
                  要復習リストを実行
                </button>
              </div>
            </div>

            {/* Utility Sub Nav Footers */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentView("history")}
                className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 transition-colors"
              >
                <List className="w-4 h-4 text-indigo-400" />
                <span>収録問題の一覧・個別ステータス</span>
              </button>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 transition-colors"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>カテゴリ別正解比率アナリティクス</span>
              </button>
            </div>

          </div>
        )}

        {/* --- VIEW: Interactive Test / Quiz Core Workspace --- */}
        {currentView === "quiz" && filteredQuestions[currentIndex] && (
          (() => {
            const q = filteredQuestions[currentIndex];
            return (
              <div className="space-y-6">
                
                {/* Header Context Tracking Module */}
                <div className="flex items-center justify-between bg-slate-800 px-4 py-3 rounded-xl border border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-indigo-400 text-xs font-bold bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      {q.category}
                    </span>
                    <h2 className="font-bold text-xs md:text-sm text-slate-200">{q.title}</h2>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    進行状況: <span className="text-white font-bold">{currentIndex + 1}</span> / {filteredQuestions.length} 問
                  </div>
                </div>

                {/* Primary Question Description Workspace Section */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 md:p-6 shadow-sm space-y-4">
                  <p className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap text-slate-100">
                    {q.question}
                  </p>

                  {/* ========================================== */}
                  {/* 【完全網羅】問題別 必須データテーブル構造のHTML再現 */}
                  {/* ========================================== */}

                  {/* 1. 問題5：指標と空欄A~D対応表 */}
                  {q.id === 5 && q.matrix && (
                    <div className="my-4 max-w-md mx-auto border border-slate-700 rounded-xl overflow-hidden text-xs shadow-md">
                      <table className="w-full text-left border-collapse bg-slate-900">
                        <thead>
                          <tr className="bg-slate-700/50 border-b border-slate-700 text-slate-300">
                            <th className="p-3 font-bold">指標</th>
                            <th className="p-3 font-bold text-center w-36">記号（空欄）</th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.matrix.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                              <td className="p-3 font-medium text-slate-200">{row.metric}</td>
                              <td className="p-3 text-center font-mono font-bold text-indigo-400">{row.key}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 2. 問題3：財務分析用B/S */}
                  {q.bsTable && (
                    <div className="my-6 border border-slate-700 rounded-xl overflow-hidden text-xs shadow-md">
                      <div className="bg-slate-700 text-center font-bold py-2 text-slate-200 border-b border-slate-600">
                        {q.bsTable.title}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse bg-slate-900 min-w-[500px]">
                          <thead>
                            <tr className="bg-slate-800/60 border-b border-slate-700 text-slate-400">
                              <th className="p-2 border-r border-slate-700 w-1/2">資産の部</th>
                              <th className="p-2 w-1/2">負債・純資産の部</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: Math.max(q.bsTable.left.length, q.bsTable.right.length) }).map((_, idx) => {
                              const l = q.bsTable.left[idx] || { name: "", val: "" };
                              const r = q.bsTable.right[idx] || { name: "", val: "" };
                              return (
                                <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/20 font-mono">
                                  <td className="p-2 border-r border-slate-700 flex justify-between">
                                    <span className="whitespace-pre">{l.name}</span>
                                    <span className="text-indigo-300">{l.val !== "" ? l.val.toLocaleString() : ""}</span>
                                  </td>
                                  <td className="p-2 flex justify-between">
                                    <span className="whitespace-pre">{r.name}</span>
                                    <span className="text-emerald-300">{r.val !== "" ? r.val.toLocaleString() : ""}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 3. 問題3 & 問題12：財務諸表P/L要旨データ */}
                  {q.plTable && (
                    <div className="my-6 max-w-sm mx-auto border border-slate-700 rounded-xl overflow-hidden text-xs shadow-md">
                      <div className="bg-slate-700 text-center font-bold py-2 text-slate-200 border-b border-slate-600">
                        損益計算書（要旨）
                      </div>
                      <table className="w-full text-left border-collapse bg-slate-900 font-mono">
                        <tbody>
                          {q.plTable.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-800 flex justify-between p-2 hover:bg-slate-800/20">
                              <td className="text-slate-300">{item.name}</td>
                              <td className="text-indigo-400 font-bold">{item.val.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {q.notes && (
                        <div className="bg-slate-950 p-3 text-[11px] text-slate-400 space-y-1 font-sans border-t border-slate-800">
                          <div className="font-bold text-slate-300 mb-1">【注記・達成条件】</div>
                          {q.notes.map((n, i) => <div key={i}>{n}</div>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. 問題4 & 問題9：企業分析個別情報リスト */}
                  {q.dataValues && (
                    <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 max-w-xl mx-auto text-xs bg-slate-900 p-4 rounded-xl border border-slate-700 font-mono shadow-md">
                      <div className="col-span-1 sm:col-span-2 font-bold text-slate-400 font-sans mb-1">【Ａ社関連財務データ資料】</div>
                      {q.dataValues.map((d, idx) => (
                        <div key={idx} className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-400">{d.name}</span>
                          <span className="text-slate-200 font-bold">{d.val}</span>
                        </div>
                      ))}
                      {q.unit && (
                        <div className="col-span-1 sm:col-span-2 text-[10px] text-slate-500 text-right font-sans pt-1">
                          {q.unit}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. 問題6：基本安全性分析対象B/S */}
                  {q.bsData && (
                    <div className="my-6 border border-slate-700 rounded-xl overflow-hidden text-xs shadow-md">
                      <div className="bg-slate-700 text-center font-bold py-2 text-slate-200 border-b border-slate-600">
                        貸借対照表 {q.unit || ""}
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
                              <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/20 font-mono">
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

                  {/* 6. 問題7：2社並列大規模比較貸借対照表マトリックス */}
                  {q.bsComparisonTable && (
                    <div className="my-6 border border-slate-700 rounded-xl overflow-hidden text-xs shadow-md">
                      <div className="bg-slate-700 text-center font-bold py-2 text-slate-200 border-b border-slate-600">
                        貸借対照表 ２社比較 {q.unit || ""}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse bg-slate-900 min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-800 border-b border-slate-700 text-slate-400 font-medium">
                              <th className="p-2 border-r border-slate-700">資産の部</th>
                              <th className="p-2 text-right font-mono border-r border-slate-700 w-20">A社</th>
                              <th className="p-2 text-right font-mono border-r border-slate-700 w-20">B社</th>
                              <th className="p-2 border-r border-slate-700">負債・純資産の部</th>
                              <th className="p-2 text-right font-mono border-r border-slate-700 w-20">A社</th>
                              <th className="p-2 text-right font-mono w-20">B社</th>
                            </tr>
                          </thead>
                          <tbody>
                            {q.bsComparisonTable.rows.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-800/80 hover:bg-slate-800/20 font-mono">
                                <td className="p-2 border-r border-slate-700 text-slate-300">{row[0]}</td>
                                <td className="p-2 text-right text-indigo-300 border-r border-slate-700">{row[1]?.toLocaleString()}</td>
                                <td className="p-2 text-right text-indigo-400 border-r border-slate-700">{row[2]?.toLocaleString()}</td>
                                <td className="p-2 border-r border-slate-700 text-slate-300">{row[3]}</td>
                                <td className="p-2 text-right text-emerald-300 border-r border-slate-700">{row[4]?.toLocaleString()}</td>
                                <td className="p-2 text-right text-emerald-400">{row[5]?.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 7. 問題9 & 問題11：実績値原価データ等 */}
                  {q.calcTable && (
                    <div className="my-4 max-w-md mx-auto text-xs bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-1.5 shadow-md">
                      <div className="font-bold text-slate-400 mb-1">【計算根拠用 実績データ情報】</div>
                      {q.calcTable.map((item, idx) => (
                        <div key={idx} className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-300">{item.item}</span>
                          <span className="text-slate-100 font-mono font-bold">{item.value}</span>
                        </div>
                      ))}
                      {q.extraInfo && (
                        <div className="text-[11px] text-slate-500 pt-1 font-sans">
                          {q.extraInfo}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 8. 問題13：直接原価計算構造の出題時プレビュー */}
                  {q.id === 13 && q.segmentFlow && (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-xs font-mono max-w-md mx-auto shadow-md">
                      <div className="font-sans font-bold text-slate-400 mb-2">【セグメント別階層構造体系】</div>
                      {q.segmentFlow.map((line, idx) => (
                        <div key={idx} className={line.startsWith('＝') ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                          {line}
                        </div>
                      ))}
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
                        <div className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center shrink-0 border text-xs ${
                          selectedAnswer === opt.key ? "bg-indigo-600 text-white border-transparent" : "bg-slate-900 text-slate-400 border-slate-700"
                        }`}>
                          {opt.key}
                        </div>
                        <span className="leading-relaxed pt-0.5">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action Controls Section */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleReturnHome}
                    className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    中断してメニューに戻る
                  </button>

                  {!isAnswered ? (
                    <button
                      disabled={!selectedAnswer}
                      onClick={handleSubmitAnswer}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-bold text-white rounded-xl text-sm shadow-md transition-all"
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

                {/* --- Solution Commentary Canvas Block --- */}
                {isAnswered && (
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 md:p-6 space-y-4 shadow-inner">
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
                            <span>不正解 (正解： {q.answer})</span>
                          </div>
                        )}
                      </div>
                      
                      <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">
                        <input
                          type="checkbox"
                          checked={userRecords[q.id]?.isReview || false}
                          onChange={() => toggleReviewFlag(q.id)}
                          className="w-4 h-4 accent-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-0"
                        />
                        <span>この問題を「要復習」としてマイリストにストック</span>
                      </label>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1.5">解説</h4>
                      <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                        {q.explanation}
                      </p>
                    </div>

                    {/* 解説用補助コンポーネント（定義されていればレンダリング） */}
                    {q.tableData && (
                      <div className="overflow-x-auto text-xs bg-slate-900 p-3 rounded-xl border border-slate-700">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-800">
                              <th className="pb-1.5 w-1/4">分析分類</th>
                              <th className="pb-1.5">目的と経営指標の対応意味</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-300">
                            {q.tableData.map((t, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/10">
                                <td className="py-2 font-bold text-slate-200">{t.type}</td>
                                <td className="py-2 text-slate-300 leading-relaxed">{t.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {q.formulas && (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-400 mb-1">【本問に関する計算公式まとめ】</div>
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
                              <th className="p-2">分析指標</th>
                              <th className="p-2 font-mono text-right">A社数値</th>
                              <th className="p-2 font-mono text-right">B社数値</th>
                              <th className="p-2 text-center">良好判定</th>
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

                    {q.costType && (
                      <div className="text-xs bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3 space-y-2">
                        <div className="font-bold text-slate-400 mb-1">【費用の分解性質パターン】</div>
                        {q.costType.map((ct, idx) => (
                          <div key={idx} className="border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between text-slate-200 font-bold">
                              <span>{ct.name}</span>
                              <span className="text-indigo-400 font-normal text-[11px]">{ct.behavior}</span>
                            </div>
                            <div className="text-slate-400 text-[11px] mt-0.5">具体例: {ct.examples}</div>
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

        {/* --- VIEW: Full Progress Status History Table --- */}
        {currentView === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <List className="w-5 h-5 text-indigo-400" />
                <span>全13問 習得状況一覧</span>
              </h2>
              <button
                onClick={() => setCurrentView("menu")}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-1.5 rounded-xl transition-colors"
              >
                メニューに戻る
              </button>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-700/50 text-slate-400 font-medium border-b border-slate-700">
                      <th className="p-3 w-16 text-center">No</th>
                      <th className="p-3 w-40">カテゴリ区分</th>
                      <th className="p-3">論点課題名</th>
                      <th className="p-3 text-center w-28">前回の正誤</th>
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
                            <span className="bg-slate-900 px-2 py-0.5 rounded text-[11px] font-medium text-indigo-300 border border-slate-700 block text-center truncate">
                              {q.category}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-200">{q.title}</td>
                          <td className="p-3 text-center">
                            {record ? (
                              record.isCorrect ? (
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">正解クリア</span>
                              ) : (
                                <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md font-bold">要再挑戦</span>
                              )
                            ) : (
                              <span className="text-xs bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800">未挑戦</span>
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
          </div>
        )}

        {/* --- VIEW: Recharts Analytics Insights Dashboard --- */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>習得指標アナリティクス</span>
              </h2>
              <button
                onClick={() => setCurrentView("menu")}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-1.5 rounded-xl transition-colors"
              >
                メニューに戻る
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Pie Component */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold text-slate-300 mb-4 text-center">全13問 正解シェア率</h3>
                {(() => {
                  const stats = getTotalStats();
                  const data = [
                    { name: "正解済", value: stats.correctCount, color: "#10b981" },
                    { name: "未クリア", value: stats.remainingCount, color: "#334155" }
                  ];
                  return (
                    <div className="w-full h-44 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center">
                        <div className="text-2xl font-black text-emerald-400">{stats.correctCount}</div>
                        <div className="text-[10px] text-slate-400">/ {stats.totalQuestions} 問クリア</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bar Metric Charts Component */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm md:col-span-2">
                <h3 className="text-xs font-bold text-slate-300 mb-4">章内・論点カテゴリ別の習得状況</h3>
                <div className="w-full h-44 text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDashboardData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center max-w-xl mx-auto space-y-2 shadow-md">
              <h3 className="font-bold text-sm text-slate-100">財務・会計（経営分析）対策アドバイス</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                経営指標の分解ロジックやCVPの固変分解条件は、二次試験（事例IV）で高配点問題として記述を求められます。画面上の資料データをノート等に書き写し、電卓を叩いて自力で数値を導き出せるまで反復トレーニングを行いましょう。
              </p>
              <button
                onClick={() => setCurrentView("menu")}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-white font-medium transition-all shadow-md"
              >
                ダッシュボードを閉じてメニューへ
              </button>
            </div>

          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <p>© 2026 中小企業診断士 一次・二次試験対策スマート問題集 / Secured Framework on Firebase Node.</p>
      </footer>
    </div>
  );
}