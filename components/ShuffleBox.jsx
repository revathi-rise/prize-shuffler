"use client";
import { useState, useRef, useEffect } from "react";

export default function ShuffleBox({
  // initialNumbers: array of numbers that map to items by index (e.g. [10,20,30])
  initialNumbers = [10, 20, 30],
}) {
  // numbers shown at top and shuffled during "Shuffle Numbers"
  const [numbers, setNumbers] = useState(() => initialNumbers.slice());
  // prizes store the final selected numbers (null until picked)
  const [prizes, setPrizes] = useState({ first: null, second: null, third: null });
  // spin display while picking (shows numbers)
  const [spinValue, setSpinValue] = useState({ first: null, second: null, third: null });
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [prizesPicked, setPrizesPicked] = useState(false);

  const spinIntervals = useRef({});
  const pickTimeouts = useRef([]);

  useEffect(() => {
    return () => {
      Object.values(spinIntervals.current).forEach((id) => id && clearInterval(id));
      pickTimeouts.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Fisher-Yates shuffle
  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const handleShuffleNumbers = () => {
    if (isShuffling || isPicking) return;
    setIsShuffling(true);
    // short visual delay then shuffle
    const t = setTimeout(() => {
      setNumbers((prev) => shuffleArray(prev));
      setIsShuffling(false);
    }, 600);
    pickTimeouts.current.push(t);
  };

  // pick final numbers from the current numbers array (unique if possible)
  function pickFinalPrizesFromNumbers(nums) {
  if (nums.length === 0) return [null, null, null];

  // If 3 or more numbers → shuffle & take first 3
  if (nums.length >= 3) {
    const shuffled = [...nums].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1], shuffled[2]];
  }

  // If less than 3 numbers → allow repeats
  const prizes = [];
  for (let i = 0; i < 3; i++) {
    const r = Math.floor(Math.random() * nums.length);
    prizes.push(nums[r]);
  }
  return prizes;
}

  const startSpinningDisplay = () => {
    const pool = numbers.length ? numbers : [0];
    const keys = ["first", "second", "third"];
    keys.forEach((k, i) => {
      // slightly different speeds
      const speed = 60 + i * 30;
      spinIntervals.current[k] = setInterval(() => {
        setSpinValue((s) => ({
          ...s,
          [k]: pool[Math.floor(Math.random() * pool.length)],
        }));
      }, speed);
    });
  };

  const stopSpinAndSet = (key, value) => {
    clearInterval(spinIntervals.current[key]);
    spinIntervals.current[key] = null;
    setSpinValue((s) => ({ ...s, [key]: value }));
    setPrizes((p) => ({ ...p, [key]: value }));
  };

  const handlePickPrizes = () => {
    if (isPicking || isShuffling || prizesPicked) return;
    setIsPicking(true);
    setPrizes({ first: null, second: null, third: null });
    setSpinValue({ first: null, second: null, third: null });
    startSpinningDisplay();

    const final = pickFinalPrizesFromNumbers(numbers);

    // reveal order: third -> second -> first (staggered)
    const t1 = setTimeout(() => stopSpinAndSet("third", final[2]), 2000);
    const t2 = setTimeout(() => stopSpinAndSet("second", final[1]), 3500);
    const t3 = setTimeout(() => {
      stopSpinAndSet("first", final[0]);
      setIsPicking(false);
      setPrizesPicked(true);
    }, 5000);

    pickTimeouts.current.push(t1, t2, t3);
  };

  const handleSaveResults = () => {
    if (!prizesPicked) return;

    console.log("Save results:", { prizes, numbers, prizeNames: {
      first: numberToPrize[prizes.first] ?? null,
      second: numberToPrize[prizes.second] ?? null,
      third: numberToPrize[prizes.third] ?? null,
    }});
    // provide quick UI feedback
    alert("Results saved (console logged).");
  };

  const handleReset = () => {
    // cleanup
    Object.values(spinIntervals.current).forEach((id) => id && clearInterval(id));
    pickTimeouts.current.forEach((t) => clearTimeout(t));
    spinIntervals.current = {};
    pickTimeouts.current = [];

    setPrizes({ first: null, second: null, third: null });
    setSpinValue({ first: null, second: null, third: null });
    setIsPicking(false);
    setPrizesPicked(false);
    setNumbers(initialNumbers.slice());
  };

  return (
    <div className="bg-white shadow rounded-lg p-8">
      {/* Top number badges */}
      <div className="flex justify-center gap-12 mb-8">
        {numbers.map((num, idx) => (
          <div
            key={idx}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-xl
              ${isShuffling ? "bg-red-500 animate-pulse" : "bg-indigo-600"}
            `}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={handleShuffleNumbers}
            disabled={isShuffling || isPicking}
            className={`px-8 py-3 rounded-full text-lg font-semibold transition shadow-md
              ${isShuffling || isPicking ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}
            `}
          >
            {isShuffling ? "SHUFFLING..." : "Shuffle Numbers"}
          </button>

          <button
            onClick={handlePickPrizes}
            disabled={isPicking || isShuffling || prizesPicked}
            className={`px-8 py-3 rounded-full text-lg font-semibold transition shadow-md
              ${isPicking || isShuffling || prizesPicked ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-yellow-500 text-gray-800 hover:bg-yellow-600"}
            `}
          >
            {isPicking ? "PICKING..." : (prizesPicked ? "Prizes Selected" : "Pick Prizes")}
          </button>
        </div>

        <button
          onClick={handleSaveResults}
          disabled={!prizesPicked}
          className={`mt-2 px-10 py-3 rounded-full text-lg font-semibold transition shadow-md
            ${prizesPicked ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-600 cursor-not-allowed"}
          `}
        >
          Save Results
        </button>
      </div>

      {/* Results header */}
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6 border-b pb-3">Results</h2>

      {/* Prize cards: show number (big) and mapped prize name (small) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["first", "second", "third"].map((key) => {
          const displayedNumber = isPicking && spinValue[key] != null ? spinValue[key] : prizes[key] == null ? null : prizes[key];

          return (
            <div key={key} className="p-6 rounded-lg border border-dashed border-gray-200 bg-gray-50">
              <div className="text-sm font-semibold text-gray-600 mb-4 uppercase">
                {key === "first" ? "FIRST PRIZE" : key === "second" ? "SECOND PRIZE" : "THIRD PRIZE"}
              </div>

              <div className="text-6xl font-extrabold text-gray-700 mb-2">
                {displayedNumber == null ? <span className="text-gray-400">?</span> : <span className="text-indigo-600">{displayedNumber}</span>}
              </div>

              
            </div>
          );
        })}
      </div>

      {/* Small controls area */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
