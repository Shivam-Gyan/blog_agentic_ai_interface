type ButtonProps = {
    children?: React.ReactNode;
    handlefunc: () => void;
    state?: any;
    text?: string;
}

const UseButtonComponent = ({ children, handlefunc, state, text }: ButtonProps) => {
    return (
        <div className="flex items-center gap-1.5 text-[11px]">

            <button
                onClick={handlefunc}
                className="p-1.5  rounded-md text-gray-400 hover:text-gray-600 
      hover:bg-gray-100 transition-colors"
            >
                {children}
            </button>
            {state && <span className="text-green-600">{text}</span>}
        </div>
    );
}

export default UseButtonComponent;