function DotsLoader() {
  return (
    <>
      <style>{`
        @keyframes jump1 { 0%,100%{transform:translateY(0)} 16.66%{transform:translateY(-8px)} }
        @keyframes jump2 { 0%,100%{transform:translateY(0)} 33.33%{transform:translateY(-8px)} }
        @keyframes jump3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400 block" style={{ animation: "jump1 1.2s ease-in-out infinite" }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 block" style={{ animation: "jump2 1.2s ease-in-out infinite" }} />
        <span className="w-2 h-2 rounded-full bg-gray-400 block" style={{ animation: "jump3 1.2s ease-in-out infinite" }} />
      </span>
    </>
  );
}

export default DotsLoader;